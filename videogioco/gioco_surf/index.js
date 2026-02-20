let bgimg;
let surfistadx;
let surfistasx;
let protagonista;
let oggetti = [];
let scoglio;
let boaG;
let boaP;
let alga;
let bgY1 = 0;
let bgY2;
let bgVel = 5;

let cuorePieno;
let cuoreVuoto;
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

//PULSANTI
let btnRestart, btnMenu
let buttonsVisible = false

// Suoni
let suonoGameOver, suonoDanno

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

  pixelFont = loadFont('./font/PressStart2P-Regular.ttf');

  suonoGameOver = loadSound('./sounds/gameOverSound.mp3');
  suonoDanno = loadSound('./sounds/hurtSound.mp3');
}

function setup() {
  createCanvas(1500, 710);
  protagonista = new Player(surfistadx, width / 2 - 42.5, height - 120);
  bgY2 = -height;
  frameRate(30);

  // Modifica qui larghezza e altezza dell'immagine di pausa
  paused = new Pausa(pausa, 800, 500);

  startTime = millis();
  timerRunning = true;

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  try {
    facemesh = ml5.faceMesh(video, modelLoaded);
  } catch (error) {
    console.error("Errore nel caricamento di FaceMesh:", error);
  }

  // Crea pulsanti Restart e Menu
  btnRestart = createButton('▶ RESTART')
  styleButton(btnRestart, '#FFD700', '#000')
  btnRestart.mousePressed(restartGame)
  btnRestart.hide()

  btnMenu = createButton('⌂ MENU')
  styleButton(btnMenu, '#FF4444', '#fff')
  btnMenu.mousePressed(() => window.location.href = '../index.html')
  btnMenu.hide()
}

function styleButton(btn, bgColor, textColor) {
    btn.style('font-family', 'monospace')
    btn.style('font-size', '16px')
    btn.style('background', bgColor)
    btn.style('color', textColor)
    btn.style('border', '4px solid #000')
    btn.style('padding', '14px 28px')
    btn.style('cursor', 'pointer')
    btn.style('position', 'absolute')
    btn.style('box-shadow', '4px 4px 0px #000')
    btn.style('letter-spacing', '2px')
    btn.elt.onmouseover = () => btn.style('transform', 'translate(-2px,-2px)')
    btn.elt.onmouseout  = () => btn.style('transform', 'translate(0,0)')
}

function showButtons() {
    if (buttonsVisible) return
    buttonsVisible = true
    let rect = document.querySelector('canvas').getBoundingClientRect()
    let cx = rect.left + rect.width / 2
    let cy = rect.top + rect.height / 2
    btnRestart.position(cx - 160, cy + 130)
    btnMenu.position(cx + 20, cy + 130)
    btnRestart.show()
    btnMenu.show()
}

function hideButtons() {
    buttonsVisible = false
    btnRestart.hide()
    btnMenu.hide()
}

function restartGame() {
    hideButtons()
    vite = maxVite
    oggetti = []
    schema = 1
    bgY1 = 0
    bgY2 = -height
    elapsedTime = 0
    startTime = millis()
    timerRunning = true
    protagonista = new Player(surfistadx, width / 2 - 42.5, height - 120)
}

function modelLoaded() {
  console.log("FaceMesh pronto!");
  modelReady = true;
}

function draw() {

  if (timerRunning && schema === 1 && vite > 0) {
    elapsedTime = millis() - startTime;
  }

  if (schema === 1) {
    image(bgimg, 0, bgY1, width, height);
    image(bgimg, 0, bgY2, width, height);
    bgY1 += bgVel;
    bgY2 += bgVel;
    if (bgY1 >= height) bgY1 = bgY2 - height;
    if (bgY2 >= height) bgY2 = bgY1 - height;
  } else if (schema === 2) {
    // Mostra il background fermo (senza aggiornare bgY1/bgY2)
    image(bgimg, 0, bgY1, width, height);
    image(bgimg, 0, bgY2, width, height);
    // Mostra anche il protagonista e gli oggetti fermi
    protagonista.show();
    for (let i = 0; i < oggetti.length; i++) {
      oggetti[i].show();
    }
    // Sovrapponi l'immagine di pausa centrata
    
    noStroke();
    fill(0, 150);
    rect(0, 0, width, height);

    paused.show();

    // Scritta "press ESC to resume" in basso
    textFont(pixelFont)
    textAlign(CENTER, CENTER)
    noStroke()
    fill(200, 200, 200)
    textSize(12)
    text("Press ESC to resume", width / 2, height * 0.88)

    showButtons()
    
  } else if (schema === 3) {
    background(0);
    textFont(pixelFont);
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    textSize(75);
    text("GAME OVER", width / 2, height / 2 - 80);

    let secondiTotali = floor(elapsedTime / 1000);
    let minuti = floor(secondiTotali / 60);
    let secondi = secondiTotali % 60;
    let millesimi = floor((elapsedTime % 1000) / 10);
    let tempoFormattato = nf(minuti, 2) + ":" + nf(secondi, 2) + ":" + nf(millesimi, 2);

    fill(255);
    textSize(35);
    text("TIME: " + tempoFormattato, width / 2, height / 2 + 20);

    showButtons()
  }

  if (modelReady && facemesh && schema === 1) {
    getFacePredictions();
  }

  if (schema === 1) {

    protagonista.update();
    protagonista.show();

    if (random(1) < 0.08) {
      let imgs = [scoglio, boaG, boaP, alga];
      oggetti.push(new Oggetto(random(imgs)));
    }

    for (let i = oggetti.length - 1; i >= 0; i--) {
      oggetti[i].move();
      oggetti[i].show();
      if (protagonista.collide(oggetti[i]) && !protagonista.invincibile) {
        suonoDanno.setVolume(0.5);
        suonoDanno.rate(0.5);
        suonoDanno.play();

        vite--;
        protagonista.attivaInvincibilita();
        oggetti.splice(i, 1);
        continue;
      }
      if (oggetti[i].fuoriSchermo()) {
        oggetti.splice(i, 1);
      }
    }

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

  // GAME OVER - il suono parte UNA SOLA VOLTA quando le vite arrivano a 0
  if (vite <= 0 && schema !== 3) {
    timerRunning = false;
    schema = 3;
    suonoGameOver.setVolume(0.5);
    suonoGameOver.rate(0.5);
    suonoGameOver.play();
  }
}

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

// tasto esc per la pausa
function keyPressed() {
  if (keyCode === ESCAPE) {
    if (schema === 1) {
      schema = 2;
      timerRunning = false;
    } else if (schema === 2) {
      schema = 1;
      startTime = millis() - elapsedTime;
      timerRunning = true;
      hideButtons()
    }
  }
}