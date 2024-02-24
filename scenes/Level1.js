export default class Level1 extends Phaser.Scene {
  constructor() {
    super({
      key: "Level1"
    })
  }

  preload() {
    this.load.audio('bgmusic', ['/sounds/sinisterloop.wav']);
    this.load.audio('death', ['/sounds/death2.wav']);
    this.load.audio('coin', ['/sounds/coin.wav']);
    this.load.audio('jump', ['/sounds/jump.wav']);
    this.load.image('dungeon-tiles', '/tiles/ForgottenDungeon.png');
    this.load.tilemapTiledJSON('map', '/tiles/level1.json');
    this.load.atlas('knight', '/sprites/knight.png', '/sprites/knight.json');
    this.load.atlas('loot', '/sprites/loot.png', '/sprites/loot.json');
    this.load.atlas('imp', '/sprites/imp.png', '/sprites/imp.json');
  }

  create() {
    // Sounds
    if (this.musicIsPlaying) {
      this.musicIsPlaying = false;
    } else {
      this.bgmusic = this.sound.add('bgmusic').setVolume(0.25).setLoop(true);
      this.bgmusic.play();
    }
    this.deathSound = this.sound.add('death').setVolume(0.25);
    this.lootSound = this.sound.add('coin').setVolume(0.3);
    this.jumpSound = this.sound.add('jump').setVolume(0.15);
    // Create map from Tiled
    this.map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16
    });

    // Object Layers
    this.spawnPoint = this.map.findObject("Spawns", obj => obj.name === "enter");
    this.lootSpawn = this.map.findObject("Spawns", obj => obj.name === "loot");
    this.enemySpawn = this.map.findObject("Spawns", obj => obj.name === "enemy");

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

    // Sprites & Groups
    this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'knight', 'knight_idle02.png');
    this.loot = this.physics.add.sprite(this.lootSpawn.x, this.lootSpawn.y, 'loot', 'chest_full01.png');
    this.enemies = this.physics.add.group({
      key: 'imp',
      repeat: 3,
      setXY: {
        x: this.enemySpawn.x,
        y: this.enemySpawn.y,
        stepX: 112,
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
    this.physics.add.collider(this.loot, this.player, () => this.lootGrab(), null, this);
    this.physics.add.collider(this.platforms, this.enemies);
    this.physics.add.collider(this.ledges, this.enemies);
    this.physics.add.collider(this.enemies, this.player, () => this.death(), null, this);
    this.loot.setImmovable();
    this.jumpCount = 0;
    this.maxJump = 2;

    // Tutorial Text
    this.make.text({
      x: 20,
      y: 200,
      text: 'wasd or arrows to move',
      style: {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        align: 'center',
        shadow: {
          color: '#000000',
          fill: true,
          offsetX: 2,
          offsetY: 2,
        }
      }
    });
    this.make.text({
      x: 60,
      y: 220,
      text: 'space to jump',
      style: {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        align: 'center',
        shadow: {
          color: '#000000',
          fill: true,
          offsetX: 2,
          offsetY: 2,
        }
      }
    });
    this.make.text({
      x: 285,
      y: 200,
      text: 'double jump for big gaps',
      style: {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        align: 'center',
        shadow: {
          color: '#000000',
          fill: true,
          offsetX: 2,
          offsetY: 2,
        }
      }
    });

    this.make.text({
      x: 550,
      y: 110,
      text: 'jump to grab ledges',
      style: {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        align: 'center',
        shadow: {
          color: '#000000',
          fill: true,
          offsetX: 2,
          offsetY: 2,
        }
      }
    });
    this.make.text({
      x: 850,
      y: 200,
      text: 'avoid enemies',
      style: {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        align: 'center',
        shadow: {
          color: '#000000',
          fill: true,
          offsetX: 2,
          offsetY: 2,
        }
      }
    });
    this.make.text({
      x: 1460,
      y: 120,
      text: 'grab the loot',
      style: {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        align: 'center',
        shadow: {
          color: '#000000',
          fill: true,
          offsetX: 2,
          offsetY: 2,
        }
      }
    });

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
    // Anims and Tweens for All enemies
    this.enemies.getChildren().forEach(child => {
      child.play('imp_walk').setImmovable();
      this.tweens.add({
        targets: child,
        x: '+=43',
        ease: 'Linear',
        duration: 3000,
        flipX: true,
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
      this.scene.start('Level2');
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

  lootGrab() {
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
    this.musicIsPlaying = true;
  }
}