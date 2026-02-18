//BACKGROUND
let bg_x1 = 0
let bg_x2 = 1515
let bg_speed = 2

//AEREO
let plane
let plane_x = 100
let plane_y = 280 

//AEREI NEMICI
const obstacles = []
let plane_enemy
let plane_enemy_spawnRate = 50

//ESPLOSIONI
let explosions = []

//PROIETTILI
let bullet
const shots = []
let bullet_spawnRate = 15
let shooting = false

//MUNIZIONI
let ammo = 30
const MAX_AMMO = 30
let isReloading = false
let reloadStartTime = 0
const RELOAD_TIME = 10000 // 3 secondi di ricarica in millisecondi

//INGRANAGGI
let gear
const gears = []
let gear_spawnRate = 400

//CUORI - VITE
let lives = 3
const MAX_LIVES = 3

//IMMAGINI
let bimg_sky1
let bimg_sky2
let img_plane
let img_plane_enemy
let img_explosions = []
let img_bullet
let img_gear
let img_heartFull
let img_heartEmpty
let img_pause

//SCHEMI E ALTRO
let gameOver = false
let gameStartTime = 0
let gameCanStart = false
const DELAY_BEFORE_ENEMIES = 10000 // 10 secondi in millisecondi
let isPaused = false
let enemiesDestroyed = 0

//HAND TRACKING
let model, video, predictions = []
let handY = null
let isHandClosed = false
let previousHandClosed = false

//FONT PER LE SCRITTE
let arcadeFont

//INVINCIBILITÀ
let isInvincible = false
let invincibleStartTime = 0
const INVINCIBLE_TIME = 2000 // 2 secondi

function preload() {
    bimg_sky1 = loadImage('./img/cielo.png')
    bimg_sky2 = loadImage('./img/cielo1.png')
    img_plane = loadImage('./img/aereo_utente.png')
    img_plane_enemy = loadImage('./img/aereo_nemico.png')
    img_bullet = loadImage('./img/proiettile.png')
    img_gear = loadImage('./img/ingranaggio.png')
    img_heartFull = loadImage('./img/cuorePieno.png')
    img_heartEmpty = loadImage('./img/cuoreVuoto.png')
    img_pause = loadImage('./img/pause.png')
    arcadeFont = loadFont('./font/PressStart2P-Regular.ttf')

    // array parte da 0 invece che da 1
    for (let i = 0; i < 6; i++) {
        img_explosions[i] = loadImage("./img/esplosione" + (i + 1) + ".png");
    }
}

function setup() {
    const canvas = createCanvas(1515, 777)
    canvas.parent('canvasContainer')
    
    plane = new Plane(img_plane, plane_x, plane_y)
    frameRate(50)
    
    // Inizializza video capture per hand tracking
    video = createCapture(VIDEO, () => {
        loadHandTrackingModel()
    })
    video.size(320, 240)
    video.hide()
    
    // Imposta il tempo di inizio del gioco
    gameStartTime = millis()
}

async function loadHandTrackingModel() {
    // Carica il modello MediaPipe handpose
    model = await handpose.load()
    predictHand()
}

async function predictHand() {
    if (video && video.elt) {
        // Ottieni predizioni della mano
        predictions = await model.estimateHands(video.elt)
        
        if (predictions.length > 0) {
            // Calcola posizione Y media della mano (basata sul palmo)
            let prediction = predictions[0]
            let palmY = prediction.landmarks[0][1] // Punto base del palmo
            
            // Mappa la posizione Y dalla webcam al canvas del gioco
            // Video: 0-240, Game: 30-(777-30)
            handY = map(palmY, 0, 240, 30, 747)
            
            // Determina se la mano è chiusa (pugno)
            isHandClosed = detectHandClosed(prediction)
        } else {
            handY = null
            isHandClosed = false
        }
    }
    
    setTimeout(() => predictHand(), 50)
}

