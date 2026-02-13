//AEREO
let plane
let plane_x = 100
let plane_y = 230 

//RAZZI
const obstacles = []
let rocket
let rocket_spawnRate = 50

//ESPLOSIONI
let explosions = []

//PROIETTILI
let bullet
const shots = []
let bullet_spawnRate = 3
let shooting = false

//IMMAGINI
let bimg_sky
let img_plane
let img_rocket
let img_explosions = []
let img_bullet

//SCHEMI E ALTRO
let gameOver = false

function preload() {
    bimg_sky = loadImage('./img/cielo.png')
    img_plane = loadImage('./img/aereo_utente.png')
    img_rocket = loadImage('./img/rocket.png')
    img_bullet = loadImage('./img/proiettile.png')
    // array parte da 0 invece che da 1
    for (let i = 0; i < 6; i++) {
        img_explosions[i] = loadImage("./img/esplosione" + (i + 1) + ".png");
    }
}

function setup() {
    createCanvas(1515, 777)
    plane = new Plane(img_plane, plane_x, plane_y)
    frameRate(50)
}

function draw() {
    background(bimg_sky)
    
    // Disegna aereo se esiste
    if (plane) {
        image(plane.imgShow, plane.x, plane.y)
        if(keyIsDown(87)) { 
            plane.moveUp()
        }
        if(keyIsDown(83)) { 
            plane.moveDown()
        }
    }
    
    // spawn razzi ogni tot frame
    if (frameCount % rocket_spawnRate === 0 && !gameOver) {
        obstacles.push(new Rocket(img_rocket))
    }

    // spawn proiettili ogni tot frame se barra spaziatrice premuta
    if(frameCount % bullet_spawnRate === 0 && shooting && !gameOver && plane) {
        shots.push(new Bullet(img_bullet, plane.x + plane.width, plane.y + plane.height/2))
    }
    
    // Aggiorna e disegna proiettili
    for (let i = shots.length - 1; i >= 0; i--) {
        shots[i].move()
        shots[i].show()

        // Rimuovi se fuori schermo
        if (shots[i].offscreen()) {
            shots.splice(i, 1)
            continue
        }

        // Controlla collisione proiettile-razzo
        for (let j = obstacles.length - 1; j >= 0; j--) {
            let distance = dist(
                shots[i].x + shots[i].imgShow.width / 2,
                shots[i].y + shots[i].imgShow.height / 2,
                obstacles[j].x + obstacles[j].imgShow.width / 2,
                obstacles[j].y + obstacles[j].imgShow.height / 2
            )
            
            // Collisione proiettile-razzo
            let collision_distance = (shots[i].imgShow.width + obstacles[j].imgShow.width) / 2
            if(distance < collision_distance) {
                // Crea esplosione nel punto di impatto
                explosions.push(new Explosion(
                    obstacles[j].x, 
                    obstacles[j].y, 
                    obstacles[j].imgShow.width, 
                    obstacles[j].imgShow.height
                ))
                
                // Rimuovi razzo e proiettile
                obstacles.splice(j, 1)
                shots.splice(i, 1)
                break // Esci dal loop dei razzi dopo la collisione
            }
        }
    }

    // Aggiorna e disegna razzi
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].move()
        obstacles[i].show()

        // Rimuovi se fuori schermo
        if (obstacles[i].offscreen()) {
            obstacles.splice(i, 1)
            continue
        }

        // distanza tra aereo e razzo
        if (plane) {
            let distance = dist(
                plane.x + plane.width / 2,
                plane.y + plane.height / 2,
                obstacles[i].x + obstacles[i].imgShow.width / 2,
                obstacles[i].y + obstacles[i].imgShow.height / 2
            )
            // collisione aereo - razzo
            if(plane.collision(distance, obstacles[i])) {
                // Crea esplosione per l'aereo
                explosions.push(new Explosion(plane.x, plane.y, plane.width, plane.height))
                
                obstacles.splice(i, 1) // rimuovi razzo
                plane = null           // rimuovi aereo
                gameOver = true
            }
        }
    }
    
    //Aggiorna e disegna esplosioni
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update()
        explosions[i].show()
        
        // Rimuovi esplosioni finite
        if (explosions[i].finished()) {
            explosions.splice(i, 1)
        }
    }

}

function keyPressed(){
    if(keyCode === 32) { // Barra spaziatrice
        shooting = true
    }
}

function keyReleased(){
    if(keyCode === 32) { // Barra spaziatrice rilasciata
        shooting = false
    }
}