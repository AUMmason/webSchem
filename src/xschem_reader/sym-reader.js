// http://repo.hu/projects/xschem/xschem_man/developer_info.html
export async function loadSymbol(path) {
  const response = await fetch(path);
  
  // TODO: implement parser here!
  const text = await response.text();
  let items = text.split("\n");
  items.forEach((item) => {
    let lineType = item.charAt(0);
    switch (lineType) {
      case "*":
        console.log("Comment!");
        break;
      case "L":
        console.log("Line");
        console.log(item.split(" "));
        break;
      case "B":
        console.log("Rectangle");
        break;
      case "P":
        console.log("Polygon");
        break;
      case "A":
        console.log("Arc / Circle");
        break;
      case "T":
        console.log("Text");
        break;
      default:
        break;
    }
  });
  return items[0];
}
