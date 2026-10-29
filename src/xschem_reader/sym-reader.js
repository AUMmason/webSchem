// http://repo.hu/projects/xschem/xschem_man/developer_info.html

import {
  Graphics
} from "pixi.js";

export class Primitive {
  constructor(layer) {
    this.layer = layer;
  }
}

export class Rectangle extends Primitive {
  constructor(layer, x1, y1, x2, y2) {
    super(layer);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}
//B layer x1 y1 x2 y2 {attributes}
export class Line extends Rectangle {
  constructor(layer, x1, y1, x2, y2) {
    super(layer, x1, y1, x2, y2);
  }
}

export class Polygon extends Primitive {
  constructor(layer, nPoints, pointArray){
    super(layer);
    this.nPoints = nPoints;
    this.pointArray = pointArray; // x1, y1, x2, y2, ...
    this.isClosed = false;
    if(pointArray[0] == pointArray[pointArray.length - 2] 
      && pointArray[1] == pointArray[pointArray.length - 1]){
        this.isClosed = true;
    }
  }
}

export class Text {
  // Text Format: T {customText} x y rotation mirror horizontal_size vertical_size {font=String layer=Int}
  constructor(text, x, y, rotation, mirror, sizeHorizontal, sizeVertical) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.mirror = mirror;
    this.sizeHorizontal = sizeHorizontal;
    this.sizeVertical = sizeVertical;
  }
}

export async function loadSymbol(path) {
  const response = await fetch(path);
  
  // TODO: implement parser here!
  const text = await response.text();
  let items = text.split("\n");

  let graphics = [];
  
  items.forEach((item) => {
    let subItems = item.split(" ");
    switch (subItems[0]) {
      case "*":
        console.log("Comment!");
        break;
      case "L":
        console.log("Line");
        // Line Format: L layer x1 y1 x2 y2 {attributes}
        graphics.push(
          new Line(
            parseInt(subItems[1]),
            parseFloat(subItems[2]),
            parseFloat(subItems[3]),
            parseFloat(subItems[4]),
            parseFloat(subItems[5]),
          ),
        );
        break;
      case "B":
        console.log("Rectangle");
        // Rectangle Format: B layer x1 y1 x2 y2 {attributes}
        graphics.push(
          new Rectangle(
            parseInt(subItems[1]),
            parseFloat(subItems[2]),
            parseFloat(subItems[3]),
            parseFloat(subItems[4]),
            parseFloat(subItems[5]),
          ),
        );
        break;
      case "P":
        console.log("Polygon");
        // Polygon Format: Format: P layer npoints px1 py1 px2 py2 .... {attributes}

        let pointArray = subItems.slice(3, subItems.length - 1);
        for (let i = 0; i < pointArray.length; i++) {
          pointArray[i] = parseFloat(pointArray[i]);
        }
        console.log(pointArray);
        graphics.push(
          new Polygon(
            parseInt(subItems[1]), // layer
            parseInt(subItems[2]), // npoints
            pointArray,
          ),
        );
        break;
      case "A":
        console.log("Arc / Circle");
        break;
      case "T":
        console.log("Text");
        // Text Format: T {customText} x y rotation mirror horizontal_size vertical_size {font=String layer=Int}
        let text = subItems[1];
        text = text.substring(1, text.length - 1);
        graphics.push(
          new Text(
            text,
            parseFloat(subItems[2]), // x
            parseFloat(subItems[3]), // y
            parseInt(subItems[4]), // rotation: 0, 1, 2, 3
            parseInt(subItems[5]), // mirror: 0, 1, 2, 3
            parseFloat(subItems[6]), // horizontal size
            parseFloat(subItems[7]), // horizontal size
          ),
        );
        break;
      default:
        break;
    }
  });
  return graphics;
}
