import './style.css'
import Alpine from 'alpinejs'

window.Alpine = Alpine;
Alpine.start();

//TODO: Create method for rendering a single XSchem Symbol!

const WORLD_WIDTH = 10000;
const WORLD_HEIGHT = 10000;


import { Application, Graphics, Text, TextStyle, Assets, Sprite, TilingSprite } from 'pixi.js'
import { Viewport } from 'pixi-viewport';

(async () => {
  // Application setup
  const app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0x000044,
  });

  document.body.appendChild(app.canvas);
  console.log(app.render.events)
  //Viewport setup
  const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    events: app.renderer.events
  });
  // Mount the viewport. All other children are mounted to the viewport instead of the app stage.
  app.stage.addChild(viewport);

  // Enable drag, wheel, and pinch gestures, set middle mousebutton to drag button.
  viewport.drag({mouseButtons: 'middle'}).wheel().pinch().decelerate();
  // Set Zoom Limits
  viewport.clampZoom({minScale: 0.1, maxScale: 10})
  // Set default zoom.
  viewport.setZoom(1);
  viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT/2);
  // Rest Zoom when pressing: F
  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'f'){
      viewport.setZoom(1);
      viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
      // Alternative viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    }
  })

  // Viewport rectangle
  const background = new Graphics();
  background.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  background.fill({
    color: 0x101020
  });
  viewport.addChildAt(background, 0)


  // Infinite repeating grid texture.  
  const gridTexture = await Assets.load("/textures/grid-dots.png");
  const grid = new TilingSprite({
    texture: gridTexture, 
    width: WORLD_WIDTH, 
    height: WORLD_HEIGHT,
    tileScale: 0.2
  });
  grid.alpha = 0.1;
  // Add grid at index 0 (behind everything!)
  viewport.addChildAt(grid, 1)
  // Hide grid at certain zoom level
  app.ticker.add(() => {
    grid.visible = viewport.scaled >= 0.5;
  })



  // Creating a simple triangle
  const rectangle = new Graphics();
  rectangle.rect(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 100, 100);
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
  const textStyle = new TextStyle({
    fill: 0xffffff,
    fontSize: 72,
    fontFamily: "OpenSans",
  });
  const text = new Text({
    text: "Hello World",
    style: textStyle,
  });

  const texture = await Assets.load("/favicon.svg");

  const sprite = new Sprite(texture);
  sprite.scale.set(3, 3);
  sprite.position.set(400, 200);
  sprite.anchor.set(0.5, 0.5);
  sprite.rotation = Math.PI / 4;

  const line = new Graphics();
  line.moveTo(0, 0);
  line.lineTo(200, 50);
  line.stroke({
    width: 2,
    color: 0x00ff00,
  });

  // Add elements to the viewport
  viewport.addChild(rectangle);
  viewport.addChild(text);
  viewport.addChild(line);
  viewport.addChild(sprite);

  
})();


