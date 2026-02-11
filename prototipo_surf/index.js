let bgimg
let surfistadx
let surfistasx
let protagonista
let oggetti = []
let scoglio
let boaG
let boaP
let alga
let bgY1 = 0
let bgY2
let bgVel = 5


function preload(){
    bgimg = loadImage('./img/sfondo.png')
    surfistadx = loadImage('./img/surfdx.png')
    surfistasx = loadImage('./img/surfsx.png')
    
    scoglio = loadImage('./img/scogli.png')
    boaG = loadImage('./img/boa.png')
    boaP = loadImage('./img/boaPiccola.png')
    alga = loadImage('./img/alghe.png')
}

function setup(){
    createCanvas(1500, 710)
    protagonista = new Player(surfistadx, 750, 570)
    bgY2 = -height  // imposto il secondo sfondo subito dopo il primo

    frameRate(30)
}

function draw(){
    // sfondo che si muove
    image(bgimg, 0, bgY1, width, height)
    image(bgimg, 0, bgY2, width, height)

    // aggiorna la posizione dello sfondo
    bgY1 += bgVel
    bgY2 += bgVel

    // reset quando lo sfondo esce dal canvas
    if(bgY1 >= height) bgY1 = bgY2 - height
    if(bgY2 >= height) bgY2 = bgY1 - height

    
    protagonista.show()

    // genera oggetti casuali
    if(random(1) < 0.05){
        let imgs = [scoglio, boaG, boaP, alga]
        oggetti.push(new Oggetto(random(imgs)))
    }

    // muove e disegna gli oggetti
    for(let i = oggetti.length-1; i>=0; i--){
        oggetti[i].move()
        oggetti[i].show()
        if(oggetti[i].fuoriSchermo()){
            oggetti.splice(i,1)
        }
    }
}


function keyPressed(){
    if((key == "d") || (keyCode === RIGHT_ARROW)){
        protagonista.imgShow = surfistadx
        protagonista.moveDx()
    }
    if((key == "a") || (keyCode === LEFT_ARROW)){
        protagonista.imgShow = surfistasx
        protagonista.moveSx()
    }
}

