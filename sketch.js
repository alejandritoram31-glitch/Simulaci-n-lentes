let fSlider, objSlider;
let focalLength = 150;
let objX = -200; // Posición inicial del objeto respecto al centro
let objH = 80;   // Altura del objeto

function setup() {
  createCanvas(900, 500);
  
  // Slider para controlar la Distancia Focal (f)
  // De -300 (divergente) a 300 (convergente)
  fSlider = createSlider(-300, 300, 150);
  fSlider.position(20, 40);
  fSlider.style('width', '200px');

  // Slider para mover el objeto manualmente (o puedes usar el mouse)
  objSlider = createSlider(-400, -10, -200);
  objSlider.position(20, 80);
  objSlider.style('width', '200px');
}

function draw() {
  background(10);
  
  let centerX = width / 2;
  let centerY = height / 2;
  focalLength = fSlider.value();
  
  // Si el usuario arrastra el mouse, movemos el objeto
  if (mouseIsPressed && mouseY > 100) {
    objX = mouseX - centerX;
    if (objX > -10) objX = -10; // Evitar que cruce la lente
  } else {
    objX = objSlider.value();
  }

  drawUI(centerX, centerY);

  // --- EJE ÓPTICO ---
  stroke(100);
  line(0, centerY, width, centerY);

  // --- DIBUJAR LENTE ---
  drawLens(centerX, centerY, focalLength);

  // --- DIBUJAR FOCOS ---
  fill(255, 100, 100);
  noStroke();
  ellipse(centerX + focalLength, centerY, 10, 10); // Foco imagen
  ellipse(centerX - focalLength, centerY, 10, 10); // Foco objeto
  textSize(12);
  text("F", centerX + focalLength - 5, centerY + 25);
  text("F'", centerX - focalLength - 5, centerY + 25);

  // --- CÁLCULOS FÍSICOS (Ecuación de Lentes Delgadas) ---
  // 1/f = 1/do + 1/di  =>  di = 1 / (1/f - 1/do)
  // do es objX (negativo porque está a la izquierda)
  let doPos = -objX; 
  let di = 1 / ((1 / focalLength) - (1 / doPos));
  let magnification = -di / doPos;
  let imgH = objH * magnification;
  let imgX = di; // Posición de la imagen respecto al centro

  // --- DIBUJAR OBJETO (Flecha Verde) ---
  drawArrow(centerX + objX, centerY, objH, color(0, 255, 100), "Objeto");

  // --- TRAZADO DE RAYOS (Arcoíris) ---
  if (focalLength !== 0) {
    strokeWeight(1.5);
    
    // Rayo 1: Paralelo -> Foco
    drawRay(centerX + objX, centerY - objH, centerX, centerY - objH, centerX + imgX, centerY - imgH, color(255, 50, 50));
    
    // Rayo 2: Por el centro (no se desvía)
    drawRay(centerX + objX, centerY - objH, centerX, centerY, centerX + imgX, centerY - imgH, color(100, 100, 255));
    
    // Rayo 3: Por el foco -> Paralelo
    drawRay(centerX + objX, centerY - objH, centerX, centerY - (objH * (focalLength/(focalLength - doPos))), centerX + imgX, centerY - imgH, color(255, 255, 50));
  }

  // --- DIBUJAR IMAGEN (Flecha Azul/Cian) ---
  // Si di es negativo, la imagen es virtual (línea punteada)
  let isVirtual = di < 0;
  drawArrow(centerX + imgX, centerY, imgH, color(0, 200, 255), isVirtual ? "Imagen Virtual" : "Imagen Real", isVirtual);
}

// Función para dibujar flechas (Objeto e Imagen)
function drawArrow(x, y, h, col, label, dotted = false) {
  stroke(col);
  strokeWeight(3);
  if (dotted) drawingContext.setLineDash([5, 5]);
  else drawingContext.setLineDash([]);
  
  line(x, y, x, y - h);
  line(x, y - h, x - 5, y - h + (h > 0 ? 10 : -10));
  line(x, y - h, x + 5, y - h + (h > 0 ? 10 : -10));
  
  noStroke();
  fill(col);
  drawingContext.setLineDash([]);
  text(label, x - 20, y + (h > 0 ? 15 : -h + 15));
}

// Función para dibujar los rayos con sus proyecciones
function drawRay(x1, y1, x2, y2, x3, y3, col) {
  stroke(col);
  // Rayo incidente
  line(x1, y1, x2, y2);
  // Rayo refractado (prolongado hacia el borde de la pantalla)
  let angle = atan2(y3 - y2, x3 - x2);
  let farX = x2 + cos(angle) * 1000;
  let farY = y2 + sin(angle) * 1000;
  line(x2, y2, farX, farY);
  
  // Proyección virtual (si la imagen es virtual)
  if (x3 < width/2 || (x1 > width/2)) {
    strokeWeight(1);
    drawingContext.setLineDash([3, 3]);
    line(x2, y2, x3, y3);
    drawingContext.setLineDash([]);
  }
}

// Estética de la lente
function drawLens(x, y, f) {
  stroke(200, 200, 255, 150);
  fill(150, 200, 255, 50);
  strokeWeight(2);
  
  if (f > 0) { // Convergente (panzona)
    ellipse(x, y, 30, height - 100);
    line(x, 40, x - 10, 55); line(x, 40, x + 10, 55); // Flechas arriba
    line(x, height-40, x - 10, height-55); line(x, height-40, x + 10, height-55); 
  } else { // Divergente (delgada al centro)
    rect(x - 10, 50, 20, height - 100, 10);
    line(x-10, 40, x+10, 40); line(x, 40, x-10, 55); line(x, 40, x+10, 55); // Flechas invertidas
  }
}

function drawUI(cx, cy) {
  fill(255);
  noStroke();
  textSize(16);
  text("Simulador de Lentes Delgadas", 20, 25);
  textSize(12);
  text("Focal (f): " + focalLength, 230, 55);
  text("Posición Objeto: " + int(abs(objX)), 230, 95);
  text("Instrucciones: Arrastra el objeto con el mouse o usa los sliders.", 20, height - 20);
  
  if (focalLength > 0) fill(100, 255, 100); else fill(255, 100, 100);
  text(focalLength > 0 ? "CONVERGENTE (Lupa / Ojo)" : "DIVERGENTE (Miopía)", 20, 120);
}
