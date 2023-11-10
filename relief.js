let reliefData;
let prData;
let prData2100;
let prData2070;
let prData2040;
let easycam;
let font;
let maxElevation = 0; // You'll need to know the max elevation for proper scaling
let width = window.innerWidth;
let height = window.innerHeight;
let points = []; // Array to hold the scaled points
let prPoints2100 = [];
let prPoints2070 = [];
let prPoints2040 = [];
let zScaleSlider;
let zScale = 0.6; // Initial Z scale value
let prScaleSlider;
let prScale = 100; // Initial Z scale value
let previousZScale = zScale; // Used to scale the Z values based on the slider value
let reliefSphereSizeSlider;
let reliefSphereSize = 2; // Initial sphere size value
let prSphereSizeSlider;
let prSphereSize = 14; // Initial sphere size value
let prElevSlider;
let prElev = 100; // Initial sphere size value
let hoveredPoints = []; // This will hold the points that are being hovered
let reliefMaxLat = 0;
let reliefMaxLong = 0;
let reliefMinLat = 0;
let reliefMinLong = 0;
let globalMinX = 0;
let globalMaxX = 0;
let globalMinY = 0;
let globalMaxY = 0;
let mouseXScale = 0;
let mouseYScale = 0;
let prYearSlider;
let prYear = 2023;

function preload() {
  // Assuming your data is in a JSON format
  reliefData = loadTable("./relief_max.csv", "csv", "header");
  prData2100 = loadTable("./precipitation_pred_2070_2100.csv", "csv", "header");
  prData2070 = loadTable("./precipitation_pred_2040_2070.csv", "csv", "header");
  prData2040 = loadTable("./precipitation_pred_2010_2040.csv", "csv", "header");
  font = loadFont("./assets/Inconsolata-Medium.ttf");
}

function setup() {
  createCanvas(width, height, WEBGL);
  let initDistance = (width + height) / 2;
  easycam = createEasyCam().setDistance(initDistance);
  colorMode(HSB); // Set color mode to HSB
  textFont(font, 28);

  // Create a slider to control the Z scale
  zScaleSlider = createSlider(0, 1, zScale, 0.01);
  zScaleSlider.position(20, 20);

  // Create a slider to control the sphere size
  reliefSphereSizeSlider = createSlider(0, 4, reliefSphereSize, 1);
  reliefSphereSizeSlider.position(20, 50);

  // Create a slider to control the precipitation scale
  prScaleSlider = createSlider(0, 300, prScale, 10);
  prScaleSlider.position(20, 80);

  // Create a slider to control the sphere size
  prSphereSizeSlider = createSlider(0, 25, prSphereSize, 1);
  prSphereSizeSlider.position(20, 110);

  // Precipitation visualization elevation
  prElevSlider = createSlider(0, 200, prElev, 10);
  prElevSlider.position(20, 140);

  prYearSlider = createSlider(2010, 2098, prYear, 1);
  prYearSlider.style("width", "200px");
  prYearSlider.position(20, 200);
  // Find max elevation for scaling Z values
  for (let i = 0; i < reliefData.rows.length; i++) {
    let z = reliefData.rows[i][2];
    if (z > maxElevation) {
      maxElevation = z;
    }
  }
  transformReliefData();
  prPoints2040 = transformPrecipitationData(prData2040);
  prPoints2070 = transformPrecipitationData(prData2070);
  prPoints2100 = transformPrecipitationData(prData2100);
  normalizeReliefPoints();
  prPoints2040 = normalizePrecipitationPoints(prPoints2040);
  prPoints2070 = normalizePrecipitationPoints(prPoints2070);
  prPoints2100 = normalizePrecipitationPoints(prPoints2100);
}
function transformReliefData() {
  // Transform the data to an array of objects
  for (let i = 0; i < reliefData.rows.length; i++) {
    let x = reliefData.rows[i].arr[0];
    let y = reliefData.rows[i].arr[1];
    let z = reliefData.rows[i].arr[2];
    points.push({ X: Number(x), Y: Number(y), Z: Number(z) });
  }
  // Take a random sample with half of paoints in points
  points = points.filter((p) => Math.random() < 0.5);
}

