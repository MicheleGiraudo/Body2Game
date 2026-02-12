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
}

function setup() {
  createCanvas(1500, 710);
  // Posiziona il protagonista in basso al centro
  protagonista = new Player(surfistadx, width/2 - 42.5, height - 120);
  bgY2 = -height;
  frameRate(30);

  // setup webcam
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Inizializza faceMesh
  try {
    facemesh = ml5.faceMesh(video, modelLoaded);
  } catch (error) {
    console.error("Errore nel caricamento di faceMesh:", error);
  }
}

function modelLoaded() {
  console.log("FaceMesh pronto!");
  modelReady = true;
}

function draw() {
  background(200);

  // GAME OVER
  if (vite <= 0) {
    fill(255, 0, 0);
    textSize(60);
    textAlign(CENTER);
    text("GAME OVER", width / 2, height / 2);
    noLoop();
    return;
  }

  // sfondo
  image(bgimg, 0, bgY1, width, height);
  image(bgimg, 0, bgY2, width, height);
  bgY1 += bgVel;
  bgY2 += bgVel;
  if (bgY1 >= height) bgY1 = bgY2 - height;
  if (bgY2 >= height) bgY2 = bgY1 - height;

  // FaceMesh predictions
  if (modelReady && facemesh) {
    getFacePredictions();
  }

  // mostra protagonista
  protagonista.update();
  protagonista.show();

  // genera oggetti
  if (random(1) < 0.05) {
    let imgs = [scoglio, boaG, boaP, alga];
    oggetti.push(new Oggetto(random(imgs)));
  }

  // muove e controlla oggetti
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
  let spazio = 5;
  let sizeCuore = 60;
  for (let i = 0; i < maxVite; i++) {
    let x = 20 + i * (sizeCuore + spazio);
    let y = 20;
    if (i < vite) {
      image(cuorePieno, x, y, sizeCuore, sizeCuore);
    } else {
      image(cuoreVuoto, x, y, sizeCuore, sizeCuore);
    }
  }
}

// --- funzione per ottenere la posizione del naso ---
function getFacePredictions() {
  if (!facemesh) return;

  facemesh.detect(video, gotFaces);
}

function gotFaces(results) {
  predictions = results;

  if (predictions && predictions.length > 0) {
    let nose = predictions[0].keypoints[1]; // punto naso
    let noseX = nose.x;
    
    // Mappa la posizione del naso sul canvas (inverti per controllo più naturale)
    let targetX = map(noseX, 0, video.width, width - protagonista.width, 0);
    protagonista.x = constrain(targetX, 0, width - protagonista.width);

    // cambiamo immagine in base alla direzione
    if (noseX < video.width / 2) {
      protagonista.imgShow = surfistadx;
    } else {
      protagonista.imgShow = surfistasx;
    }
  }
}