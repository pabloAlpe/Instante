
//shader
let shader1;
//Canvas
let cs;
let canvas;
let canvasWidth;
let canvasHeight;

//PINTURA
let xoff = .1;
let yoff = 0.2;
let xPos, yPos;
let mPosX =0;
let mPosY = 300;

let brushColor;
let brushSize;
let noiseScale = 1.5;
let noisePeriod = 10;

let numEllipses = 1000;
let paintScale; 

// Parámetros de distorsión
let ruidoX = 0.01;
let ruidoY = 0.03;

// Parámetros de montañas
let numMontanas;
let alturaMaxMontana;


// Parámetros de marco
let grosorMarco = .98;

// Parámetros adicionales
let numLineas;
let opacidadLineas = 235;

let color_pal = ['#e74646', '#0f64cd', '#576950', '#ffffff', '#000000'];
// cuadrado

let wC;
let hC;

let cB;

let img;

let bgColor;



const aspectRatio = 1 / 1.4;

function preload(){
  shader1 = loadShader('shader.vert','shade2r.frag');
}

function decisiones() {
  numLineas = map(m0, 0, 1, 0, 300);
  numMontanas = map(m1, 0, 1, 0, 100);
  alturaMaxMontana = map(m2, 0, 1, cs * 0.03, cs * 0.35);
  numCols = 6;

  const paintScaleRanges = {
    min: 1.2,
    max: 3.5,
  };

  const colors = [
    color(231, 70, 70),
    color(15, 100, 205),
    color(87, 105, 80),
    color(255, 255, 255),
    color(0, 0, 0),
  ];

  brushColor = color(255, 255, 255);
  paintScale = 0;

  for (let i = 0; i < colors.length; i++) {
    if (m4 >= (1 / numCols) * i) {
      brushColor = colors[i];
      paintScale = map(m4, (1 / numCols) * i, (1 / numCols) * (i + 1), paintScaleRanges.min, paintScaleRanges.max);
    } else {
      break;
    }
  }
}

function setup() {

    cs = min(windowHeight, windowWidth);
   
    canvas = createCanvas(cs, cs,WEBGL);
    noiseSeed(1)
   
    decisiones();
  
    img = createGraphics(width, height);
    bgColor =  color(246, 241, 233);
    frColor =  color(246, 241, 233);
   ;
   
 
  brushSize = cs*0.014;
  noiseSeed(map(m3,0,1,0,200));
  shader(shader1);
}


function draw() {
  // Set up background and draw elements
  img.background(bgColor);
  drawGrid();
  drawMountains();

  // Overlay and blend modes
  img.blendMode(OVERLAY);
  drawPaint(brushColor);
  img.blendMode(BLEND);

  // Draw sea and frame
  drawSea();
  drawFrame();

  // Apply rotation and draw on screen
  applyCenterRotation();
  drawScreen();

  // Trigger preview and stop looping
  triggerPreview();
  noLoop();
}


//MALLA FONDO
function drawGrid() {
  img.stroke(20, 20, 20,50);
  img.strokeWeight(cs*.0002);
  let gridSize = cs*0.005;

  for (let x = 0; x <= img.width; x += gridSize) {
    img.line(x, 0, x, img.height);
  }

  for (let y = 0; y <= img.height; y += gridSize) {
    img.line(0, y, img.width, y);
  }
}


// MANCHA PNTURA
function drawPaint(_color) {
  
  img.push();
  img.translate((img.width / 2), img.height/2 ); // Centrar la pincelada
  for (let i = 0; i < numEllipses; i++) {
    xPos = map(noise(xoff), 0, 1, -img.width / 6 * paintScale, img.width / 3 * paintScale);
    
    yPos = map(noise(yoff), 0, 1, -img.height / 4 * paintScale, img.height / 4 * paintScale);
  
 
    let newSize = map(noise(xoff * 40), 0, 1, brushSize * 0.2 * paintScale, brushSize * 2 * paintScale);
    
  
    let progress = i / (numEllipses - 1);
    let startOpacity = 0;
    let middleOpacity = 60;
    let endOpacity = 0;
    let newOpacity;

    if (progress < 0.5) {
      newOpacity = lerp(startOpacity, middleOpacity, progress * 2);
    } else {
      newOpacity = lerp(middleOpacity, endOpacity, (progress - 0.5) * 2);
    }

    img.push();
    img.translate(xPos, yPos);
    img.fill(_color, newOpacity);
    img.noStroke();

    let ellipseWidth = newSize * noise(xoff * noisePeriod, yoff * noisePeriod);
    let ellipseHeight = newSize * noise(yoff * noisePeriod, xoff * noisePeriod);
  
    img.ellipse(0 + mPosX, 0 + mPosY, ellipseWidth, ellipseHeight);
    img.pop();

    xoff += noiseScale;
    yoff += noiseScale;
  }
  img.pop();
}

