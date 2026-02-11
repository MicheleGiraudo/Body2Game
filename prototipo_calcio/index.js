//IMMAGE                
let bgimg //immagine di sfondo
let pallaImg
let guantoImg
let gameOver

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

//PER DIST
let d 

//V OGGETTI
let vPalla = 40
let vGuanto = 20

let t = 1

//tempo
let secondi = 0

let stato = "gioco" // "gioco" | "goal"
let timerGoal = 0
let durataGoal = 70 // frame (120 = 5 secondi a 24 fps)

let counterGoal = 0 //counter dei gol


function preload(){ //precarica tutte le immagini del gioco
    bgimg = loadImage('./img/sfondo.png')

    pallaImg = loadImage('./img/palla.png')

    guantoImg = loadImage('./img/guanto.png')
    
    goalImg = loadImage('./img/goal.png')
}


function setup(){
    createCanvas(Ximg, Yimg) // sfondo
    frameRate(24) //fps

    palla = new Palla(pallaImg, xPalla, yPalla)
    guanto = new Guanto(guantoImg, xGuanto, yGuanto)
}


function draw(){
  if (stato === "gioco") {
    background(bgimg)

    image(guanto.imgShow, guanto.x, guanto.y)
    image(palla.imgShow, palla.x, palla.y, palla.size, palla.size)

    moveBall()
    prospettivaPalla()
    checkInPorta()
    checkParata()

  } else if (stato === "goal") {
    background(bgimg)

    // scritta GOAL triste
    image(goalImg, 420, 120)

    timerGoal++

    if (timerGoal > durataGoal) {
      resetPalla()
      stato = "gioco"
    }
  }

  console.log(counterGoal)
}


function moveBall(){
  palla.x += palla.vx 
  palla.y += palla.vy
}


function prospettivaPalla(){
  //calcolo prospettiva
  let t = map(palla.y, palla.startY, 0, 0, 1) //rimpicciolimento del tiro

  t = constrain(t, 0, 1)

  palla.size = lerp(palla.maxSize, palla.minSize, t) //rimpicciolisce l'immagine da la dimensione iniziale(primo parametro) alla dimensione finale(secondo parametro) nel tempo passato(terzo parametro)
}


function checkInPorta(){
  if(palla.x >= 1300 || palla.x <= 160 || palla.y <= 120){
    stato = "goal";
    timerGoal = 0;
  }else{
    counterGoal++
  }
}


function collisioneDelCerchio(cx, cy, r, rx, ry, rw, rh) {
  let closestX = constrain(cx, rx, rx + rw) //punto x del guanto più vicino alla palla
  let closestY = constrain(cy, ry, ry + rh) //punto y del guanto più vicino alla palla

  let dx = cx - closestX //distanza x dal centro della palla e guanto
  let dy = cy - closestY ////distanza y dal centro della palla e guanto

  return (dx * dx + dy * dy) < (r * r) //booleana
}


function checkParata(){
  //hitbox palmo guanto
  let guantoHit = {
    x: guanto.x + 20,
    y: guanto.y + 20,
    w: 60,
    h: 60
  }

  //controlli palla
  let ballCX = palla.x + palla.size / 2
  let ballCY = palla.y + palla.size / 2
  let ballR  = palla.size / 2

  if (collisioneDelCerchio(ballCX, ballCY, ballR, guantoHit.x, guantoHit.y, guantoHit.w, guantoHit.h)) {
    //parata
    resetPalla()
    counterGoal = 0
    console.log("parata")
  }
}


function resetPalla() {
  palla.x = xPalla
  palla.y = yPalla

  palla.vx = random(-4, 4)
  palla.vy = random(-6, -3)

  palla.size = palla.maxSize
  palla.startY = palla.y
}






