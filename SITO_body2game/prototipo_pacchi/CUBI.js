let personaggio;
let cubi = [];         
let colori;            
let immagini = {};      
let pilaCont = 0;       
let coloreOra;          // colore del pacco da raccogliere in questo momento
let ultimoColoCam = 0;  // time dell'ultimo cambio colore
let colorInterval = 7000; // ogni quanto ms cambia il colore richiesto

let gameOver = false;  
let win = false;        

let pila;              

let blu, rosso, verde, giallo;

let babboDx, babboSx;

let sfondo; 
let imgVinto, imgPerso;

let pauseImg;

let arcadeFont; // font pixel

// --- Modelli ML5 per il tracking ---
let bodyPose;   // rileva la posa del corpo
let handPose;   // rileva la posizione delle mani
let poses = []; // risultati del body tracking
let hands = []; // risultati dell'hand tracking
let connections; // connessioni dello scheletro
let video;       // stream della webcam 

let schema = 1; // 1 = in gioco - 0 = in pausa

// --- Opzioni per il modello handPose ---
let options = {
  maxHands: 2,          // rileva fino a 2 mani
  flipped: false,       // immagine non specchiata
  runtime: "mediapipe", // usa il runtime MediaPipe
  modelType: "full"     // modello completo (più preciso)
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

    suonoPacco = loadSound('./suoni/prendi_pacco.mp3'); 
    vittoria = loadSound('./suoni/vittoria.mp3');      
    perso = loadSound('./suoni/perso.mp3');             
    
    // Inizializza i modelli di machine learning
    bodyPose = ml5.bodyPose();
    handPose = ml5.handPose(options, modelReady); // modelReady chiamato quando il modello è pronto
}

// Chiamata quando il modello handPose ha finito di caricarsi
function modelReady() {
  console.log("Hand Pose Model Loaded!");
}

function setup(){
    createCanvas(windowWidth-21, windowHeight-21); 
    frameRate(60); // 60 fps per animazione fluida

    // Crea la webcam (usata per il tracking, non mostrata all'utente)
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide(); // nasconde l'elemento video dalla pagina
    
    // Avvia il rilevamento continuo di corpo e mani sul video
    bodyPose.detectStart(video, gotPoses);
    handPose.detectStart(video, gotHands);
    
    // Recupera le connessioni dello scheletro per disegnarlo (se necessario)
    connections = bodyPose.getSkeleton();

    // Crea il personaggio 
    personaggio = new Player();

    colori = ["blu", "rosso", "verde", "giallo"];
    coloreOra = random(colori); // sceglie un colore di partenza casuale

    pila = width - 100;

    // Genera 7 cubi cadenti all'inizio del gioco
    for(let k = 0; k < 7; k++){
        cubi.push(new Cubo());
    }
}

function draw(){
    image(sfondo, 0, 0, width, height); 

    disegnaSchermoColore();

    if (!gameOver && !win) {

        // Aggiorna il gioco solo se non siamo in pausa
        if (schema === 1) {
            cambiaColoreTempo(); // controlla se è ora di cambiare colore
            personaggio.move(); // aggiorna la posizione del personaggio
        }

        // Disegna il personaggio 
        personaggio.show();

        // Ciclo su tutti i cubi cadenti
        for (let cubo of cubi){

            // Gestisce solo i cubi non ancora raccolti
            if(!cubo.taken){

                if (schema == 1) { // gioco

                    cubo.scendi(); // sposta il cubo verso il basso

                    // Se il cubo esce dal fondo, lo reimposta in cima
                    if(cubo.y > height){ 
                        cubo.reset();
                    }

                    // Controlla la collisione tra personaggio e cubo
                    if(collide(personaggio, cubo)){

                        if(cubo.nome == coloreOra){
                            // Pacco del colore giusto: lo posiziona nella pila
                            cubo.taken = true;  // segna il cubo come raccolto
                            cubo.speed = 0;     // ferma la caduta

                            suonoPacco.play(); // riproduce suono raccolta

                            // Posiziona il cubo nella pila in basso a destra
                            cubo.x = pila;
                            cubo.y = height - cubo.size * (pilaCont + 1);
                            pilaCont++; // incrementa il contatore della pila

                            // Controlla se si sono raccolti pacchi per vincere
                            if(pilaCont >= 5){
                                win = true;
                                vittoria.play();
                                setTimeout(() => vittoria.stop(), 3000); // ferma il suono dopo 3s
                            }

                        } else {
                            gameOver = true;
                            perso.play();
                            setTimeout(() => perso.stop(), 6000); // ferma il suono dopo 6s
                        }
                    }
                }
            }

            // Disegna il cubo
            cubo.show();
        }

    } else {
        // Partita terminata
        schermataFinale();
    }

    // Overlay pausa
    if (schema == 0) {
        fill(0, 150); // rettangolo nero semi-trasparente
        rect(0, 0, width, height);

        let imgSize = 400;

        imageMode(CENTER);
        image(pauseImg, width / 2, height / 2, imgSize, imgSize); // icona centrata
        imageMode(CORNER); // ripristina imageMode di default
    }
}

// Controlla se è trascorso abbastanza tempo per cambiare il colore richiesto
function cambiaColoreTempo() {
    let tempoPassato = millis() - ultimoColoCam; // ms dall'ultimo cambio

    if (tempoPassato > colorInterval) {
        coloreOra = random(colori);     // sceglie un nuovo colore casuale
        ultimoColoCam = millis();       // aggiorna il timestamp
    }
}

function disegnaSchermoColore() {
    textAlign(CENTER, CENTER);
    textSize(100);
    textFont(arcadeFont);
    noStroke();

    let scritta = "";       // nome colore 
    let col = color(255);   // colore testo 

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
    text(scritta, width / 2, height * 0.1); // posizionato al 10% dell'altezza
}

function schermataFinale(){
    if(win){
        image(imgVinto, 0, 0, width, height);  
    } else {
        image(imgPerso, 0, 0, width, height);  
    }
}

// Controlla la collisione AABB tra personaggio e cubo
// Usa una hitbox ridotta sul personaggio per maggiore precisione visiva
function collide(a, b){
    // Hitbox orizzontale: solo il 30% centrale del personaggio
    let playerLeft = a.x + a.size * 0.35;
    let playerRight = a.x + a.size * 0.65;

    // Hitbox verticale: esclude testa e piedi (15% e 85%)
    let playerTop = a.y + a.size * 0.15;
    let playerBottom = a.y + a.size * 0.85;

    // Controlla sovrapposizione sui due assi (AABB standard)
    return (
        playerLeft < b.x + b.size &&
        playerRight > b.x &&
        playerTop < b.y + b.size &&
        playerBottom > b.y
    );
}

// Callback chiamata da ML5 ogni volta che vengono rilevate nuove pose
function gotPoses(results) {
  poses = results; // aggiorna l'array globale delle pose
}

// Callback chiamata da ML5 ogni volta che vengono rilevate nuove mani
function gotHands(results) {
  hands = results; // aggiorna l'array globale delle mani
}

function keyPressed() {
  // ESC attiva/disattiva la pausa (solo se la partita è in corso)
  if (keyCode == ESCAPE && !gameOver && !win) {

    if (schema == 1) {
      schema = 0; // mette in pausa
    } else {
      schema = 1; // riprende il gioco
    }

  }
}