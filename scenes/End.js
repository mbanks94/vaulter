export default class End extends Phaser.Scene {
  constructor() {
    super({
      key: 'End'
    })
  }
  preload() {
    this.load.image('dungeon-tiles', '/tiles/ForgottenDungeon.png');
    this.load.tilemapTiledJSON('end', '/tiles/end.json');
    this.load.audio('introsong', ['/sounds/dubiousdungeon.mp3']);
    this.load.script(
      'webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
    );
  }
  create() {
    // Music
    this.loadmusic = this.sound.add('introsong').setVolume(0.3);
    this.loadmusic.play();

    this.background = this.make.tilemap({
      key: 'end',
      tileWidth: 16,
      tileHeight: 16
    });
    const tileset = this.background.addTilesetImage('Dungeon-Tileset', 'dungeon-tiles');
    this.background.createStaticLayer('Background', tileset, 0, 0);
    this.make.text({
			x: 175,
			y: 290,
			text: 'Press Space Bar To Restart',
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
    WebFont.load({
      google: {
        families: ['Fredericka the Great']
      },
      active: function () {
        add
          .text(185, 100, `THE END`, {
            fontFamily: 'Fredericka the Great',
            fontSize: 50,
            color: '#ffffff'
          })
          .setShadow(2, 2, '#333333', 2, false, true);
      }
    });
    this.keys = this.input.keyboard.addKeys('SPACE');
  }
  update() {
    if (this.keys.SPACE.isDown) {
      this.scene.start('Level1');
      this.loadmusic.stop();
    } 
  }
}