function detectHandClosed(prediction) {
    // Rileva se la mano è chiusa calcolando le distanze tra punta e base delle dita
    let annotations = prediction.annotations
    
    // Punti di riferimento: base delle dita e polso
    let wrist = prediction.landmarks[0]
    
    // Calcola distanze tra punta delle dita e polso
    let thumbTip = annotations.thumb[3]
    let indexTip = annotations.indexFinger[3]
    let middleTip = annotations.middleFinger[3]
    let ringTip = annotations.ringFinger[3]
    let pinkyTip = annotations.pinky[3]
    
    // Calcola distanze
    let thumbDist = dist(thumbTip[0], thumbTip[1], wrist[0], wrist[1])
    let indexDist = dist(indexTip[0], indexTip[1], wrist[0], wrist[1])
    let middleDist = dist(middleTip[0], middleTip[1], wrist[0], wrist[1])
    let ringDist = dist(ringTip[0], ringTip[1], wrist[0], wrist[1])
    let pinkyDist = dist(pinkyTip[0], pinkyTip[1], wrist[0], wrist[1])
    
    // Calcola distanza media
    let avgDist = (thumbDist + indexDist + middleDist + ringDist + pinkyDist) / 5
    
    // Se la distanza media è sotto una soglia, la mano è chiusa
    return avgDist < 100
}

