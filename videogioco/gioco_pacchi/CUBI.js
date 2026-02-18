let personaggio;
let cubi = [];
let colori;
let immagini = {};
let pilaCont = 0;
let coloreOra;
let ultimoColoCam = 0;
let colorInterval = 7000;

let gameOver = false;
let win = false;

let pila;

let blu, rosso, verde, giallo;
let babboDx, babboSx;
let sfondo; 
let imgVinto, imgPerso;

let pauseImg;

// font
let arcadeFont;

// Tracking
let bodyPose;
let handPose;
let poses = [];
let hands = [];
let connections;
let video;

let schema = 1; // 1 = gioco, 0 = pausa

let options = {
  maxHands: 2,
  flipped: false,
  runtime: "mediapipe",
  modelType: "full"
};

function preload(){
    blu = loadImage("./img/regalo_blu.png");
    rosso = loadImage("./img/regalo_rosso.png");
    verde = loadImage("./img/regalo_verde.png");
    giallo = loadImage("./img/regalo_giallo.png");

    babboDx = loadImage("./img/babbo_natale_Dx.png");
    babboSx = loadImage("./img/babbo_natale_Sx.png");

    sfondo = loadImage("./img/sfondo_gioco.jpeg"); 

    imgVinto = loadImage("./img/hai_vinto.jpeg");
    imgPerso = loadImage("./img/hai_perso.jpeg");

    pauseImg = loadImage('./img/pause.png');

    arcadeFont = loadFont('./font/PressStart2P-Regular.ttf');
    
    bodyPose = ml5.bodyPose();
    handPose = ml5.handPose(options, modelReady);
}

function modelReady() {
  console.log("Hand Pose Model Loaded!");
}

function setup(){
    createCanvas(windowWidth-21, windowHeight-21); 
    frameRate(60);

    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
    
    bodyPose.detectStart(video, gotPoses);
    handPose.detectStart(video, gotHands);
    
    connections = bodyPose.getSkeleton();

    personaggio = new Player();

    colori = ["blu", "rosso", "verde", "giallo"];
    coloreOra = random(colori);

    pila = width - 100;

    for(let k = 0; k < 7; k++){
        cubi.push(new Cubo());
    }
}

function draw(){
    image(sfondo, 0, 0, width, height); 

    disegnaSchermoColore();

    if (!gameOver && !win) {

        // SOLO SE STO GIOCANDO
        if (schema === 1) {
            cambiaColoreTempo();
            personaggio.move();
        }

        personaggio.show();

        for (let cubo of cubi){

            if(!cubo.taken){

                if (schema == 1) {

                    cubo.scendi();

                    if(cubo.y > height){ 
                        cubo.reset();
                    }

                    if(collide(personaggio, cubo)){

                        if(cubo.nome == coloreOra){
                            cubo.taken = true; 
                            cubo.speed = 0;

                            cubo.x = pila;
                            cubo.y = height - cubo.size * (pilaCont + 1);
                            pilaCont++;

                            if(pilaCont >= 5){
                                win = true;
                            }

                        } else {
                            gameOver = true;
                        }
                    }
                }
            }

            cubo.show();
        }

    } else {
        schermataFinale();
    }

    if (schema == 0) {
        fill(0, 150);
        rect(0, 0, width, height);

        let imgSize = 400;

        imageMode(CENTER);
        image(pauseImg, width / 2, height / 2, imgSize, imgSize);
        imageMode(CORNER);
    }
}

function cambiaColoreTempo() {
    let tempoPassato = millis() - ultimoColoCam;

    if (tempoPassato > colorInterval) {
        coloreOra = random(colori);
        ultimoColoCam = millis();
    }
}

function disegnaSchermoColore() {
    textAlign(CENTER, CENTER);
    textSize(100);
    textFont(arcadeFont);
    noStroke();

    let scritta = "";
    let col = color(255);

    switch(coloreOra) {
        case "verde": 
            scritta = "GREEN"; 
            col = color(255, 0, 0);
            break;
        case "blu": 
            scritta = "BLU"; 
            col = color(255, 255, 0);
            break;
        case "giallo": 
            scritta = "YELLOW"; 
            col = color(0, 0, 255);
            break;
        case "rosso": 
            scritta = "RED"; 
            col = color(0, 255, 0);
            break;
    }

    fill(col);
    text(scritta, width / 2, height * 0.1);
}

function schermataFinale(){
    if(win){
        image(imgVinto, 0, 0, width, height);
    } else {
        image(imgPerso, 0, 0, width, height);
    }
}

function collide(a, b){
    let playerLeft = a.x + a.size * 0.35;
    let playerRight = a.x + a.size * 0.65;

    let playerTop = a.y + a.size * 0.15;
    let playerBottom = a.y + a.size * 0.85;

    return (
        playerLeft < b.x + b.size &&
        playerRight > b.x &&
        playerTop < b.y + b.size &&
        playerBottom > b.y
    );
}

function gotPoses(results) {
  poses = results;
}

function gotHands(results) {
  hands = results;
}

function keyPressed() {
  if (keyCode == ESCAPE && !gameOver && !win) {

    if (schema == 1) {
      schema = 0; // pausa
    } else {
      schema = 1; // riprendi
    }

  }
} 