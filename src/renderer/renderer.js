
import * as XObject from "../xschem_reader/XObject";
import {
  Graphics,
  Text,
  Container
} from "pixi.js";

const SIZE = 1;

//TODO: create two separate functions: createTextcontainer, createSymbolContainer
//TODO: only call createSymbolContainer initially and then create a sprite of the symbol
//TODO: Combine the sprite and text, to create the final container for a component.

export function createPIXIcontainer(component){

  if(!component.primitives){
    return;
  }
  let container = new Container();
  let symbolContainer = new Container();
  let textContainer = new Container();

  component.primitives.forEach(element => {
    let graphic;

    if (element instanceof XObject.Line) {
      graphic = new Graphics();
      graphic.moveTo(SIZE * element.x1, SIZE * element.y1);
      graphic.lineTo(SIZE * element.x2, SIZE * element.y2);
      graphic.stroke({
        width: 1,
        color: 0x00ff00,
        cap: "round",
      });
    } else if (element instanceof XObject.Rectangle) {
      graphic = new Graphics();
      graphic.rect(
        SIZE * element.x1,
        SIZE * element.y1,
        SIZE * (element.x2 - element.x1),
        SIZE * (element.y2 - element.y1),
      );
      graphic.fill({
        color: 0xff0000,
      });
    } else if (element instanceof XObject.Polygon) {
      graphic = new Graphics();
      for(let i = 0; i < element.pointArray.length; i++) {
        element.pointArray[i] = SIZE * element.pointArray[i];
      }
      graphic.poly(element.pointArray, element.isClosed);
      graphic.stroke({ width: 1, color: 0x00ff00, join: "round" });
      if (element.isClosed) {
        if (element.attributes && element.attributes.get("fill") === true) {
          graphic.fill({
            color: 0x00ff00,
          });
        }
      }
      console.log(element);
    } else if (element instanceof XObject.Arc) {
      graphic = new Graphics();
      graphic.arc(
        SIZE * element.x,
        SIZE * element.y,
        element.radius,
        element.angleStart,
        element.angleEnd,
        false,
      );
      graphic.stroke({ width: 1, color: 0x00ff00, join: "round" });
    } else if (element instanceof XObject.Text) {
      graphic = new Text({
        text: element.text,
        style: {
          fill: 0xffffff,
          fontSize: Math.max(10, 16 * SIZE * element.sizeHorizontal),
          fontFamily: "Segoe UI",
        },
        resolution: 6,
      });
      graphic.fontSize;
      graphic.position.set(element.x, element.y);
    }
    // Add elements to viewport
    if (graphic) {
      if(element instanceof XObject.Text){
        textContainer.addChild(graphic);
      } else {
        symbolContainer.addChild(graphic);
      }
    }
  });
  container.addChild(symbolContainer);
  container.addChild(textContainer);
  return container;
}