function draw() {
    if (isPaused) {
        image(img_pause, width / 2 - img_pause.width / 2, height / 2 - img_pause.height / 2)
        return
    }
    // Controlla se sono passati 10 secondi
    if (!gameCanStart && millis() - gameStartTime >= DELAY_BEFORE_ENEMIES) {
    gameCanStart = true
    }
    
    // Gestione ricarica munizioni
    if (isReloading) {
        let reloadProgress = millis() - reloadStartTime
        if (reloadProgress >= RELOAD_TIME) {
            // Ricarica completata
            isReloading = false
            ammo = MAX_AMMO
        }
    }
    
    // Loop dello sfondo (si ferma se game over)
    if (!gameOver) {
        bg_x1 -= bg_speed
        bg_x2 -= bg_speed
    }
    
    image(bimg_sky1, bg_x1, 0, width, height)
    image(bimg_sky2, bg_x2, 0, width, height)
    
    if (!gameOver) {
        if (bg_x1 <= -width) {
            bg_x1 = bg_x2 + width
        }
        if (bg_x2 <= -width) {
            bg_x2 = bg_x1 + width
        }
    }
    
    // Disegna cuori (vite) in alto a sinistra
    for (let i = 0; i < MAX_LIVES; i++) {
        let heartX = 20 + i * 70
        let heartY = 10
        if (i < lives) {
            image(img_heartFull, heartX, heartY, 50, 50)
        } else {
            image(img_heartEmpty, heartX, heartY, 50, 50)
        }
    }

    // Disegna contatore aerei abbattuti in alto a destra
    textFont(arcadeFont)
    textSize(20)
    textAlign(LEFT)
    stroke(0)
    strokeWeight(4)
    fill(255, 170, 0)
    text("Abbattuti: " + enemiesDestroyed, 30, 700)
    
    // Disegna contatore munizioni in alto a sinistra sotto i cuori
    fill(255)
    textSize(24)
    textAlign(LEFT)
    
    if (isReloading) {
        // Mostra barra di ricarica
        let reloadProgress = (millis() - reloadStartTime) / RELOAD_TIME
        let barWidth = 180
        let barHeight = 20
        let barX = 20
        let barY = 90
        
        // Sfondo barra
        fill(50)
        rect(barX, barY, barWidth, barHeight, 5)
        
        // Progresso ricarica
        fill(255, 200, 0)
        rect(barX, barY, barWidth * reloadProgress, barHeight, 5)
        
        // Testo "RICARICA"
        fill(255)
        textAlign(CENTER)
        text("RICARICA", barX + barWidth / 2, barY + 15)
    } else {
        // Mostra contatore munizioni
        if (ammo <= 5) {
            fill(255, 0, 0) // Rosso se poche munizioni
        } else {
            fill(255)
        }
        textFont(arcadeFont)
        textSize(30)
        stroke(0)         // colore bordo
        strokeWeight(4)    // spessore bordo
        fill(255, 170, 0)
        text("Munizioni: " + ammo + "/" + MAX_AMMO, 20, 100)
    }
    
    // Disegna aereo se esiste
    if (plane) {
        // Aggiorna invincibilità
        if (isInvincible) {
            if (millis() - invincibleStartTime >= INVINCIBLE_TIME) {
                isInvincible = false
            }
        }

        // Lampeggio: mostra l'aereo a intervalli di 100ms durante l'invincibilità
        let showPlane = true
        if (isInvincible) {
            showPlane = Math.floor((millis() - invincibleStartTime) / 200) % 2 === 0
        }

        if (showPlane) {
            image(plane.imgShow, plane.x, plane.y)
        }
        
        // CONTROLLO CON HAND TRACKING
        if (handY !== null && !gameOver) {
            // Muovi l'aereo alla posizione Y della mano con smooth transition
            let targetY = constrain(handY - plane.height / 2, 30, height - plane.height - 30)
            plane.y = lerp(plane.y, targetY, 0.3) // Smooth movement
        }
        
        // CONTROLLO CON TASTIERA (alternativo/backup)
        if(keyIsDown(87)) { 
            plane.moveUp()
        }
        if(keyIsDown(83)) { 
            plane.moveDown()
        }
    }
    
    // spawn aerei nemici ogni tot frame SOLO DOPO IL DELAY
    if (gameCanStart && frameCount % plane_enemy_spawnRate === 0 && !gameOver) {
        obstacles.push(new PlaneEnemy(img_plane_enemy))
    }
    
    // spawn ingranaggi ogni tot frame SOLO DOPO IL DELAY
    if (gameCanStart && frameCount % gear_spawnRate === 0 && !gameOver) {
        gears.push(new Gear(img_gear))
    }

    // SPARO CON HAND TRACKING (quando la mano è aperta, continuo)
    if (!isHandClosed && handY !== null && frameCount % bullet_spawnRate === 0 && !gameOver && plane && !isReloading) {
        if (ammo > 0) {
            shots.push(new Bullet(img_bullet, plane.x + plane.width, plane.y + plane.height/2))
            ammo--
            
            if (ammo <= 0) {
                isReloading = true
                reloadStartTime = millis()
            }
        }
    }
    previousHandClosed = isHandClosed
    
    // spawn proiettili con tastiera (alternativo/backup)
    if(frameCount % bullet_spawnRate === 0 && keyIsDown(32) && !gameOver && plane && !isReloading) {
        if (ammo > 0) {
            shots.push(new Bullet(img_bullet, plane.x + plane.width, plane.y + plane.height/2))
            ammo--
            
            // Se finiscono le munizioni, inizia la ricarica
            if (ammo <= 0) {
                isReloading = true
                reloadStartTime = millis()
            }
        }
    }
    
    // Aggiorna e disegna proiettili (si fermano se game over)
    for (let i = shots.length - 1; i >= 0; i--) {
        if (!gameOver) {
            shots[i].move()
        }
        shots[i].show()

        // Rimuovi se fuori schermo
        if (shots[i].offscreen()) {
            shots.splice(i, 1)
            continue
        }

        // Controlla collisione proiettile-aereo nemico
        if (!gameOver) {
            for (let j = obstacles.length - 1; j >= 0; j--) {
                let distance = dist(
                    shots[i].x + shots[i].imgShow.width / 2,
                    shots[i].y + shots[i].imgShow.height / 2,
                    obstacles[j].x + obstacles[j].imgShow.width / 2,
                    obstacles[j].y + obstacles[j].imgShow.height / 2
                )
                
                // Collisione proiettile-aereo nemico
                let collision_distance = (shots[i].imgShow.width + obstacles[j].imgShow.width) / 2
                if(distance < collision_distance) {
                    // Crea esplosione nel punto di impatto
                    explosions.push(new Explosion(
                        obstacles[j].x, 
                        obstacles[j].y, 
                        obstacles[j].imgShow.width, 
                        obstacles[j].imgShow.height
                    ))
                    
                    // Rimuovi aereo nemico e proiettile
                    enemiesDestroyed++
                    obstacles.splice(j, 1)
                    shots.splice(i, 1)
                    break
                }
            }
        }
    }
    
    // Aggiorna e disegna ingranaggi (si fermano se game over)
    for (let i = gears.length - 1; i >= 0; i--) {
        if (!gameOver) {
            gears[i].move()
        }
        gears[i].show()

        // Rimuovi se fuori schermo
        if (gears[i].offscreen()) {
            gears.splice(i, 1)
            continue
        }

        // Controlla collisione ingranaggio-aereo (recupero vita)
        if (plane && !gameOver && gears[i].collision(plane)) {
            if (lives < MAX_LIVES) {
                lives++
            }
            gears.splice(i, 1)
        }
    }

    // Aggiorna e disegna aerei nemici (si fermano se game over)
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (!gameOver) {
            obstacles[i].move()
        }
        obstacles[i].show()

        // Rimuovi se fuori schermo
        if (obstacles[i].offscreen()) {
            obstacles.splice(i, 1)
            continue
        }

        // distanza tra aereo e aereo nemico
        if (plane && !gameOver) {
            let distance = dist(
                plane.x + plane.width / 2,
                plane.y + plane.height / 2,
                obstacles[i].x + obstacles[i].imgShow.width / 2,
                obstacles[i].y + obstacles[i].imgShow.height / 2
            )
            // collisione aereo - aereo nemico
            if(plane.collision(distance, obstacles[i])) {
                // Rimuovi aereo nemico
                obstacles.splice(i, 1)

                // Perdi una vita solo se non invincibile
                if (!isInvincible) {
                    lives--
                    
                    // Attiva invincibilità e lampeggio
                    isInvincible = true
                    invincibleStartTime = millis()
                    
                    // Crea esplosione
                    explosions.push(new Explosion(plane.x, plane.y, plane.width, plane.height))
                    
                    // Se non ci sono più vite, game over
                    if (lives <= 0) {
                        plane = null
                        gameOver = true
                    }
                }
            }
        }
    }
    
    // Aggiorna e disegna esplosioni
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update()
        explosions[i].show()
        
        if (explosions[i].finished()) {
            explosions.splice(i, 1)
        }
    }
    
    // Indicatore visivo dello stato della mano
    if (predictions.length > 0 && !gameOver) {
        fill(isHandClosed ? color(255, 0, 0) : color(0, 255, 0))
        noStroke()
        ellipse(width - 30, 30, 20, 20)
    }
    
    // Countdown pre-partita
    if (!gameCanStart) {
        let secondsLeft = Math.ceil((DELAY_BEFORE_ENEMIES - (millis() - gameStartTime)) / 1000)
        
        noStroke()
        fill(0, 0, 0, 150)
        rect(0, height / 2 - 100, width, 200)
        
        textFont(arcadeFont)
        textAlign(CENTER, CENTER)
        stroke(0)
        strokeWeight(4)
        fill(255, 220, 0)
        textSize(50)
        text("PREPARATI!", width / 2, height / 2 - 30)
        
        fill(255)
        textSize(80)
        text(secondsLeft, width / 2, height / 2 + 50)
    }

    // Messaggio Game Over
    if (gameOver) {
        fill(255, 0, 0)
        textSize(72)
        textAlign(CENTER, CENTER)
        text("GAME OVER", width / 2, height / 2)
    }
}

function keyPressed() {
    if (keyCode === ESCAPE) {
        isPaused = !isPaused
    }
}