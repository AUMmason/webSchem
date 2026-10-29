import './style.css'
import Alpine from 'alpinejs'
import * as XObject from "./xschem_reader/sym-reader";

window.Alpine = Alpine;
Alpine.start();

//TODO: Create method for rendering a single XSchem Symbol!

// Workspace:
const WORLD_WIDTH = 10000;
const WORLD_HEIGHT = 10000;


import { Application, Graphics, Text, TextStyle, Assets, Sprite, TilingSprite } from 'pixi.js'
import { Viewport } from 'pixi-viewport';

(async () => {
  const diodeSymbol = await XObject.loadSymbol("/src/symbols/diode.sym");
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
  });
  // Mount the viewport. All other children are mounted to the viewport instead of the app stage.
  app.stage.addChild(viewport);

  // Enable drag, wheel, and pinch gestures, set middle mousebutton to drag button.
  viewport.drag({ mouseButtons: "middle" }).wheel().pinch();
  // Set Zoom Limits
  viewport.clampZoom({ minScale: 0.1, maxScale: 10 });
  // Set default zoom.
  viewport.setZoom(1);
  viewport.moveCenter(0, 0);
  // Rest Zoom when pressing: F
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f") {
      viewport.setZoom(1);
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

  // Renderer
  // TODO: implement displaying of attributes (fill, layer, etc.);
  // TODO: extract render functionality to separate file.
  for(let i = 0; i < diodeSymbol.length; i++){
    let graphic;
    let element = diodeSymbol[i];

    if (element instanceof XObject.Line) {
      graphic = new Graphics();
      graphic.moveTo(element.x1, element.y1);
      graphic.lineTo(element.x2, element.y2);
      graphic.stroke({
        width: 1,
        color: 0x00ff00,
        cap: 'round',
      });
    } else if (element instanceof XObject.Rectangle) {
      graphic = new Graphics();
      graphic.rect(
        element.x1,
        element.y1,
        element.x2 - element.x1,
        element.y2 - element.y1,
      );
      graphic.fill({
        color: 0xff0000,
      });
    } else if (element instanceof XObject.Polygon) {
      graphic = new Graphics();
      graphic.poly(element.pointArray, element.isClosed);
      graphic.stroke({ width: 1, color: 0x00FF00, join: "round" });
      if(element.isClosed){
        if(element.attributes && element.attributes.get("fill") === true){
          graphic.fill({
            color: 0x00ff00,
          });
        }
      }
      console.log(element);
    } else if (element instanceof XObject.Arc) {
      graphic = new Graphics();
      graphic.arc(element.x, element.y, element.radius, element.angleStart, element.angleEnd, false);
      graphic.stroke({ width: 1, color: 0x00ff00, join: "round" });
    } else if (element instanceof XObject.Text) {
      graphic = new Text({
        text: element.text,
        style: {
          fill: 0xffffff,
          fontSize: 12 * 4 * element.sizeHorizontal,
          fontFamily: "Segoe UI"
        },
        resolution: 4
      });
      graphic.fontSize
      graphic.position.set(element.x, element.y);
    }
    // Add elements to viewport
    if(graphic){
      viewport.addChild(graphic);
    }
  }

})();


