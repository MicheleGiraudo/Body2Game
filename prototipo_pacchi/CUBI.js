let personaggio;
let cubi = [];
let colori; // rimane per determinare colore attuale
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
}

function setup(){
    createCanvas(windowWidth-21, windowHeight-21); 
    frameRate(60);

    personaggio = new Player();

    // Colori per il colore "attuale" dello schermo
    colori = ["blu", "rosso", "verde", "giallo"]; // ora è stringa

    coloreOra = random(colori);
    pila = width - 100;

    for(let k = 0; k < 10; k++){
        cubi.push(new Cubo());
    }
}

function draw(){
    image(sfondo, 0, 0, width, height); 

    disegnaSchermoColore();

    if(gameOver || win){
        schermataFinale();
        return;
    }

    cambiaColoreTempo();
    personaggio.move();
    personaggio.show();

    for(let cubo of cubi){

        if(!cubo.taken){ // cubo non preso
            cubo.scendi();

            if(cubo.y > height){ 
                cubo.reset(); // continua a farli scendere
            }

            if(collide(personaggio, cubo)){

                if(cubo.nome === coloreOra){ // confronto corretto con stringhe
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
        cubo.show();
    }
}

function cambiaColoreTempo() {
    let tempoPassato = millis() - ultimoColoCam;

    if (tempoPassato > colorInterval) {
        coloreOra = random(colori); // nuovo colore (stringa)
        ultimoColoCam = millis();
    }
}

function disegnaSchermoColore() {
    textAlign(CENTER, CENTER);
    textSize(100);           // dimensione più grande per il centro dello schermo
    textFont('serif');  // effetto pixel/arcade
    noStroke();

    let scritta = "";
    let col = color(255);

    switch(coloreOra) {
        case "verde": 
            scritta = "GREEN"; 
            col = color(255, 0, 0); // rosso
            break;
        case "blu": 
            scritta = "BLU"; 
            col = color(255, 255, 0); // giallo
            break;
        case "giallo": 
            scritta = "YELLOW"; 
            col = color(0, 0, 255); // blu
            break;
        case "rosso": 
            scritta = "RED"; 
            col = color(0, 255, 0); // verde
            break;
    }

    fill(col);
    text(scritta, width / 2, height * 0.1); // centrato orizzontalmente, in alto
}


function schermataFinale(){
    // Mostra immagine finale alla stessa dimensione dello sfondo
    if(win){
        image(imgVinto, 0, 0, width, height);
    } else {
        image(imgPerso, 0, 0, width, height);
    }
}

function collide(a, b){
    // hitbox più precisa del player (zona pancia/mani)
    let playerLeft = a.x + a.size * 0.35;
    let playerRight = a.x + a.size * 0.65;

    // parte alta precisa (zona testa reale)
    let playerTop = a.y + a.size * 0.15;
    let playerBottom = a.y + a.size * 0.85;

    return (
        playerLeft < b.x + b.size &&
        playerRight > b.x &&
        playerTop < b.y + b.size &&
        playerBottom > b.y
    );
}