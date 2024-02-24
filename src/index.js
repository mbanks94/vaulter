import Phaser from "phaser";

import Intro from "./scenes/Intro.js";
import Level1 from "./scenes/Level1.js";
import Level2 from "./scenes/Level2.js";
import Level3 from "./scenes/Level3.js";
import Level4 from "./scenes/Level4.js";
import End from "./scenes/End.js";

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 320,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 300,
      },
      checkCollision: {
        up: true,
        down: true,
        left: true,
        right: true,
      },
    },
  },
  scene: [Intro, Level1, Level2, Level3, Level4, End],
};

const game = new Phaser.Game(config);
