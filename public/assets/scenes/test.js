export default class Level1 extends Phaser.Scene {
  constructor() {
    super({
      key: 'Level1'
    });
  }
  preload() {
    this.load.audio('bgmusic', ['assets/sounds/sinisterloop.wav']);
    this.load.image('dungeon-tiles', 'assets/tiles/ForgottenDungeon.png');
    this.load.tilemapTiledJSON('map', '/assets/tiles/level1.json');
    this.load.atlas('knight', 'assets/sprites/knight.png', 'assets/sprites/knight.json');
    this.load.atlas('imp', 'assets/sprites/imp.png', 'assets/sprites/imp.json');
  }
  create() {
    this.bgmusic = this.sound.add('bgmusic').setVolume(0.3);
    // this.bgmusic.play();
    // Create map from Tiled
    const map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16
    });
    // Object Layers
    this.spawnPoint = map.findObject("Spawns", obj => obj.name === "enter");
    this.despawnPoint = map.findObject("Spawns", obj => obj.name === "exit");
    this.enemy1Spawn = map.findObject("Spawns", obj => obj.name === "enemy1");
    this.enemy2Spawn = map.findObject("Spawns", obj => obj.name === "enemy2");
    this.enemy3Spawn = map.findObject("Spawns", obj => obj.name === "enemy3");
    this.enemy4Spawn = map.findObject("Spawns", obj => obj.name === "enemy4");
    // Tile Layers
    const tileset = map.addTilesetImage('Dungeon-Tileset', 'dungeon-tiles');
    const bg = map.createStaticLayer('Background', tileset, 0, 0);
    this.terrain = map.createStaticLayer('Terrain', tileset, 0, 0);
    this.terrain.setCollisionByProperty({
      collides: true
    });
    // Sprites
    this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'knight', 'knight_idle02.png');
    this.enemy1 = this.physics.add.sprite(this.enemy1Spawn.x, this.enemy1Spawn.y, 'imp', 'imp_idle02.png');
    this.enemy2 = this.physics.add.sprite(this.enemy2Spawn.x, this.enemy2Spawn.y, 'imp', 'imp_idle02.png');
    this.enemy3 = this.physics.add.sprite(this.enemy3Spawn.x, this.enemy3Spawn.y, 'imp', 'imp_idle02.png');
    this.enemy4 = this.physics.add.sprite(this.enemy4Spawn.x, this.enemy4Spawn.y, 'imp', 'imp_idle02.png');
    // Collisions
    this.world = this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.add.collider(this.terrain, this.player, () => this.resetJumpCount(), null, this);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.terrain, this.enemy1);
    this.physics.add.collider(this.terrain, this.enemy2);
    this.physics.add.collider(this.terrain, this.enemy3);
    this.physics.add.collider(this.terrain, this.enemy4);
    this.physics.add.collider(this.player, this.enemy1, () => this.touchEnemy(), null, this);
    this.physics.add.collider(this.player, this.enemy2, () => this.touchEnemy(), null, this);
    this.physics.add.collider(this.player, this.enemy3, () => this.touchEnemy(), null, this);
    this.physics.add.collider(this.player, this.enemy4, () => this.touchEnemy(), null, this);
    this.enemy1.setImmovable();
    this.enemy2.setImmovable();
    this.enemy3.setImmovable();
    this.enemy4.setImmovable();
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
    this.enemy1.play('imp_walk');
    this.enemy2.play('imp_walk');
    this.enemy3.play('imp_walk');
    this.enemy4.play('imp_walk');
    // Enemy Tweens 
    this.tween = this.tweens.add({
      targets: this.enemy1,
      x: '+=78',
      ease: 'Linear',
      duration: 2000,
      flipX: true,
      yoyo: true,
      repeat: -1
    });
    this.tween2 = this.tweens.add({
      targets: [this.enemy2, this.enemy3, this.enemy4],
      x: '+=35',
      ease: 'Linear',
      duration: 2000,
      flipX: true,
      yoyo: true,
      repeat: -1
    });
    // create inputs
    this.input.enabled = true;
    this.keys = this.input.keyboard.addKeys('A, D, SPACE');
    // camera
    this.camera = this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.camera.startFollow(this.player).fadeIn(2000);
    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // this.terrain.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });
  }
  update() {
    if (this.keys.A.isDown) {
      this.player.flipX = true;
      this.player.setVelocityX(-75);
      this.player.play('walk', true);
    } else if (this.keys.D.isDown) {
      if (this.player.flipX) {
        this.player.flipX = false;
      }
      this.player.setVelocityX(75);
      this.player.play('walk', true);
    } else {
      this.player.setVelocityX(0);
      this.player.play('idle', true);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) && this.jumpCount < this.maxJump) {
      if (this.jumpCount == 0) {
        this.jumpCount++;
        this.player.setVelocityY(-130);
      } else {
        this.jumpCount++;
        this.player.setVelocityY(-115);
      }
    }
    if (this.player.x >= this.despawnPoint.x) {
      console.log('next scene');
    }
    if (this.player.body.bottom >= this.world.bounds.bottom) {
      console.log('died');
    }
  }
  resetJumpCount() {
    this.jumpCount = 0;
  }
  touchEnemy() {
    this.player.anims.stop();
    this.tween.stop();
    this.tween2.stop();
    this.enemy1.anims.stop();
    this.enemy2.anims.stop();
    this.enemy3.anims.stop();
    this.enemy4.anims.stop();
    this.endGame();
  }
  endGame() {
    this.camera.fadeOut(5000);
    this.camera.zoomTo(10, 3000);
  }
}