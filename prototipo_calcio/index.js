// HAND TRACKING
let model
let video
let predictions = []

//IMMAGINI                
let bgimg //immagine di sfondo
let pallaImg
let guantoImg
let goalImg
let parateImg

//OBJECT
let palla
let guanto

//POSITION
let xPalla = 730
let yPalla = 480
let xGuanto = 700
let yGuanto = 190

//BACKGROUND
let Ximg = 1520 
let Yimg = 705

//V OGGETTI
let vPalla = 40
let t = 1
let vGuanto = 20

//tempo
let secondi = 0
let tempoInizioTiro = 0 // <-- AGGIUNTO per il timer dei 5 secondi

//impostazioni del gioco
let stato = "gioco" // "gioco" | "goal"
let timerGoal = 0
let durataGoal = 72 
let counterParate = 0 

// Variabili per il tracciamento della mano
let handX = 0
let handY = 0
let handDetected = false
let modelLoaded = false

//font per il counter delle parate
let arcadeFont


function preload(){
    bgimg = loadImage('./img/sfondo.png')
    pallaImg = loadImage('./img/palla.png')
    guantoImg = loadImage('./img/guanto.png')
    goalImg = loadImage('./img/goal.png')
    parateImg = loadImage('./img/parate.png')
    arcadeFont = loadFont('./font/PressStart2P-Regular.ttf')
}

function setup(){
    createCanvas(Ximg, Yimg)
    frameRate(24)

    palla = new Palla(pallaImg, xPalla, yPalla)
    guanto = new Guanto(guantoImg, xGuanto, yGuanto)
    
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
    
    loadHandTrackingModel()
    
    tempoInizioTiro = millis() // <-- inizializza timer
}

async function loadHandTrackingModel() {
    try {
        model = await handpose.load();
        modelLoaded = true;
        console.log('Hand Tracking Model Loaded');
        predictHand();
    } catch (error) {
        console.error('Errore caricamento modello:', error);
    }
}

async function predictHand() {
    if (!modelLoaded || !model) return;
    
    try {
        predictions = await model.estimateHands(video.elt);
        
        if (predictions.length > 0) {
            handDetected = true;
            
            let palmBase = predictions[0].landmarks[0];
            
            handX = map(palmBase[0], 0, 640, Ximg, 0);
            handY = map(palmBase[1], 0, 480, 0, Yimg);
            
            guanto.x = handX - 50;
            guanto.y = handY - 50;
            
            guanto.x = constrain(guanto.x, 0, Ximg - 100);
            guanto.y = constrain(guanto.y, 0, Yimg - 100);
        } else {
            handDetected = false;
        }
    } catch (error) {
        console.error('Errore predizione:', error);
    }
    
    setTimeout(function() { predictHand(); }, 50);
}

function draw(){
    if (stato === "gioco") {
        background(bgimg)

        image(guanto.imgShow, guanto.x, guanto.y)
        image(palla.imgShow, palla.x, palla.y, palla.size, palla.size)
        image(parateImg, 390, 460)

        moveBall()
        prospettivaPalla()
        checkInPorta()
        checkParata()
        
        if (!modelLoaded) {
            textFont('sans-serif')
            fill(255, 165, 0);
            noStroke();
            ellipse(30, 30, 20, 20);
            fill(255);
            textSize(16);
            text("Caricamento modello...", 210, 35);
        }
        else if (handDetected) {
            textFont('sans-serif')
            fill(0, 255, 0);
            noStroke();
            ellipse(30, 30, 20, 20);
            fill(255);
            textSize(16);
            text("Mano rilevata", 150, 35);
        } else {
            textFont('sans-serif')
            fill(255, 0, 0);
            noStroke();
            ellipse(30, 30, 20, 20);
            fill(255);
            textSize(16);
            text("Nessuna mano", 160, 35);
        }
        
        textFont(arcadeFont);
        textSize(70);
        fill(255, 170, 0);
        textAlign(RIGHT);
        text(counterParate, 1030, 680);

    } else if (stato === "goal") {
        background(bgimg)
        image(goalImg, 430, 120)

        timerGoal++

        if (timerGoal > durataGoal) {
            resetPalla()
            stato = "gioco"
        }
    }
}

function moveBall(){
    palla.x += palla.vx 
    palla.y += palla.vy
}

function prospettivaPalla(){
    let t = map(palla.y, palla.startY, 0, 0, 1)
    t = constrain(t, 0, 1)
    palla.size = lerp(palla.maxSize, palla.minSize, t)
}

function checkInPorta(){
    if(palla.x >= 1300 || palla.x <= 160 || palla.y <= 120){
        stato = "goal"
        timerGoal = 0
        counterParate = 0
    }
}

function collisioneDelCerchio(cx, cy, r, rx, ry, rw, rh) {
    let closestX = constrain(cx, rx, rx + rw)
    let closestY = constrain(cy, ry, ry + rh)

    let dx = cx - closestX
    let dy = cy - closestY

    return (dx * dx + dy * dy) < (r * r)
}

// MODIFICATA: parata possibile solo dopo 5 secondi
function checkParata(){

    //Blocca la parata prima dei 5 secondi
    if (millis() - tempoInizioTiro < 2000) return;

    let guantoHit = {
        x: guanto.x + 20,
        y: guanto.y + 20,
        w: 60,
        h: 60
    }

    let ballCX = palla.x + palla.size / 2
    let ballCY = palla.y + palla.size / 2
    let ballR  = palla.size / 2

    if (collisioneDelCerchio(ballCX, ballCY, ballR, guantoHit.x, guantoHit.y, guantoHit.w, guantoHit.h)) {
        resetPalla()
        counterParate++
        console.log("PARATA Totale: " + counterParate)
    }
}

function resetPalla() {
    palla.x = xPalla
    palla.y = yPalla

    palla.vx = random(-4, 4)
    palla.vy = random(-6, -3)

    palla.size = palla.maxSize
    palla.startY = palla.y
    
    tempoInizioTiro = millis() // <-- reset timer tiro
}

function mouseMoved() {
    if (!handDetected && modelLoaded) {
        guanto.x = mouseX - 50;
        guanto.y = mouseY - 50;
        guanto.x = constrain(guanto.x, 0, Ximg - 100);
        guanto.y = constrain(guanto.y, 0, Yimg - 100);
    }
}
