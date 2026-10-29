export class Primitive {
  constructor(layer, attributes) {
    this.layer = layer;
    this.attributes = attributes;
  }
}

export class Rectangle extends Primitive {
  constructor(layer, x1, y1, x2, y2, attributes) {
    super(layer, attributes);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}
//B layer x1 y1 x2 y2 {attributes}
export class Line extends Rectangle {
  constructor(layer, x1, y1, x2, y2, attributes) {
    super(layer, x1, y1, x2, y2, attributes);
  }
}

export class Polygon extends Primitive {
  constructor(layer, nPoints, pointArray, attributes) {
    super(layer, attributes);
    this.nPoints = nPoints;
    this.pointArray = pointArray; // x1, y1, x2, y2, ...
    this.isClosed = false;
    if (
      pointArray[0] == pointArray[pointArray.length - 2] &&
      pointArray[1] == pointArray[pointArray.length - 1]
    ) {
      this.isClosed = true;
    }
  }
}

export class Text extends Primitive {
  // Text Format: T {customText} x y rotation mirror horizontal_size vertical_size {font=String layer=Int}
  constructor(
    text,
    x,
    y,
    rotation,
    mirror,
    sizeHorizontal,
    sizeVertical,
    attributes,
  ) {
    super(undefined, attributes);
    this.text = text;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.mirror = mirror;
    this.sizeHorizontal = sizeHorizontal;
    this.sizeVertical = sizeVertical;
    this.attributes = attributes;
  }
}

export class Arc extends Primitive {
  constructor(layer, x, y, radius, angleStart, angleEnd, attributes) {
    super(layer, attributes);
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.angleStart = angleStart;
    this.angleEnd = angleEnd;
  }
}

export class Component {
  constructor(name, primitives) {
    this.name = name;
    this.primitives = primitives;
  }
}
