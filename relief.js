let reliefData;
let easycam;
let font;
let maxElevation = 0; // You'll need to know the max elevation for proper scaling
let width = window.innerWidth;
let height = window.innerHeight;
let points = []; // Array to hold the scaled points
let zScaleSlider;
let zScale = 70; // Initial Z scale value
let previousZScale = zScale; // Used to scale the Z values based on the slider value

function preload() {
  // Assuming your data is in a JSON format
  reliefData = loadTable("./relief_random_1.csv", "csv", "header");
  font = loadFont("./assets/Inconsolata-Medium.ttf");
}

function setup() {
  createCanvas(width, height, WEBGL);
  let initDistance = (width + height) / 2;
  easycam = createEasyCam().setDistance(initDistance);
  colorMode(HSB, 360, 100, 100); // Set color mode to HSB
  textFont(font, 28);

  // Create a slider to control the Z scale
  zScaleSlider = createSlider(0, 100, zScale, 1);
  zScaleSlider.position(200, 20);

  // Find max elevation for scaling Z values
  for (let i = 0; i < reliefData.rows.length; i++) {
    let z = reliefData.rows[i][2];
    if (z > maxElevation) {
      maxElevation = z;
    }
  }
  transformData();
  normalizePoints();
}
function transformData() {
  // Transform the data to an array of objects
  for (let i = 0; i < reliefData.rows.length; i++) {
    let x = reliefData.rows[i].arr[0];
    let y = reliefData.rows[i].arr[1];
    let z = reliefData.rows[i].arr[2];
    points.push({ X: x, Y: y, Z: z });
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Update the camera distance based on the new window size.
  let newDistance = (windowWidth + windowHeight) / 6; // Adjust this formula as needed
  easycam.setDistance(newDistance);
}

function normalizePoints() {
  let hueStart = 180; // Hue for lowest elevation
  let hueEnd = 0; // Hue for highest elevation (e.g., 120 for green)

  // Find the min and max for X and Y to center the points
  let minX = Math.min(...reliefData.rows.map((p) => Number(p.obj.X)));
  let maxX = Math.max(...reliefData.rows.map((p) => Number(p.obj.X)));
  let minY = Math.min(...reliefData.rows.map((p) => Number(p.obj.Y)));
  let maxY = Math.max(...reliefData.rows.map((p) => Number(p.obj.Y)));
  let minZ = Math.min(...reliefData.rows.map((p) => Number(p.obj.Z)));
  let maxZ = Math.max(...reliefData.rows.map((p) => Number(p.obj.Z)));

  // Center and scale the points
  points = points.map((p) => {
    let hueValue = map(p.Z, minZ, maxZ, hueStart, hueEnd);

    return {
      x: map(p.X, minX, maxX, -width / 2, width / 2),
      y: map(p.Y, minY, maxY, height / 2, -height / 2),
      z: map(p.Z, minZ, maxZ, -zScale, zScale), // You might need to adjust Z scale based on your data
      hue: Math.round(hueValue),
    };
  });
  console.log(points);
}

function draw() {
  background(360);

  fill(0, 100, 100);
  stroke(0, 100, 100);
  text("Z Scale", -width + 500, -height + 260);
  text("Click and drag to rotate", -width + 500, -height + 400);
  text("Scroll to zoom", -width + 500, -height + 440);

  directionalLight(255, 255, 255, 0, 0, -1); // Add some light

  rotateX(PI / 8);

  let newZScale = zScaleSlider.value();

  if (newZScale !== previousZScale) {
    zScale = newZScale;
    // Scale the Z values based on the slider value
    points = points.map((p) => {
      return {
        x: p.x,
        y: p.y,
        z: map(p.z, -previousZScale, previousZScale, -zScale, zScale),
        hue: p.hue,
      };
    });

    // Update previousZScale to the new zScale after scaling points
    previousZScale = zScale;
  }

  // Draw each point
  for (let pt of points) {
    push();
    translate(pt.x, pt.y, pt.z);
    stroke(pt.hue, 100 - pt.hue / 3, 100 - pt.hue / 3);
    sphere(5); // Adjust size as needed

    pop();
  }
}
