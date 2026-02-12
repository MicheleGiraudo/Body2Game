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

function preload(){
    blu = loadImage("regalo_blu.png");
    rosso = loadImage("regalo_rosso.png");
    verde = loadImage("regalo_verde.png");
    giallo = loadImage("regalo_giallo.png");
}

function setup(){
    createCanvas(windowWidth-21, windowHeight-21); 
    frameRate(60);

    personaggio = new Player();

    // Colori per il colore "attuale" dello schermo
    colori = ["blu", "rosso", "verde", "giallo"]; // ora è stringa

    coloreOra = random(colori);
    pila = width - 50;

    for(let k = 0; k < 10; k++){
        cubi.push(new Cubo());
    }
}

function draw(){
    background(220);

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

                    if(pilaCont >= 10){
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
        coloreOra = random(colori);   // nuovo colore (stringa)
        ultimoColoCam = millis();
    }
}

function disegnaSchermoColore() {
    switch(coloreOra){ // mostra lo sfondo con lo stesso colore RGB della stringa
        case "blu":
            fill(0, 0, 255);
            break;
        case "rosso":
            fill(255, 0, 0);
            break;
        case "verde":
            fill(0, 255, 0);
            break;
        case "giallo":
            fill(255, 255, 0);
            break;
    }
    rect(0, 0, width, height); 
}

function schermataFinale(){
    textSize(40);
    textAlign(CENTER, CENTER);
    fill(0);

    if(win){
        text("HAI VINTO", width/2, height/2);
    } else {
        text("GAME OVER", width/2, height/2);
    }
}

function collide(a, b){
    return (
        a.x < b.x + b.size &&
        a.x + a.size > b.x &&
        a.y < b.y + b.size &&
        a.y + a.size > b.y
    );
}

