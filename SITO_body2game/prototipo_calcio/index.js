// HAND TRACKING
let model
let video

//IMMAGINI                
let bgimg //immagine di sfondo
let pallaImg
let guantoImg
let goalImg
let parateImg
let pausaImg

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
let tempoInizioParata = 0 //per il timer prima che possa parare
let tempoInizioAttesa = 0 //per il timer prima avvenga il tiro
let tempoAttesaTiro = 800

//impostazioni del gioco
let stato = "gioco" // "gioco" | "goal" | "attesa"
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

//pausa
let schema = 1

//SUONI
let suonoParata
let suonoGoal
let suonoCalcio
let audioPronto = false

function preload(){
    //carica foto 
    bgimg = loadImage('./img/sfondo.png')
    pallaImg = loadImage('./img/palla.png')
    guantoImg = loadImage('./img/guanto.png')
    goalImg = loadImage('./img/goal.png')
    parateImg = loadImage('./img/parate.png')
    pausaImg = loadImage('./img/pausa.png')

    //carica font per counter
    arcadeFont = loadFont('./font/PressStart2P-Regular.ttf')

    //carica suoni
    suonoParata = loadSound('./suoni/parata.mp3')
    suonoGoal = loadSound('./suoni/goal.mp3')
    suonoCalcio = loadSound('./suoni/calcio.mp3')
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
    
    stato = "attesa"
    tempoInizioAttesa = millis()
}

// Abilita audio al primo click
function mousePressed() {
    userStartAudio()
    audioPronto = true
    console.log('Audio attivato!')
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
        const hands = await model.estimateHands(video.elt);
        
        if (hands.length > 0) {
            handDetected = true;
            
            let palmBase = hands[0].landmarks[0];
            
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
    
    //loop ricorsivo, ogni 30ms richiama la funzione predictHand
    setTimeout(function() { predictHand(); }, 30);
}

function draw(){
    if (schema === 1){
        if (stato === "gioco") {
            background(bgimg)

            image(guanto.imgShow, guanto.x, guanto.y)
            image(palla.imgShow, palla.x, palla.y, palla.size, palla.size)
            image(parateImg, 390, 460)

            moveBall()
            prospettivaPalla()
            checkInPorta()
            checkParata()
            
            checkMano()
                    
            textFont(arcadeFont)
            textSize(70)
            stroke(0)
            strokeWeight(4) // per il bordo
            fill(255, 170, 0)
            textAlign(RIGHT)
            text(counterParate, 1030, 680)

        } else if (stato === "goal") {
            background(bgimg)
            image(goalImg, 430, 120)

            timerGoal++

            if (timerGoal > durataGoal) {
                resetPalla()
                stato = "attesa"
                tempoInizioAttesa = millis()
            }
            
        } else if(stato === "attesa"){
            // Disegna tutto ma con palla ferma
            background(bgimg)
            image(guanto.imgShow, guanto.x, guanto.y)
            image(palla.imgShow, palla.x, palla.y, palla.size, palla.size)
            image(parateImg, 390, 460)
            
            checkMano()
            
            textFont(arcadeFont);
            textSize(70);
            fill(255, 170, 0);
            textAlign(RIGHT);
            text(counterParate, 1030, 680);

            // Controlla se è passato il tempo
            if(millis() - tempoInizioAttesa > tempoAttesaTiro){
                stato = "gioco"
                pallaTirata = false // reset per nuovo tiro
                tempoInizioParata = millis() //avvio del tempo prima che possa parare
            }
        }
    } else if (schema === 0) {
        // ridisegna il frame del gioco (fermo), se no diventerebbe nero
        background(bgimg)
        image(guanto.imgShow, guanto.x, guanto.y)
        image(palla.imgShow, palla.x, palla.y, palla.size, palla.size)
        image(parateImg, 390, 460)

        // overlay scuro (NON accumula)
        noStroke()
        fill(0, 150)   // qui regoli quanto scuro
        rect(0, 0, width, height)

        image(pausaImg, 430, -40)
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

//parata 
function collisioneDelCerchio(cx, cy, r, rx, ry, rw, rh) {
    let closestX = constrain(cx, rx, rx + rw)
    let closestY = constrain(cy, ry, ry + rh)

    let dx = cx - closestX
    let dy = cy - closestY

    return (dx * dx + dy * dy) < (r * r)
}

//parata possibile solo dopo 800 millisecondi
function checkParata(){
    //Blocca la parata prima del tempoAttesoTiro
    if (millis() - tempoInizioParata < tempoAttesaTiro){
        return;
    }

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
        stato = "attesa"
        tempoInizioAttesa = millis()
        tempoInizioParata = millis() 
        console.log("PARATA Totale: " + counterParate)
    }
}

// dopo ogni gol si posiziona nella posizione iniziale
function resetPalla() {
    palla.x = xPalla
    palla.y = yPalla

    palla.vx = random(-19, 19) //angolazione
    palla.vy = random(-15, -9) //velocita

    palla.size = palla.maxSize
    palla.startY = palla.y
    
    pallaTirata = false // reset per il prossimo tiro
}

// se non trova la mano si attiva il cursore
function mouseMoved() {
    if (!handDetected && modelLoaded) {
        guanto.x = mouseX - 50;
        guanto.y = mouseY - 50;
        guanto.x = constrain(guanto.x, 0, Ximg - 100);
        guanto.y = constrain(guanto.y, 0, Yimg - 100);
    }
}

//controllo della mano
function checkMano(){
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
}

// gestione tasto ESC
function keyPressed() {
  if (keyCode === ESCAPE) {
    if (schema === 1) {
      schema = 0; // pausa
    } else if (schema === 0) {
      schema = 1; // torna al gioco
    }
  }
}