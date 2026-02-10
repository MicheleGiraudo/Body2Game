//IMMAGE                
let bgimg //immagine di sfondo
let pallaImg
let guantoImg

//POSITION
let xPalla = 730
let yPalla = 480
let xGuanto = 600
let yGuanto = 400

//BACKGROUND
let Ximg = 1520 
let Yimg = 705

//per la funzione dist
let d 

// velocita dei personaggi
let vPalla = 50
let vGuanto = 20

let t = 1

function preload(){ //precarica tutte le immagini del gioco
    bgimg = loadImage('./img/sfondo.png')

    pallaImg = loadImage('./img/palla.png')

    guantoImg = loadImage('./img/guanto.png')
}

function setup(){
    createCanvas(Ximg, Yimg) // sfondo
    frameRate(24) //fps

    palla = new Palla(pallaImg, xPalla, yPalla)
    guanto = new Guanto(guantoImg, xGuanto, yGuanto)
}

function draw(){
  background(bgimg)
  image(palla.imgShow, palla.x, palla.y, palla.size, palla.size)
  image(guanto.imgShow, guanto.x, guanto.y)
  moveBall()

  prospettivaPalla()

  checkInPorta()

  //muovi guanto
  
  
}


function moveBall(){
  palla.x += palla.vx 
  palla.y += palla.vy
  palla.z -= palla.zSpeed;
  palla.z = max(palla.z, 0.3);
}


function prospettivaPalla(){
  // calcolo prospettiva
  let t = map(palla.y, palla.startY, 0, 0, 1)

  t = constrain(t, 0, 1)

  palla.size = lerp(palla.maxSize, palla.minSize, t) // rimpicciolisce l'immagine da la dimensione iniziale(primo parametro) alla dimensione finale(secondo parametro) nel tempo passato(terzo parametro)
}

function checkInPorta(){
  if(palla.x >= 1300 || palla.x <= 160 || palla.y <= 120){
    palla.x = x
    palla.y = y
  }
}




