export default class Level4 extends Phaser.Scene {
  constructor() {
    super({
      key: "Level4"
    })
  }

  preload() {
    this.load.audio('bgmusic', ['assets/sounds/sinisterloop.wav']);
    this.load.audio('death', ['assets/sounds/death2.wav']);
    this.load.audio('coin', ['assets/sounds/coin.wav']);
    this.load.audio('jump', ['assets/sounds/jump.wav']);
    this.load.image('dungeon-tiles', 'assets/tiles/ForgottenDungeon.png');
    this.load.tilemapTiledJSON('map4', '/assets/tiles/level4.json');
    this.load.atlas('knight', 'assets/sprites/knight.png', 'assets/sprites/knight.json');
    this.load.atlas('loot', 'assets/sprites/loot.png', 'assets/sprites/loot.json');
    this.load.atlas('sword', 'assets/sprites/sword.png', 'assets/sprites/sword.json');
    this.load.atlas('katana', 'assets/sprites/katana.png', 'assets/sprites/katana.json');
    this.load.atlas('imp', 'assets/sprites/imp.png', 'assets/sprites/imp.json');
    this.load.atlas('skel', 'assets/sprites/skeleton.png', 'assets/sprites/skeleton.json');
  }

  create() {
    // Music
    // this.bgmusic = this.sound.add('bgmusic').setVolume(0.3).play();
    this.deathSound = this.sound.add('death').setVolume(0.5);
    this.lootSound = this.sound.add('coin').setVolume(0.5);
    this.jumpSound = this.sound.add('jump').setVolume(0.3);

    // Create map from Tiled
    this.map = this.make.tilemap({
      key: 'map4',
      tileWidth: 16,
      tileHeight: 16
    });

    // Object Layers
    this.spawnPoint = this.map.findObject("Spawns", obj => obj.name === "enter");
    this.lootSpawn = this.map.findObject("Spawns", obj => obj.name === "loot");
    this.group1Spawn = this.map.findObject("Spawns", obj => obj.name === "group1");
    this.group2Spawn = this.map.findObject("Spawns", obj => obj.name === "group2");
    this.group3Spawn = this.map.findObject("Spawns", obj => obj.name === "group3");
    this.group4Spawn = this.map.findObject("Spawns", obj => obj.name === "group4");

    // Tile Layers
    const tileset = this.map.addTilesetImage('Dungeon-Tileset', 'dungeon-tiles');
    const bg = this.map.createStaticLayer('Background', tileset, 0, 0);
    this.terrain = this.map.createStaticLayer('Terrain', tileset, 0, 0);
    this.platforms = this.map.createStaticLayer('Platforms', tileset, 0, 0);
    this.ledges = this.map.createStaticLayer('Ledges', tileset, 0, 0);
    this.platforms.setCollisionByProperty({
      collides: true
    });
    this.ledges.setCollisionByProperty({
      collides: true
    });
    this.terrain.setCollisionByProperty({
      collides: true
    });

    // Sprites
    this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'knight', 'knight_idle02.png');
    this.loot = this.physics.add.sprite(this.lootSpawn.x, this.lootSpawn.y, 'loot', 'chest_full01.png');
    this.imps = this.physics.add.group({
      key: 'imp',
      repeat: 4,
      setXY: {
        x: this.group1Spawn.x,
        y: this.group1Spawn.y,
        stepX: 32,
        stepY: -32
      }
    });
    this.katanas = this.physics.add.group({
      key: 'katana',
      repeat: 2,
      setXY: {
        x: this.group2Spawn.x,
        y: this.group2Spawn.y,
        stepX: 48,
        stepY: 0
      }
    });
    this.skeles = this.physics.add.group({
      key: 'skel',
      repeat: 2,
      setXY: {
        x: this.group3Spawn.x,
        y: this.group3Spawn.y,
        stepX: 110,
        stepY: -48
      }
    });
    this.swords = this.physics.add.group({
      key: 'sword',
      repeat: 2,
      setXY: {
        x: this.group4Spawn.x,
        y: this.group4Spawn.y,
        stepX: 64,
        stepY: 0
      }  
    });

