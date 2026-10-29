import './style.css'
import Alpine from 'alpinejs'
import * as XObject from "./xschem_reader/XObject";
import { loadSymbol } from "./xschem_reader/sym-reader";
import { createPIXIcontainer } from './renderer/renderer';

window.Alpine = Alpine;
Alpine.start();

// Workspace:
const WORLD_WIDTH = 10000;
const WORLD_HEIGHT = 10000;
const DEFAULT_ZOOM_LEVEL = 2;

import { Application, Graphics, Text, TextStyle, Assets, Sprite, TilingSprite } from 'pixi.js'
import { Viewport } from 'pixi-viewport';

(async () => {
  const diode = await loadSymbol("/src/symbols/diode.sym");
  const pfet = await loadSymbol("/src/symbols/res_generic_l1.sym");
  // Application setup
  const app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0x000044,
  });

  document.body.appendChild(app.canvas);
  //Viewport setup
  const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    events: app.renderer.events,
    // Add these:
  });
  // Mount the viewport. All other children are mounted to the viewport instead of the app stage.
  app.stage.addChild(viewport);
  // Enable Viewport culling
  // Enable drag, wheel, and pinch gestures, set middle mousebutton to drag button.
  viewport.drag({ mouseButtons: "middle" }).wheel().pinch();
  // Set Zoom Limits
  viewport.clampZoom({ minScale: 0.1, maxScale: 10 });
  // Set default zoom.
  viewport.setZoom(DEFAULT_ZOOM_LEVEL);
  viewport.moveCenter(0, 0);
  // Rest Zoom when pressing: F
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f") {
      viewport.setZoom(DEFAULT_ZOOM_LEVEL);
      viewport.moveCenter(0, 0);
      // Alternative viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    }
  });

  // Viewport rectangle
  const background = new Graphics();
  background.rect(
    -WORLD_WIDTH / 2,
    -WORLD_HEIGHT / 2,
    WORLD_WIDTH,
    WORLD_HEIGHT,
  );
  background.fill({
    color: 0x101020,
  });
  viewport.addChildAt(background, 0);

  const diodeTexture = app.renderer.generateTexture({
    target: createPIXIcontainer(diode).children[0],
    resolution: 6,
    clearColor: "transparent",
    antialias: false
  });

  const pfetTexture = app.renderer.generateTexture({
    target: createPIXIcontainer(pfet),
    resolution: 6,
    clearColor: "transparent",
    antialias: false,
  });

  // Infinite repeating grid texture.
  const gridTexture = await Assets.load("/textures/grid-dots.png");
  const grid = new TilingSprite({
    texture: gridTexture,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    tileScale: 0.2,
  });
  grid.position.set(-WORLD_WIDTH / 2, -WORLD_HEIGHT / 2);
  grid.alpha = 0.1;
  // Add grid at index 0 (behind everything!)
  viewport.addChildAt(grid, 1);
  // Hide grid at certain zoom level
  app.ticker.add(() => {
    grid.visible = viewport.scaled >= 0.5;
  });

  // Creating a simple triangle
  const rectangle = new Graphics();
  rectangle.rect(150, 150, 100, 100);
  rectangle.fill({
    color: 0xff0000,
  });
  rectangle.stroke({
    width: 2,
    color: 0x00ff00,
  });
  rectangle.eventMode = "static";
  rectangle.on("mousedown", moveRect);
  rectangle.cursor = "pointer"; // Display a pointer cursor when hovering the rectangle
  function moveRect() {
    rectangle.x += 10;
    rectangle.y -= 2;
  }

  // Creating a simple text + reusable text style
  const GLOBAL_TEXT_STYLE = new TextStyle({
    fill: 0xffffff,
    fontSize: 12,
    fontFamily: "Segoe UI",
  });

  const texture = await Assets.load("/favicon.svg");

  const sprite = new Sprite(texture);
  sprite.scale.set(3, 3);
  sprite.position.set(400, 200);
  sprite.anchor.set(0.5, 0.5);
  sprite.rotation = Math.PI / 4;

  // Add elements to the viewport
  viewport.addChild(rectangle);
  viewport.addChild(sprite);
  //viewport.addChild(renderComponent(diode));

  for(let x = 0; x < 10; x++){
    for(let y = 0; y < 10; y++){
      
      let component = new Sprite(diodeTexture);
      component.position.set(
        100 * x,
        100 * y,
      );
      viewport.addChild(component);
    }
  }

  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      let component = new Sprite(pfetTexture);
      component.position.set(-1200 + 100 * x,-1200 + 100 * y);
      viewport.addChild(component);
    }
  }

})();


