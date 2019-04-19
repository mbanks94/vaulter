export default class Intro extends Phaser.Scene {
	constructor() {
		super({
			key: 'Intro'
		});
	}
	preload() {
    this.load.image('dungeon-tiles', 'assets/tiles/ForgottenDungeon.png');
    this.load.tilemapTiledJSON('intro', '/assets/tiles/intro.json');
    this.load.audio('introsong', ['assets/sounds/dubiousdungeon.mp3']);
		this.load.script(
			'webfont',
			'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
		);

		var progress = this.add.graphics();
		const self = this;
		this.load.on('progress', function(value) {
			progress.clear();
			progress.fillStyle(0x42f456, 1);
			progress.fillRect(0, 300, 800 * value, 20);
		});

		this.load.on('complete', function() {
			progress.destroy();
		});
	}
	create() {
    // Music
    this.loadmusic = this.sound.add('introsong').setVolume(0.3);
    this.loadmusic.play();

    this.background = this.make.tilemap({
      key: 'intro',
      tileWidth: 16,
      tileHeight: 16
    });
    const tileset = this.background.addTilesetImage('Dungeon-Tileset', 'dungeon-tiles');
    this.background.createStaticLayer('Background', tileset, 0, 0);

    // Screen Text
    this.make.text({
			x: 250,
			y: 290,
			text: 'Press Space Bar',
			style: {
				fontSize: '20px',
				fontFamily: 'Fredericka the Great',
				color: '#ffffff',
				align: 'center',
				shadow: {
					color: '#000000',
					fill: true,
					offsetX: 2,
					offsetY: 2,
					blur: 8
				}
			}
		});
		var add = this.add;
		var input = this.input;
		WebFont.load({
			google: {
				families: ['Fredericka the Great']
			},
			active: function() {
				add
					.text(185, 100, `VAULTER`, {
						fontFamily: 'Fredericka the Great',
						fontSize: 50,
						color: '#ffffff'
					})
					.setShadow(2, 2, '#333333', 2, false, true);
			}
		});
		this.keys = this.input.keyboard.addKeys('SPACE, TWO, THREE, FOUR, FIVE');
	}
	update(delta) {
    if (this.keys.SPACE.isDown) {
      this.scene.start('Level1');
      this.loadmusic.stop();
    } 
    if (this.keys.THREE.isDown) {
      this.scene.start('Level3');
      this.loadmusic.stop();
    }
    if (this.keys.TWO.isDown) {
      this.scene.start('Level2');
      this.loadmusic.stop();
    }
    if (this.keys.FOUR.isDown) {
      this.scene.start('Level4');
      this.loadmusic.stop();
    }
    if (this.keys.FIVE.isDown) {
      this.scene.start('End');
      this.loadmusic.stop();
    }
	}
}