    // Collisions
    this.world = this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.add.collider(this.platforms, this.player, () => this.resetJumpCount(), null, this);
    this.physics.add.collider(this.ledges, this.player, () => this.grabLedge(), null, this);
    this.physics.add.collider(this.terrain, this.player);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.platforms, this.loot);
    this.physics.add.collider(this.platforms, this.imps);
    this.physics.add.collider(this.platforms, this.skeles);
    this.physics.add.collider(this.platforms, this.swords);
    this.physics.add.collider(this.loot, this.player, () => this.lootOpen(), null, this);
    this.physics.add.collider(this.player, this.imps, () => this.death(), null, this);
    this.physics.add.collider(this.player, this.skeles, () => this.death(), null, this);
    this.physics.add.collider(this.player, this.swords, () => this.death(), null, this);
    this.physics.add.collider(this.player, this.katanas, () => this.death(), null, this);
    this.loot.setImmovable();
    this.jumpCount = 0;
    this.maxJump = 2;

    // Animations
    this.anims.create({
      key: 'walk',
      repeat: -1,
      frameRate: 10,
      frames: this.anims.generateFrameNames('knight', {
        prefix: 'knight_run',
        suffix: '.png',
        start: 1,
        end: 4,
        zeroPad: 2
      })
    });
    this.anims.create({
      key: 'idle',
      delay: 1000,
      repeat: -1,
      frameRate: 5,
      frames: this.anims.generateFrameNames('knight', {
        prefix: 'knight_idle',
        suffix: '.png',
        start: 1,
        end: 4,
        zeroPad: 2
      })
    });
    this.anims.create({
      key: 'open',
      repeat: 1,
      frameRate: 10,
      frames: this.anims.generateFrameNames('loot', {
        prefix: 'chest_full',
        suffix: '.png',
        start: 1,
        end: 3,
        zeroPad: 2
      })
    });
    this.anims.create({
      key: 'imp_walk',
      repeat: -1,
      frameRate: 10,
      frames: this.anims.generateFrameNames('imp', {
        prefix: 'imp_run',
        suffix: '.png',
        start: 1,
        end: 4,
        zeroPad: 2
      })
    });
    this.anims.create({
      key: 'skel_walk',
      repeat: -1,
      frameRate: 10,
      frames: this.anims.generateFrameNames('skel', {
        prefix: 'skelet_run',
        suffix: '.png',
        start: 1,
        end: 4,
        zeroPad: 2
      })
    });
    this.skeles.getChildren().forEach(child => {
      child.play('skel_walk').setImmovable();
      let speed = 1000 + Math.random() * (4000 - 1000);
      let dist = 20 + Math.random() * (40 - 20);
      this.tweens.add({
        targets: child,
        x: `+=${dist}`,
        ease: 'Linear',
        duration: speed,
        flipX: true,
        yoyo: true,
        repeat: -1
      });
    });
    this.katanas.getChildren().forEach(child => {
      child.setCollideWorldBounds(true).setImmovable();
      let speed = 1000 + Math.random() * (4000 - 1000);
      let dist = (40 + Math.random() * (150 - 40)) * -1;
      this.tweens.add({
        targets: child,
        y: `+=${dist}`,
        ease: 'Linear',
        duration: speed,
        // flipY: true,
        yoyo: true,
        repeat: -1
      });
    });
    this.imps.getChildren().forEach(child => {
      child.play('imp_walk');
      let speed = 1000 + Math.random() * (4000 - 1000);
      let dist = 5 + Math.random() * (7 - 5);
      this.tweens.add({
        targets: child,
        x: `+=${dist}`,
        ease: 'Linear',
        duration: speed,
        flipX: true,
        yoyo: true,
        repeat: -1
      });
    });
    this.swords.getChildren().forEach(child => {
      child.setCollideWorldBounds(true).setImmovable();
      let speed = 1000 + Math.random() * (4000 - 1000);
      let dist = (50 + Math.random() * (100 - 50)) * -1;
      this.tweens.add({
        targets: child,
        y: `+=${dist}`,
        ease: 'Linear',
        duration: speed,
        // flipY: true,
        yoyo: true,
        repeat: -1
      });
    });

    // Inputs WASD or Arrows and Space 
    this.input.enabled = true;
    this.keys = this.input.keyboard.addKeys('W, A, S, D, LEFT, RIGHT, UP, DOWN, SPACE');

    // Camera set to follow player
    this.camera = this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.camera.startFollow(this.player).fadeIn(2000);

    this.grabLoot = false;
  }

  update() {
    if (this.keys.A.isDown || this.keys.LEFT.isDown) {
      this.player.flipX = true;
      this.player.setVelocityX(-75);
      this.player.play('walk', true);
    } else if (this.keys.D.isDown || this.keys.RIGHT.isDown) {
      if (this.player.flipX) {
        this.player.flipX = false;
      }
      this.player.setVelocityX(75);
      this.player.play('walk', true);
    } else if (this.keys.S.isDown || this.keys.DOWN.isDown) {
      this.player.setVelocityY(75);
    } else {
      this.player.setVelocityX(0);
      this.player.play('idle', true);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.UP) || Phaser.Input.Keyboard.JustDown(this.keys.W)) {
      if (this.jumpCount < this.maxJump) {
        if (this.jumpCount == 0) {
          this.jumpCount++;
          this.player.setVelocityY(-130);
        } else {
          this.jumpCount++;
          this.player.setVelocityY(-115);
        }
        this.jumpSound.play();
      }
    }
    if (this.player.body.bottom >= this.world.bounds.bottom) {
      this.death();
    }
    if (this.grabLoot) {
      this.scene.start('End');
    }
  }

  resetJumpCount() {
    this.jumpCount = 0;
  }

  grabLedge() {
    if (this.jumpCount > 0) {
      this.jumpCount = 1;
    }
  }

  lootOpen() {
    this.loot.play('open', true);
    this.lootSound.play();
    setTimeout(() => this.grabLoot = true, 1000);
  }

  death() {
    this.deathSound.play();
    this.restartScene();
  }

  restartScene() {
    this.scene.restart();
  }
}