function applyCenterRotation() {

    wC = map(m3,0,1,0,1.);
    wH = map(m3,0,1,1,0);
  let rotatedImg = createGraphics(canvas.width, canvas.height);
  let rectWidth = rotatedImg.width * wC;
  let rectHeight = rotatedImg.height;
  let rectX = (width - rectWidth) / 2;
  let rectY = int((height - rectHeight) / 2);
  rotatedImg.image(img, 0, 0);
  rotatedImg.push();
  rotatedImg.translate(width / 2, height / 2);
  rotatedImg.rotate(PI);
  rotatedImg.image(img, -width / 2, -height / 2);
  rotatedImg.pop();

  img.copy(
    rotatedImg,
    rectX,
    rectY,
    rectWidth,
    rectHeight,
    rectX,
    rectY,
    rectWidth,
    rectHeight
  );
}





function drawMountains() {
  let ruidoMontana = map(m2,0,1,0.006,0.0015);
  img.fill(20, 22, 26, 50);
  img.strokeWeight(cs*0.001);
 
  for (let i = 0; i < numMontanas; i++) {
    let alturaMontana = map(i, 0, numMontanas, alturaMaxMontana, 0);
    let colorMontana =map(i, 0, numMontanas, 100, 200);
    img.stroke(colorMontana);
    img.beginShape();
    for (let x = 0; x <= canvas.width; x++) {
      let n = noise(x * ruidoMontana, i );
      let offsetY = map(n, 0, 1, -alturaMontana / 2, alturaMontana / 2);
      img.vertex(x, height / 2 - alturaMontana + offsetY);
    }
    img.endShape();
  }
}

function drawSea() {
  let randomSeedCircles = 100;
  img.fill(220, 220, 220, 255);
  img.strokeWeight(cs*0.001);
  for (let y = height / 2; y < height; y += height / numLineas) {
    let vertices = [];
    img.beginShape();
  
    for (let x = 0; x <= width; x++) {
    
      let n = noise(x * ruidoX, y * ruidoY);
      let offsetY = map(n, 0, 1, -cs/100, cs/100);
      let c = map(y, height / 2, height, cs/100, cs/90);
      img.stroke(c, opacidadLineas);
      let vertexX = x;
      let vertexY = y + offsetY;
      img.vertex(vertexX, vertexY);
      vertices.push(createVector(vertexX, vertexY));
    }
    img.endShape();
    let randomVertexIndex = floor(random(vertices.length));
    let randomVertex = vertices[randomVertexIndex];
    img.fill(0, 90);
    img.noStroke();
   // img.ellipse(randomVertex.x, randomVertex.y, random(10.));
  }
}


function drawFrame() {
  img.noStroke();
  img.fill(frColor);
  let grosorMarco = cs*0.08;
  img.rect(0, 0, canvas.width, grosorMarco); // Parte superior del marco
  img.rect(0, canvas.height - grosorMarco, canvas.width, grosorMarco); // Parte inferior del marco
  img.rect(0, 0, grosorMarco, canvas.height); // Parte izquierda del marco
  img.rect(canvas.width - grosorMarco, 0, grosorMarco, canvas.height); // Parte derecha del marco
}



function keyPressed() {
  if (key === "1") {
    downloadImage(2);
  }
  if (key === "2") {
    downloadImage(4);
  }

}

function downloadImage(scaleFactor) {
  let canvas = document.getElementById("defaultCanvas0");
  let imgData = canvas.toDataURL("image/png", scaleFactor);
  let link = document.createElement("a");
  link.download = "myArt.png";
  link.href = imgData;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function drawScreen() {
  shader1.setUniform("texture", img);
 // shader1.setUniform("colorBorde.", bgColor);
  // shader1.setUniform('noise')
  shader1.setUniform('u_borde', grosorMarco)
  rect(-width / 2, -height / 2, width, height);
}



