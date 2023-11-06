let reliefData;
let prData;
let easycam;
let font;
let maxElevation = 0; // You'll need to know the max elevation for proper scaling
let width = window.innerWidth;
let height = window.innerHeight;
let points = []; // Array to hold the scaled points
let prPoints = [];
let zScaleSlider;
let zScale = 0.5; // Initial Z scale value
let prScaleSlider;
let prScale = 1; // Initial Z scale value
let previousZScale = zScale; // Used to scale the Z values based on the slider value
let reliefSphereSizeSlider;
let reliefSphereSize = 5; // Initial sphere size value
let prSphereSizeSlider;
let prSphereSize = 5; // Initial sphere size value
let prElevSlider;
let prSphereSizeDispersalSlider;
let prSphereSizeDispersal = 0.5; // Initial sphere size value
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

function preload() {
  // Assuming your data is in a JSON format
  reliefData = loadTable("./relief_max.csv", "csv", "header");
  prData = loadTable("./precipitation_pred_2100.csv", "csv", "header");
  font = loadFont("./assets/Inconsolata-Medium.ttf");
}

function setup() {
  createCanvas(width, height, WEBGL);
  let initDistance = (width + height) / 2;
  easycam = createEasyCam().setDistance(initDistance);
  colorMode(HSB, 360, 100, 100); // Set color mode to HSB
  textFont(font, 28);

  // Create a slider to control the Z scale
  zScaleSlider = createSlider(0, 1, zScale, 0.01);
  zScaleSlider.position(20, 20);

  // Create a slider to control the sphere size
  reliefSphereSizeSlider = createSlider(0, 10, reliefSphereSize, 1);
  reliefSphereSizeSlider.position(20, 50);

  // Create a slider to control the precipitation scale
  prScaleSlider = createSlider(0.5, 3, prScale, 0.01);
  prScaleSlider.position(20, 80);

  // Create a slider to control the sphere size
  prSphereSizeSlider = createSlider(0, 10, prSphereSize, 1);
  prSphereSizeSlider.position(20, 110);

  // Precipitation visualization elevation
  prElevSlider = createSlider(0, 200, prElev, 1);
  prElevSlider.position(20, 140);

  prSphereSizeDispersalSlider = createSlider(0, 1, prSphereSizeDispersal, 0.01);
  prSphereSizeDispersalSlider.position(20, 170);
  // Find max elevation for scaling Z values
  for (let i = 0; i < reliefData.rows.length; i++) {
    let z = reliefData.rows[i][2];
    if (z > maxElevation) {
      maxElevation = z;
    }
  }
  transformReliefData();
  transformPrecipitationData();
  normalizeReliefPoints();
  normalizePrecipitationPoints();
}
function transformReliefData() {
  // Transform the data to an array of objects
  for (let i = 0; i < reliefData.rows.length; i++) {
    let x = reliefData.rows[i].arr[0];
    let y = reliefData.rows[i].arr[1];
    let z = reliefData.rows[i].arr[2];
    points.push({ X: Number(x), Y: Number(y), Z: Number(z) });
  }
}

function transformPrecipitationData() {
  // Transform the data to an array of objects
  for (let i = 0; i < prData.rows.length; i++) {
    let y = prData.rows[i].arr[0];
    let x = prData.rows[i].arr[1];
    let pr = prData.rows[i].arr[2];
    if (pr != "--") {
      prPoints.push({ X: Number(x), Y: Number(y), pr: Number(pr) });
    }
  }
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

function normalizePrecipitationPoints() {
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
  prPoints = prPoints.map((p) => {
    let hueValue = map(p.pr, minPr, maxPr, hueStart, hueEnd);

    return {
      lat: p.Y,
      long: p.X,
      pr: p.pr,
      x: map(p.X, minX, maxX, globalMinX, globalMaxX),
      y: map(p.Y, maxY, minY, globalMinY, globalMaxY),
      z: map(p.pr, minPr, maxPr, 0, 1), // You might need to adjust Z scale based on your data
      hue: Math.round(hueValue),
    };
  });
}

function draw() {
  background(360);

  fill(0, 100, 100);
  stroke(0, 100, 100);
  text("Z Scale", -width + 600, -height + 260);
  text("Relief Sphere Size", -width + 600, -height + 305);
  text("Precipitation Scale", -width + 600, -height + 350);
  text("Precipitation Sphere Size", -width + 600, -height + 395);
  text("Precipitation Elevation", -width + 600, -height + 440);
    text("Precipitation Sphere Size Dispersal", -width + 600, -height + 485);
    
  text("Click and drag to rotate", -width + 500, -height + 700);
  text("Scroll to zoom", -width + 500, -height + 770);

  directionalLight(255, 255, 255, 0, 0, -1); // Add some light

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

  // Update precip sphere size disperzal based on slider value
  prSphereSizeDispersal = prSphereSizeDispersalSlider.value();
  drawRelief();
  drawPrecipitation();
  drawInfoText();
}

function drawRelief() {
  // Draw each point and check for hovering
  for (let pt of points) {
    push();
    translate(pt.x, pt.y, pt.z + pt.z * zScale * 100);
    // Use a larger radius for the hit test to make it easier to hover over points
    if (
      dist(mouseX - width / 2, mouseY - height / 2, pt.x, pt.y) <
      reliefSphereSize * 2
    ) {
      hoveredPoints.push(pt); // Save the hovered point
      sphere(reliefSphereSize * 2);
    } else {
      stroke(pt.hue, 100 - pt.hue / 3, 100 - pt.hue / 3);
      sphere(reliefSphereSize);
    }
    // Render the sphere
    pop();
  }
}

function drawPrecipitation() {
  // Draw each point and check for hovering
  for (let pt of prPoints) {
    push();
    let z = map(pt.z, 0, 1, prElev, 100 + prScale * prElev);
    translate(pt.x, pt.y, z);
    // Use a larger radius for the hit test to make it easier to hover over points
    if (
      dist(mouseX - width / 2, mouseY - height / 2, pt.x, pt.y) <
      prSphereSize * 2
    ) {
      hoveredPoints.push(pt); // Save the hovered point
      sphere(prSphereSize * 2);
    } else {
      stroke(pt.hue, 100 - pt.hue / 7, 100);
      sphere(prSphereSize + map((prSphereSizeDispersal * (z)* 3), 0, 1, 0, 0.02));
    }
    // Render the sphere
    pop();
  }
}

function drawInfoText() {
  // Display the lat/long text if a point is hovered
  if (hoveredPoints.length > 0) {
    fill(0);
    noStroke();
    for (let i = 0; i < hoveredPoints.length; i++) {
      let hoveredPoint = hoveredPoints[i];

      if (hoveredPoint.pr) {
        text(
          `Lat: ${hoveredPoint.lat}, Long: ${hoveredPoint.long}, Precipitation: ${hoveredPoint.pr}`,
          mouseX / 2,
          mouseY / 2 - 35
        );
      } else {
        text(
          `X: ${hoveredPoint.long}, Y: ${hoveredPoint.lat}, Elevation: ${hoveredPoint.elevation}`,
          mouseX / 2,
          mouseY / 2 + i * 35
        );
      }
    }
  }
}
