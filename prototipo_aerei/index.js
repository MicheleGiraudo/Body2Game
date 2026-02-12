//AEREO
let aereo
let aereo_x = 100
let aereo_y = 230 

//OSTACOLI
const obstacles = []
let rocket
let spawnRate = 120

//IMMAGINI
let img_aereo
let img_rocket
let bimg_cielo


function preload() {
    img_aereo = loadImage('./img/aereo_utente.png')
    img_rocket = loadImage('./img/rocket.png')
    bimg_cielo = loadImage('./img/cielo.png')
}

function setup() {
    createCanvas(1515, 777)
    aereo = new Aereo(img_aereo, aereo_x, aereo_y)
    rocket = new Rocket(img_rocket)
    obstacles.push(rocket)
    frameRate(50)
}

function draw() {
    background(bimg_cielo)
    image(aereo.imgShow, aereo.x, aereo.y)
    image(rocket.imgShow, rocket.x, rocket.y)

    // spawn razzi ogni tot frame
    if (frameCount % spawnRate === 0) {
        obstacles.push(new Rocket(img_rocket));
    }
    // Aggiorna e disegna ostacoli
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].move();
        obstacles[i].show();

        // Rimuovi se fuori schermo
        if (obstacles[i].offscreen()) {
        obstacles.splice(i, 1);
        }
    }
}