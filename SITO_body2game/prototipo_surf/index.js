let bgimg;
let surfistadx;
let surfistasx;
let protagonista;
let oggetti = [];
let scoglio, boaG, boaP, alga;
let bgY1 = 0, bgY2;
let bgVel = 5;

let cuorePieno, cuoreVuoto;
let maxVite = 3;
let vite = maxVite;

// FaceMesh
let video;
let facemesh;
let predictions = [];
let modelReady = false;

let schema = 1;
let pausa;
let paused;

let gameOver;

let pixelFont;

// Cronometro
let startTime;
let elapsedTime = 0;
let timerRunning = false;

function preload() {
  bgimg = loadImage('./img/sfondo.png');
  surfistadx = loadImage('./img/surfdx.png');
  surfistasx = loadImage('./img/surfsx.png');

  scoglio = loadImage('./img/scogli.png');
  boaG = loadImage('./img/boa.png');
  boaP = loadImage('./img/boaPiccola.png');
  alga = loadImage('./img/alghe.png');

  cuorePieno = loadImage('./img/cuorePieno.png');
  cuoreVuoto = loadImage('./img/cuoreVuoto.png');

  pausa = loadImage('./img/pause.png');

  pixelFont = loadFont("./font/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(1500, 710);
  protagonista = new Player(surfistadx, width / 2 - 42.5, height - 120);
  bgY2 = -height;
  frameRate(30);

  // Inizializza pausa
  paused = new Pausa(pausa);

  // Avvia cronometro
  startTime = millis();
  timerRunning = true;

  // setup webcam
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Inizializza FaceMesh
  try {
    facemesh = ml5.faceMesh(video, modelLoaded);
  } catch (error) {
    console.error("Errore nel caricamento di FaceMesh:", error);
  }
}

function modelLoaded() {
  console.log("FaceMesh pronto!");
  modelReady = true;
}

function draw() {

  // Aggiorna cronometro solo quando schema == 1 e vite > 0
  if (timerRunning && schema === 1 && vite > 0) {
    elapsedTime = millis() - startTime;
  }

  // sfondo
  if (schema === 1) {
    image(bgimg, 0, bgY1, width, height);
    image(bgimg, 0, bgY2, width, height);
    bgY1 += bgVel;
    bgY2 += bgVel;
    if (bgY1 >= height) bgY1 = bgY2 - height;
    if (bgY2 >= height) bgY2 = bgY1 - height;
  } else if (schema === 2) {
    image(paused.imgShows, 0, 0, width, height);
  } else if (schema === 3) {
    background(0);
    textFont(pixelFont);
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    textSize(75);
    text("GAME OVER", width / 2, height / 2 - 80);

    // Mostra il tempo finale
    let secondiTotali = floor(elapsedTime / 1000);
    let minuti = floor(secondiTotali / 60);
    let secondi = secondiTotali % 60;
    let millesimi = floor((elapsedTime % 1000) / 10);
    let tempoFormattato = nf(minuti, 2) + ":" + nf(secondi, 2) + ":" + nf(millesimi, 2);

    fill(255);
    textSize(35);
    text("TEMPO: " + tempoFormattato, width / 2, height / 2 + 20);
  }

  // FaceMesh predictions
  if (modelReady && facemesh && schema === 1) {
    getFacePredictions();
  }

  // gestione ostacoli che arrivano dall'alto
  if (schema === 1) {

    // mostra protagonista
    protagonista.update();
    protagonista.show();

    // genera nuovi ostacoli
    if (random(1) < 0.05) {
      let imgs = [scoglio, boaG, boaP, alga];
      oggetti.push(new Oggetto(random(imgs)));
    }

    // muove e mostra oggetti
    for (let i = oggetti.length - 1; i >= 0; i--) {
      oggetti[i].move();
      oggetti[i].show();
      if (protagonista.collide(oggetti[i]) && !protagonista.invincibile) {
        vite--;
        protagonista.attivaInvincibilita();
        oggetti.splice(i, 1);
        continue;
      }
      if (oggetti[i].fuoriSchermo()) {
        oggetti.splice(i, 1);
      }
    }

    // disegna cuori vite
    let spazio = 50;
    let sizeCuore = 100;
    for (let i = 0; i < maxVite; i++) {
      let x = 20 + i * spazio;
      let y = 20;
      if (i < vite) {
        image(cuorePieno, x, y, sizeCuore, sizeCuore);
      } else {
        image(cuoreVuoto, x, y, sizeCuore, sizeCuore);
      }
    }

    // Mostra cronometro in gioco
    let secondiTotali = floor(elapsedTime / 1000);
    let minuti = floor(secondiTotali / 60);
    let secondi = secondiTotali % 60;
    let millesimi = floor((elapsedTime % 1000) / 10);
    let tempoFormattato = nf(minuti, 2) + ":" + nf(secondi, 2) + ":" + nf(millesimi, 2);

    textFont(pixelFont);
    textAlign(RIGHT, TOP);
    textSize(20);
    fill(255);
    text(tempoFormattato, width - 20, 20);
  }

  // GAME OVER
  if (vite <= 0 && schema !== 3) {
    timerRunning = false; // Ferma il cronometro
    schema = 3;
  }
}

// funzione per ottenere la posizione del naso
function getFacePredictions() {
  if (!facemesh) return;
  facemesh.detect(video, gotFaces);
}

function gotFaces(results) {
  predictions = results;

  if (predictions && predictions.length > 0) {
    let nose = predictions[0].keypoints[1];
    let noseX = nose.x;

    let targetX = map(noseX, 0, video.width, width - protagonista.width, 0);
    protagonista.x = constrain(targetX, 0, width - protagonista.width);

    if (noseX < video.width / 2) {
      protagonista.imgShow = surfistadx;
    } else {
      protagonista.imgShow = surfistasx;
    }
  }
}

// pausa con tasto ESC
function keyPressed() {
  if (keyCode === ESCAPE) {
    if (schema === 1) {
      schema = 2;
      timerRunning = false;
    } else if (schema === 2) {
      schema = 1;
      startTime = millis() - elapsedTime; // riprendi dal punto giusto
      timerRunning = true;
    }
  }
}