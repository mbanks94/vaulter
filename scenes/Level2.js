export default class Level2 extends Phaser.Scene {
  constructor() {
    super({
      key: 'Level2'
    });
  }

  preload() {
    this.load.audio('bgmusic', ['/sounds/sinisterloop.wav']);
    this.load.audio('death', ['/sounds/death2.wav']);
    this.load.audio('coin', ['/sounds/coin.wav']);
    this.load.audio('jump', ['/sounds/jump.wav']);
    this.load.image('dungeon-tiles', '/tiles/ForgottenDungeon.png');
    this.load.tilemapTiledJSON('map2', '/tiles/level2.json');
    this.load.atlas('knight', '/sprites/knight.png', '/sprites/knight.json');
    this.load.atlas('loot', '/sprites/loot.png', '/sprites/loot.json');
    this.load.atlas('mimic', '/sprites/mimic.png', '/sprites/mimic.json');
    this.load.atlas('zom', '/sprites/tinyZom.png', '/sprites/tinyZom.json');
    this.load.atlas('skel', '/sprites/skeleton.png', '/sprites/skeleton.json');
    this.load.atlas('rustySword', '/sprites/rustySword.png', '/sprites/rustySword.json');
    this.load.atlas('katana', '/sprites/katana.png', '/sprites/katana.json');
  }

  create() {
    this.deathSound = this.sound.add('death').setVolume(0.5);
    this.lootSound = this.sound.add('coin').setVolume(0.5);
    this.jumpSound = this.sound.add('jump').setVolume(0.3);

    // Create map from Tiled
    const map = this.make.tilemap({
      key: 'map2',
      tileWidth: 16,
      tileHeight: 16
    });

    // Object Layers
    this.spawnPoint = map.findObject("Spawns", obj => obj.name === "enter");
    this.lootSpawn = map.findObject("Spawns", obj => obj.name === "loot");
    this.group1Spawn = map.findObject("Spawns", obj => obj.name === "group1");
    this.group2Spawn = map.findObject("Spawns", obj => obj.name === "group2");
    this.mimicSpawn = map.findObject("Spawns", obj => obj.name === "mimic");
    this.group3Spawn = map.findObject("Spawns", obj => obj.name === "group3");
    this.skelSpawn = map.findObject("Spawns", obj => obj.name === "enemy");
    this.skel2Spawn = map.findObject("Spawns", obj => obj.name === "enemy2");

    // Tile Layers
    const tileset = map.addTilesetImage('Dungeon-Tileset', 'dungeon-tiles');
    const bg = map.createStaticLayer('Background', tileset, 0, 0);
    this.terrain = map.createStaticLayer('Terrain', tileset, 0, 0);
    this.platforms = map.createStaticLayer('Platforms', tileset, 0, 0);
    this.ledges = map.createStaticLayer('Ledges', tileset, 0, 0);
    this.platforms.setCollisionByProperty({
      collides: true
    });
    this.ledges.setCollisionByProperty({
      collides: true
    });
    this.terrain.setCollisionByProperty({
      collides: true
    });

    // Sprites and Groups
    this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'knight', 'knight_idle02.png');
    this.loot = this.physics.add.sprite(this.lootSpawn.x, this.lootSpawn.y, 'loot', 'chest_full01.png');
    this.mimic = this.physics.add.sprite(this.mimicSpawn.x, this.mimicSpawn.y, 'mimic', 'mimic_open01.png');
    this.skel = this.physics.add.sprite(this.skelSpawn.x, this.skelSpawn.y, 'skel', 'skelet_idle01.png');
    this.skel2 = this.physics.add.sprite(this.skel2Spawn.x, this.skel2Spawn.y, 'skel', 'skelet_idle01.png');
    this.rustySwords = this.physics.add.group({
      key: 'rustySword',
      repeat: 1,
      setXY: {
        x: this.group1Spawn.x,
        y: this.group1Spawn.y - 40,
        stepX: 96,
        stepY: -20
      }
    });
    this.katanas = this.physics.add.group({
      key: 'katana',
      repeat: 1,
      setXY: {
        x: this.group2Spawn.x,
        y: this.group2Spawn.y - 100,
        stepX: 304,
        stepY: 0
      }
    });
    this.zoms = this.physics.add.group({
      key: 'zom',
      repeat: 3,
      setXY: {
        x: this.group3Spawn.x,
        y: this.group3Spawn.y,
        stepX: 65,
        stepY: 0
      }
    });


    // Collisions
    this.world = this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.add.collider(this.platforms, this.player, () => this.resetJumpCount(), null, this);
    this.physics.add.collider(this.ledges, this.player, () => this.grabLedge(), null, this);
    this.physics.add.collider(this.terrain, this.player);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.platforms, this.loot);
    this.physics.add.collider(this.loot, this.player, () => this.lootOpen(), null, this);
    this.physics.add.collider(this.platforms, this.mimic);
    this.physics.add.collider(this.platforms, this.zoms);
    this.physics.add.collider(this.ledges, this.zoms);
    this.physics.add.collider(this.mimic, this.player, () => this.mimicOpen(), null, this);
    this.physics.add.collider(this.platforms, this.skel);
    this.physics.add.collider(this.ledges, this.skel);
    this.physics.add.collider(this.platforms, this.skel2);
    this.physics.add.collider(this.ledges, this.skel2);
    this.physics.add.collider(this.player, this.skel, () => this.death(), null, this);
    this.physics.add.collider(this.player, this.skel2, () => this.death(), null, this);
    this.physics.add.collider(this.player, this.zoms, () => this.death(), null, this);
    this.loot.setImmovable();
    this.mimic.setImmovable();
    this.skel.setImmovable();
    this.jumpCount = 0;
    this.maxJump = 2;

    // Create Animations
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
      key: 'mimicOpen',
      repeat: -1,
      frameRate: 10,
      frames: this.anims.generateFrameNames('mimic', {
        prefix: 'mimic_open',
        suffix: '.png',
        start: 1,
        end: 3,
        zeroPad: 2
      })
    });
    this.anims.create({
      key: 'zom_walk',
      repeat: -1,
      frameRate: 10,
      frames: this.anims.generateFrameNames('zom', {
        prefix: 'tiny_z_run',
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
    this.skel.play('skel_walk');

    // Anims and Tweens for enemies
    this.tweens.add({
      targets: this.skel,
      x: '+=30',
      ease: 'Linear',
      duration: 2000,
      flipX: true,
      yoyo: true,
      repeat: -1
    });
    this.rustySwords.getChildren().forEach(child => {
      child.setCollideWorldBounds(true).setImmovable();
      this.tweens.add({
        targets: child,
        y: `-=80`,
        ease: 'Linear',
        duration: 2250,
        yoyo: true,
        repeat: -1
      });
    });
    this.katanas.getChildren().forEach(child => {
      child.setCollideWorldBounds(true).setImmovable();
      this.tweens.add({
        targets: child,
        y: `-=40`,
        ease: 'Linear',
        duration: 2500,
        yoyo: true,
        repeat: -1
      });
    });
    this.zoms.getChildren().forEach(child => {
      child.play('zom_walk').setImmovable();
      this.tweens.add({
        targets: child,
        x: `+=40`,
        ease: 'Linear',
        duration: 2500,
        flipX: true,
        yoyo: true,
        repeat: -1
      });
    });

    // create inputs
    this.input.enabled = true;
    this.keys = this.input.keyboard.addKeys('W, A, D, LEFT, RIGHT, UP, SPACE');

    // camera
    this.camera = this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
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
      this.scene.start('Level3');
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

  mimicOpen() {
    this.mimic.play('mimicOpen', true);
    setTimeout(()=>this.death(), 1000);
  }

  death() {
    this.deathSound.play();
    this.restartScene();
  }

  restartScene() {
    this.scene.restart();
  }
}