function transformPrecipitationData(data) {
  arr = [];
  // Transform the data to an array of objects
  for (let i = 0; i < data.rows.length; i++) {
    let year = data.rows[i].arr[0];
    let y = data.rows[i].arr[1];
    let x = data.rows[i].arr[2];
    let pr = data.rows[i].arr[3];
    if (pr != "--") {
      arr.push({
        year: Number(year),
        X: Number(x),
        Y: Number(y),
        pr: Number(pr),
      });
    }
  }
  return arr;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Update the camera distance based on the new window size.
  let newDistance = (windowWidth + windowHeight) / 6; // Adjust this formula as needed
  easycam.setDistance(newDistance);
}

function normalizeReliefPoints() {
  let hueStart = 180; // Hue for lowest elevation
  let hueEnd = 0; // Hue for highest elevation (e.g., 120 for green)

  // Find the min and max for X and Y to center the points
  let minX = (reliefMinLat = Math.min(...points.map((p) => p.X)));
  let maxX = (reliefMaxLat = Math.max(...points.map((p) => p.X)));
  let minY = (reliefMinLong = Math.min(...points.map((p) => p.Y)));
  let maxY = (reliefMaxLong = Math.max(...points.map((p) => p.Y)));
  let minZ = Math.min(...points.map((p) => p.Z));
  let maxZ = Math.max(...points.map((p) => p.Z));

  // Center and scale the points
  points = points.map((p) => {
    let hueValue = map(p.Z, minZ, maxZ, hueStart, hueEnd);

    return {
      lat: p.Y,
      long: p.X,
      elevation: p.Z,
      x: map(p.X, minX, maxX, -width / 2, width / 2),
      y: map(p.Y, minY, maxY, height / 2, -height / 2),
      z: map(p.Z, minZ, maxZ, -zScale, zScale), // You might need to adjust Z scale based on your data
      hue: Math.round(hueValue),
    };
  });

  globalMinX = Math.min(...points.map((p) => p.x));
  globalMaxX = Math.max(...points.map((p) => p.x));
  globalMinY = Math.min(...points.map((p) => p.y));
  globalMaxY = Math.max(...points.map((p) => p.y));
}

function normalizePrecipitationPoints(prPoints) {
  let hueStart = 180; // Hue for lowest precipitation
  let hueEnd = 300; // Hue for highest precipitation (e.g., 120 for green)

  // Find the min and max for X and Y to center the points
  let minX = Math.min(...prPoints.map((p) => p.X));
  let maxX = Math.max(...prPoints.map((p) => p.X));
  let minY = Math.min(...prPoints.map((p) => p.Y));
  let maxY = Math.max(...prPoints.map((p) => p.Y));
  let minPr = Math.min(...prPoints.map((p) => p.pr));
  let maxPr = Math.max(...prPoints.map((p) => p.pr));

  // Center and scale the points
  let prPointsNorm = prPoints.map((p) => {
    let hueValue = map(p.pr, minPr, maxPr, hueStart, hueEnd);
    return {
      lat: p.Y,
      long: p.X,
      pr: p.pr,
      year: p.year,
      x: map(p.X, minX, maxX, globalMinX, globalMaxX),
      y: map(p.Y, maxY, minY, globalMinY, globalMaxY),
      //   z: map(p.pr, minPr, maxPr, 0, 1), // You might need to adjust Z scale based on your data
      z: p.pr * 30,
      hue: Math.round(hueValue),
    };
  });
  return prPointsNorm;
}

