// http://repo.hu/projects/xschem/xschem_man/developer_info.html

import * as XObject from "./XObject";

function splitXSchemLine(string) {
  const substrings = [];
  const separator = ' ';
  let lastChar = '';
  let currentString = "";
  let depth = 0;

  for (let i = 0; i < string.length; i++){
    const char = string[i];
    
    if(depth > 0){
      if (char === "{") {
        depth++;
      }
      if (char === "}") {
        depth--;
      }
      currentString += char;
    } else {
      if (char === '{') {
        depth++;
      }
      if (char === separator) {
        // Avoid adding substrings for multiple spaces
        if(lastChar !== char){
          substrings.push(currentString);
          currentString = "";
        }
      } else {
        currentString += char;
      }
    }
    lastChar = char;
    // Debug:
    // console.table(char, depth, currentString);
  }
  // Do not add trailing spaces to substrings.
  for(let i = 0; i < currentString.length; i++){
    let char = currentString[i];
    // Check if the last currentString contains characters other than ' '
    // If yes add it to substrings.
    if(char !== ' '){
      substrings.push(currentString);
      break;
    }
  }
  return substrings;
}

function parseObjectAttributes(attributes){
  // attributes is an array
  if(attributes === undefined || attributes.length === 0 || attributes === '{}'){
    return new Map();
  }
  // Remove braces {...} from the attributes string 
  let attributes_string = attributes.substring(1, attributes.length - 1);
  // Extract the individual attribute strings
  let itemArray = attributes_string.split(" ");
  let attributeDict = new Map();

  for (let i = 0; i < itemArray.length; i++) {
    const item = itemArray[i];
    if (item !== "") {
      // Extract key and value
      let attribute = item.split("=");
      let name = attribute[0];
      let value = attribute[1];

      switch (name) {
        case "layer":
          value = parseInt(value);
          break;
        case "fill":
          if(value === 'true'){
            value = true;
          } else {
            value = false;
          }
        default:
          break;
      }
      // Only add entries if both key and value are defined
      if(name && value) {
        attributeDict.set(name, value);
      }
    }
  }
  return attributeDict;
}

export async function loadSymbol(path) {
  const response = await fetch(path);
  const text = await response.text();
  // Separate text into lines
  let items = text.split("\n");
  let primitives = [];
  
  // Parse each line:
  items.forEach((item) => {
    let subItems;
    // TODO: line detection is not robust. This must be improved.
    switch (item[0] + item[1]) {
      case "L ":
        subItems = splitXSchemLine(item);
        // Line Format: L layer x1 y1 x2 y2 {attributes}
        primitives.push(
          new XObject.Line(
            parseInt(subItems[1]), // layer
            parseFloat(subItems[2]), // x1
            parseFloat(subItems[3]), // y1
            parseFloat(subItems[4]), // x2
            parseFloat(subItems[5]), // y2
            parseObjectAttributes(subItems[6]) // attributes
          ),
        );
        break;
      case "B ":
        subItems = splitXSchemLine(item);
        // Rectangle Format: B layer x1 y1 x2 y2 {attributes}
        primitives.push(
          new XObject.Rectangle(
            parseInt(subItems[1]), // layer
            parseFloat(subItems[2]), // x1
            parseFloat(subItems[3]), // y1
            parseFloat(subItems[4]), // x2
            parseFloat(subItems[5]), // y2
            parseObjectAttributes(subItems[6]), // attributes
          ),
        );
        break;
      case "P ":
        subItems = splitXSchemLine(item);
        // Polygon Format: Format: P layer npoints px1 py1 px2 py2 .... {attributes}
        let pointArray = subItems.slice(3, subItems.length - 1);
        for (let i = 0; i < pointArray.length; i++) {
          pointArray[i] = parseFloat(pointArray[i]);
        }
        primitives.push(
          new XObject.Polygon(
            parseInt(subItems[1]), // layer
            parseInt(subItems[2]), // npoints
            pointArray,
            parseObjectAttributes(subItems[subItems.length - 1]), // attributes
          ),
        );
        break;
      case "A ":
        subItems = splitXSchemLine(item);
        // Arc / Circle format: A x y radius angle_a angle_b {attributes}
        primitives.push(
          new XObject.Arc(
            parseInt(subItems[1]), // layer
            parseFloat(subItems[2]), // x
            parseFloat(subItems[3]), // y
            parseFloat(subItems[4]), // radius
            parseFloat(subItems[5]), // start angle
            parseFloat(subItems[6]), // end angle
            parseObjectAttributes(subItems[7]), // attributes
          ),
        );
        break;
      case "T ":
        subItems = splitXSchemLine(item);
        // Text Format: T {customText} x y rotation mirror horizontal_size vertical_size {font=String layer=Int}
        let text = subItems[1];
        text = text.substring(1, text.length - 1);
        primitives.push(
          new XObject.Text(
            text,
            parseFloat(subItems[2]), // x
            parseFloat(subItems[3]), // y
            parseInt(subItems[4]), // rotation: 0, 1, 2, 3
            parseInt(subItems[5]), // mirror: 0, 1, 2, 3
            parseFloat(subItems[6]), // horizontal size
            parseFloat(subItems[7]), // horizontal size
            parseObjectAttributes(subItems[8]), // attributes
          ),
        );
        break;
      default:
        break;
    }
  });
  return new XObject.Component("component", primitives);
}
