
let AMP_MIN = 0.0;
let AMP_MAX = 0.25;

let NOTA_MIN = 48;
let NOTA_MAX = 60;

let monitor = true;

let umbralRuido = 0.1;
let umbralDuracionSonido = 1000;
let sliderFrec;
let sliderAmp;

let vozDetectada = false;

let ultimoAplauso = 0;
let bloquearVozHasta = 0;

let calibrandoAmp = true;

let intensidad = 0;

let mic;
let amp = 0;

let pisoAmp = Infinity;
let techoAmp = -Infinity;

let pitch;
const model_url =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

let frec = 0;
let notaMidi = 0;
let altura = 0;
let difAltura = 0;

let gestorAmp;

let audioIniciado = false;

let fondo;

let margen = 300;

let imagenes = [];
let tints = [];

let movimientoY;
let movimientoX;

let coloresAzules = [];
let coloresOtros = [];

let objetos = [];   // imágenes en pantalla
let activa = -1;    // índice de la imagen activa
let velocidad = 10;

function preload() {
  for (let i = 1; i <= 13; i++) {
    imagenes[i] = loadImage('data/' + i + '.png');
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fondo = color(92, 128, 158);

  sliderFrec = createSlider(100, 600, 250);
sliderFrec.position(20, 20);
sliderFrec.style('width', '200px');

sliderAmp = createSlider(0, 100, 3);
sliderAmp.position(20, 60);
sliderAmp.style('width', '200px');

  mic = new p5.AudioIn();
  
  gestorFrec = new GestorSenial(NOTA_MIN, NOTA_MAX);
  gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);

  tints = [
    color(60, 93, 128),   // 1 azul
    color(174, 131, 56),  // 2 amarillo
    color(120, 151, 159), // 3 azul
    color(78, 112, 137),  // 4 azul
    color(187, 81, 81),   // 5 rojo
    color(60, 93, 128),   // 6 azul
    color(123, 111, 68),  // 7 amarillo
    color(39, 42, 45),    // 8 negro
    color(60, 93, 128),   // 9 azul
    color(174, 131, 56),  // 10 amarillo
    color(120, 151, 159), // 11 azul
    color(187, 81, 81),   // 12 rojo
    color(60, 93, 128),   // 13 azul
     color(187, 81, 81), // 14 rojo
  ];
  coloresAzules = [
  color(60, 93, 128),
  color(120, 151, 159),
  color(78, 112, 137)
];

coloresOtros = [
  color(174, 131, 56), // amarillo
  color(123, 111, 68), // amarillo oscuro
  color(187, 81, 81),  // rojo
  color(39, 42, 45)    // negro
];
}