function draw() {
  background(360);
  noStroke();

  ambientLight(100); // Add a little ambient light
  // Reset hoveredPoint to [] at the start of each frame
  hoveredPoints = [];

  // Update Z scale based on slider value
  zScale = zScaleSlider.value();
  // Update sphere size based on slider value
  reliefSphereSize = reliefSphereSizeSlider.value();
  // Update precipitation scale based on slider value
  prScale = prScaleSlider.value();
  // Update sphere size based on slider value
  prSphereSize = prSphereSizeSlider.value();

  // Update precip elev based on slider value
  prElev = prElevSlider.value();

  // Update prYear
  prYear = prYearSlider.value();

  //Change value of html element with id prYear to prYear value
  document.getElementById("prYear").innerHTML = prYear;

  let cursorX = mouseX - width / 2;
  let cursorY = mouseY - height / 2;

  let targetX = map(cursorX, -width / 2, width / 2, globalMinX, globalMaxX);
  let targetY = map(cursorY, -height / 2, height / 2, globalMinY, globalMaxY);

  // Draw the line from the cursor to the point
  stroke(20); // Set the line color
  line(cursorX, cursorY, 5000, targetX, targetY, -5000);

  drawRelief();
  if (prYear >= 2010 && prYear < 2040) {
    drawPrecipitation(prPoints2040, prYear);
  } else if (prYear >= 2040 && prYear < 2070) {
    drawPrecipitation(prPoints2070, prYear);
  } else {
    drawPrecipitation(prPoints2100, prYear);
  }
  drawInfoText();
}

function drawRelief() {
  // Draw each point and check for hovering
  noStroke();
  for (let pt of points) {
    push();
    translate(pt.x, pt.y, pt.z + pt.z * zScale * 100);

    let distance = reliefSphereSize > 15 ? reliefSphereSize : 15;
    // Use a larger radius for the hit test to make it easier to hover over points
    if (dist(mouseX - width / 2, mouseY - height / 2, pt.x, pt.y) < distance) {
      hoveredPoints.push(pt); // Save the hovered point
      fill(0, 100, 100);
      sphere(reliefSphereSize * 2, 6, 6);
    } else {
      stroke(pt.hue, 100 - pt.hue / 3, 100 - pt.hue / 3);
      fill(pt.hue, 100 - pt.hue / 3, 100 - pt.hue / 3);
      sphere(reliefSphereSize, 6, 6);
    }
    // Render the sphere
    pop();
  }
}

function drawPrecipitation(points, year) {
  // Draw each point and check for hovering
  noStroke();
  translate(0, 0, prElev);
  points = points.filter((p) => p.year == year);
  for (let pt of points) {
    push();

    let z = map(pt.z, 0, 1, 0, prScale);
    translate(pt.x, pt.y, z);

    let size = map(z, 0, prScale, 0, prSphereSize * 3)
    // Use a larger radius for the hit test to make it easier to hover over points
    let distance = size > 15 ? size : 15;
    if (dist(mouseX - width / 2, mouseY - height / 2, pt.x, pt.y) < distance) {
      hoveredPoints.push(pt); // Save the hovered point
      fill(0, 100, 100);
      sphere(map(z, 0, prScale, 0, prSphereSize * 4), 8, 8);
    } else {
      stroke(pt.hue, 100 - pt.hue / 7, 150 - pt.hue / 7);
      fill(pt.hue, 100 - pt.hue / 7, 150 - pt.hue / 7);
      sphere(size, 8, 8);
    }
    // Render the sphere
    pop();
  }
}

function drawInfoText() {
  // Display the lat/long text if a point is hovered
  fill(0);
  if (hoveredPoints.length > 0) { 
    let htmlEl = "";
    for (let i = 0; i < hoveredPoints.length; i++) {
      let hoveredPoint = hoveredPoints[i];
      let htmlPoint = `<p style="position: absolute; top: ${i * 35}px; right: 20px;`;
      if (hoveredPoint.pr) {
        label = `Lat: ${hoveredPoint.lat}, Long: ${hoveredPoint.long}, Precipitation: ${hoveredPoint.pr}`
      } else {
        label = `X: ${hoveredPoint.long}, Y: ${hoveredPoint.lat}, Elevation: ${hoveredPoint.elevation}`
      }
      htmlPoint += `"><b>${label}</b></p>`
      htmlEl += htmlPoint;
    }
    console.log(htmlEl)
    document.getElementById("information").innerHTML = htmlEl;
  }
}