function draw() {
  background(fondo);
  
 if (!audioIniciado) {
   textSize(40);
   text ('Haga click para comenzar', width/2-250, height/2);
   
 }
   amp = mic.getLevel();
   
  let esAplauso = amp > 0.18 && gestorAmp.derivada > 2.0;

if (
  esAplauso &&
  millis() - ultimoAplauso > 500 &&
  activa != -1
) {
  objetos[activa].anguloDestino -= 20;

  ultimoAplauso = millis();
  bloquearVozHasta = millis() + 700;
}

  gestorAmp.actualizar(amp);

  let umbralFrec = sliderFrec.value();
  let umbralAmp = sliderAmp.value() / 100;

if (
    millis() > bloquearVozHasta &&
    amp > 0.02 &&
    amp < 0.15 &&
    !vozDetectada
) {
  
let imagenElegida = int(random(1, 14));
let colorElegido;
let esAzul = (objetos.length < 4);

if (esAzul) {
  colorElegido = random(coloresAzules);
} else {
  colorElegido = random(coloresOtros);
}

objetos.push({
  img: imagenElegida,
  tinte: colorElegido,
  esAzul: esAzul,
  tam: esAzul ? 600 : 500,
  x: width / 2,
  y: height / 2,
  angulo: 0,
  anguloDestino: 0,
  vx: movimientoX,
  vy: movimientoY
});

  activa = objetos.length - 1;

  vozDetectada = true;}
  
if (
    amp < 0.01 &&
    millis() > bloquearVozHasta
) {
    vozDetectada = false;
}

  imageMode(CENTER);
  
  if (activa !== -1) {
    if (frec > umbralFrec) {
    objetos[activa].vy = -3;
  } else {
    objetos[activa].vy = 3;
  }
  
   if (amp > umbralAmp) {
    objetos[activa].vx = -10;
  } else {
    objetos[activa].vx = 10;
  }
  
  // Movimiento
  objetos[activa].x += objetos[activa].vx;
  objetos[activa].y += objetos[activa].vy;
  
  // Límites de la zona central
  let mitad = objetos[activa].tam / 2 * 0.35;
  
  let izq = width * 0.15;
let der = width * 0.85;
let arriba = height * 0.12;
let abajo = height * 0.82;

/*let izq = width * 0.10;
let der = width * 0.90;
let arriba = height * 0.08;
let abajo = height * 0.92;*/

  // ============================
  // FIGURAS AZULES
  // ============================

  if (objetos[activa].esAzul) {

    // No pueden entrar al rectángulo

    if (
      objetos[activa].x + mitad > izq &&
      objetos[activa].x - mitad < der &&
      objetos[activa].y + mitad > arriba &&
      objetos[activa].y - mitad < abajo
    ) {

      let dIzq = abs((objetos[activa].x + mitad) - izq);
      let dDer = abs(der - (objetos[activa].x - mitad));
      let dArriba = abs((objetos[activa].y + mitad) - arriba);
      let dAbajo = abs(abajo - (objetos[activa].y - mitad));

      let minimo = min(dIzq, dDer, dArriba, dAbajo);

      if (minimo == dIzq) {
        objetos[activa].x = izq - mitad;
        objetos[activa].vx *= -1;
      }

      else if (minimo == dDer) {
        objetos[activa].x = der + mitad;
        objetos[activa].vx *= -1;
      }

      else if (minimo == dArriba) {
        objetos[activa].y = arriba - mitad;
        objetos[activa].vy *= -1;
      }

      else {
        objetos[activa].y = abajo + mitad;
        objetos[activa].vy *= -1;
      }

    }

  }

  // ============================
  // FIGURAS CÁLIDAS
  // ============================

  else {

    if (objetos[activa].x - mitad < izq) {
      objetos[activa].x = izq + mitad;
      objetos[activa].vx *= -1;
    }

    if (objetos[activa].x + mitad > der) {
      objetos[activa].x = der - mitad;
      objetos[activa].vx *= -1;
    }

    if (objetos[activa].y - mitad < arriba) {
      objetos[activa].y = arriba + mitad;
      objetos[activa].vy *= -1;
    }

    if (objetos[activa].y + mitad > abajo) {
      objetos[activa].y = abajo - mitad;
      objetos[activa].vy *= -1;
    }

  }

if (objetos[activa].x > width + margen) {
  objetos[activa].x = -margen;
}
else if (objetos[activa].x < -margen) {
  objetos[activa].x = width + margen;
}

if (objetos[activa].y > height + margen) {
  objetos[activa].y = -margen;
}
else if (objetos[activa].y < -margen) {
  objetos[activa].y = height + margen;
}}

  for (let i = 0; i < objetos.length; i++) {
    objetos[i].angulo = lerp(
    objetos[i].angulo,
    objetos[i].anguloDestino,
    0.08
  );
    tint(objetos[i].tinte);
    push();

translate(objetos[i].x, objetos[i].y);
rotate(radians(objetos[i].angulo));

tint(objetos[i].tinte);

image(
  imagenes[objetos[i].img],
  0,
  0,
  objetos[i].tam,
  objetos[i].tam
);

pop();}
  fill(255);
textSize(16);

text("Frecuencia: " + umbralFrec, 240, 35);
text("Volumen: " + nf(umbralAmp,1,2), 240, 75);
fill(255);
  noTint();
  if (gestorAmp.derivada > 0.2) {
  console.log(
    "Amp:", amp.toFixed(3),
    "Derivada:", gestorAmp.derivada.toFixed(3)
  );
}
}
function mousePressed() {
  if (!audioIniciado) {
    userStartAudio();
    mic.start(() => {
      startPitch();
    });
    audioIniciado = true;}}
  
  function startPitch() {

  let audioContext = getAudioContext();

  try {
    pitch = ml5.pitchDetection(
      model_url,
      audioContext,
      mic.stream,
      modelLoaded
    );
  } catch (e) {
    console.error(e);
  }
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch((err, frequency) => {

    if (frequency) {
      frec = frequency;
    }

    getPitch();
  });
}
