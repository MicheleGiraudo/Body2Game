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
const RELOAD_TIME = 10000 // 10 secondi di ricarica in millisecondi

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
let lastCountdownSecond = -1
const DELAY_BEFORE_ENEMIES = 7000 // 10 secondi in millisecondi
let isPaused = false
let enemiesDestroyed = 0
let gameOverSoundPlayed = false

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

//SUONI
let sound_shoot
let sound_reload
let sound_explosion
let sound_countdown
let sound_powerup
let sound_gameOver

//PULSANTI
let btnRestart, btnMenu
let buttonsVisible = false

function preload() {
    //immagini
    bimg_sky1 = loadImage('./img/cielo.png')
    bimg_sky2 = loadImage('./img/cielo1.png')
    img_plane = loadImage('./img/aereo_utente.png')
    img_plane_enemy = loadImage('./img/aereo_nemico.png')
    img_bullet = loadImage('./img/proiettile.png')
    img_gear = loadImage('./img/ingranaggio.png')
    img_heartFull = loadImage('./img/cuorePieno.png')
    img_heartEmpty = loadImage('./img/cuoreVuoto.png')
    img_pause = loadImage('./img/pause.png')
    for (let i = 0; i < 6; i++) {
        img_explosions[i] = loadImage("./img/esplosione" + (i + 1) + ".png");
    }

    //font
    arcadeFont = loadFont('./font/PressStart2P-Regular.ttf')

    //suoni
    sound_shoot = new Howl({
        src: ['./sound/gunShot.mp3'],
        volume: 0.5,
        pool: 5
    })
    sound_reload = new Howl({
        src: ['./sound/gunLoading.mp3'],
        volume: 0.5,
        pool: 1
    })
    sound_explosion = new Howl({
        src: ['./sound/explosion.mp3'],
        volume: 0.5,
        pool: 5
    })
    sound_countdown = new Howl({
        src: ['./sound/countdown.mp3'],
        volume: 0.5,
        pool: 1
    })
    sound_powerup = new Howl({
        src: ['./sound/powerUp.mp3'],
        volume: 0.7,
        pool: 1
    })
    sound_gameOver = new Howl({
        src: ['./sound/gameOver.mp3'],
        volume: 2,
        pool: 1
    })
}

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight)
    canvas.parent('canvasContainer')
    
    plane = new Plane(img_plane, plane_x, plane_y)
    frameRate(70)
    
    video = createCapture(VIDEO, () => {
        loadHandTrackingModel()
    })
    video.size(320, 240)
    video.hide()
    
    gameStartTime = millis()

    // Crea pulsanti Restart e Menu
    btnRestart = createButton('▶ RESTART')
    btnRestart.parent('canvasContainer')
    styleButton(btnRestart, '#FFD700', '#000')
    btnRestart.mousePressed(restartGame)
    btnRestart.hide()

    btnMenu = createButton('⌂ MENU')
    btnMenu.parent('canvasContainer')
    styleButton(btnMenu, '#FF4444', '#fff')
    btnMenu.mousePressed(() => window.location.href = '../index.html')
    btnMenu.hide()
}

function styleButton(btn, bgColor, textColor) {
    btn.style('font-family', 'monospace')
    btn.style('font-size', '16px')
    btn.style('background', bgColor)
    btn.style('color', textColor)
    btn.style('border', '4px solid #000')
    btn.style('padding', '14px 28px')
    btn.style('cursor', 'pointer')
    btn.style('position', 'absolute')
    btn.style('box-shadow', '4px 4px 0px #000')
    btn.style('letter-spacing', '2px')
    btn.elt.onmouseover = () => btn.style('transform', 'translate(-2px,-2px)')
    btn.elt.onmouseout  = () => btn.style('transform', 'translate(0,0)')
}

function showButtons() {
    if (buttonsVisible) return
    buttonsVisible = true
    let rect = document.querySelector('canvas').getBoundingClientRect()
    let container = document.getElementById('canvasContainer').getBoundingClientRect()
    let cx = rect.left - container.left + rect.width / 2
    let cy = rect.top - container.top + rect.height / 2
    btnRestart.position(cx - 160, cy + 130)
    btnMenu.position(cx + 20, cy + 130)
    btnRestart.show()
    btnMenu.show()
}

function hideButtons() {
    buttonsVisible = false
    btnRestart.hide()
    btnMenu.hide()
}

function restartGame() {
    hideButtons()
    gameOver = false
    gameOverSoundPlayed = false
    isPaused = false
    lives = MAX_LIVES
    ammo = MAX_AMMO
    isReloading = false
    enemiesDestroyed = 0
    isInvincible = false
    gameCanStart = false
    lastCountdownSecond = -1
    obstacles.length = 0
    shots.length = 0
    gears.length = 0
    explosions.length = 0
    handY = null
    bg_x1 = 0
    bg_x2 = 1515
    plane = new Plane(img_plane, plane_x, plane_y)
    gameStartTime = millis()
}

function draw() {
    // Controlla se sono passati 10 secondi
    if (!gameCanStart && !isPaused && millis() - gameStartTime >= DELAY_BEFORE_ENEMIES) {
        gameCanStart = true
    }
    
    // Gestione ricarica munizioni (solo se non in pausa)
    if (isReloading && !isPaused) {
        let reloadProgress = millis() - reloadStartTime
        if (reloadProgress >= RELOAD_TIME) {
            isReloading = false
            ammo = MAX_AMMO
        }
    }
    
    // Loop dello sfondo (si ferma se game over o pausa)
    if (!gameOver && !isPaused) {
        bg_x1 -= bg_speed
        bg_x2 -= bg_speed
    }
    
    image(bimg_sky1, bg_x1, 0, width, height)
    image(bimg_sky2, bg_x2, 0, width, height)
    
    if (!gameOver && !isPaused) {
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

    // Disegna contatore aerei abbattuti
    textFont(arcadeFont)
    textSize(20)
    textAlign(LEFT)
    stroke(0)
    strokeWeight(4)
    fill(255, 170, 0)
    text("Destroyed: " + enemiesDestroyed, 30, 700)
    
    // Disegna contatore munizioni / barra ricarica
    fill(255)
    textSize(24)
    textAlign(LEFT)
    
    if (isReloading) {
        let reloadProgress = (millis() - reloadStartTime) / RELOAD_TIME
        // Se in pausa, congela il progresso visivo
        if (isPaused) reloadProgress = (reloadStartTime > 0) ? (reloadStartTime) / RELOAD_TIME : reloadProgress
        let barWidth = 180
        let barHeight = 20
        let barX = 20
        let barY = 90
        
        fill(50)
        rect(barX, barY, barWidth, barHeight, 5)
        
        fill(255, 200, 0)
        rect(barX, barY, barWidth * reloadProgress, barHeight, 5)
        
        fill(255)
        stroke(0)
        strokeWeight(3)
        textAlign(LEFT)
        text("RECHARGING", barX, barY + 40)
    } else {
        if (ammo <= 5) {
            fill(255, 0, 0)
        } else {
            fill(255)
        }
        textFont(arcadeFont)
        textSize(30)
        stroke(0)
        strokeWeight(4)
        fill(255, 170, 0)
        text("Ammunition: " + ammo + "/" + MAX_AMMO, 20, 100)
    }
    
    // Disegna aereo se esiste
    if (plane) {
        if (isInvincible) {
            if (millis() - invincibleStartTime >= INVINCIBLE_TIME) {
                isInvincible = false
            }
        }

        let showPlane = true
        if (isInvincible) {
            showPlane = Math.floor((millis() - invincibleStartTime) / 200) % 2 === 0
        }

        if (showPlane) {
            image(plane.imgShow, plane.x, plane.y)
        }
        
        // CONTROLLO CON HAND TRACKING (solo se non in pausa)
        if (handY !== null && !gameOver && !isPaused) {
            let targetY = constrain(handY - plane.height / 2, 30, height - plane.height - 30)
            plane.y = lerp(plane.y, targetY, 0.3)
        }
    }
    
    // Spawn aerei nemici (solo se non in pausa)
    if (gameCanStart && !isPaused && frameCount % plane_enemy_spawnRate === 0 && !gameOver) {
        obstacles.push(new PlaneEnemy(img_plane_enemy))
    }
    
    // Spawn ingranaggi (solo se non in pausa)
    if (gameCanStart && !isPaused && frameCount % gear_spawnRate === 0 && !gameOver) {
        gears.push(new Gear(img_gear))
    }

    // SPARO CON HAND TRACKING (solo se non in pausa)
    if (!isHandClosed && !isPaused && handY !== null && frameCount % bullet_spawnRate === 0 && !gameOver && plane && !isReloading) {
        if (ammo > 0) {
            shots.push(new Bullet(img_bullet, plane.x + plane.width, plane.y + plane.height/2))
            sound_shoot.play()
            ammo--

            if (ammo <= 0) {
                isReloading = true
                reloadStartTime = millis()
                sound_reload.play()
            }
        }
    }
    previousHandClosed = isHandClosed

    // Aggiorna e disegna proiettili
    for (let i = shots.length - 1; i >= 0; i--) {
        if (!gameOver && !isPaused) {
            shots[i].move()
        }
        shots[i].show()

        if (shots[i].offscreen()) {
            shots.splice(i, 1)
            continue
        }

        if (!gameOver && !isPaused) {
            for (let j = obstacles.length - 1; j >= 0; j--) {
                let distance = dist(
                    shots[i].x + shots[i].imgShow.width / 2,
                    shots[i].y + shots[i].imgShow.height / 2,
                    obstacles[j].x + obstacles[j].imgShow.width / 2,
                    obstacles[j].y + obstacles[j].imgShow.height / 2
                )
                
                let collision_distance = (shots[i].imgShow.width + obstacles[j].imgShow.width) / 2
                if (distance < collision_distance) {
                    explosions.push(new Explosion(
                        obstacles[j].x, 
                        obstacles[j].y, 
                        obstacles[j].imgShow.width, 
                        obstacles[j].imgShow.height
                    ))
                    sound_explosion.play()
                    enemiesDestroyed++
                    obstacles.splice(j, 1)
                    shots.splice(i, 1)
                    break
                }
            }
        }
    }
    
    // Aggiorna e disegna ingranaggi
    for (let i = gears.length - 1; i >= 0; i--) {
        if (!gameOver && !isPaused) {
            gears[i].move()
        }
        gears[i].show()

        if (gears[i].offscreen()) {
            gears.splice(i, 1)
            continue
        }

        if (plane && !gameOver && !isPaused && gears[i].collision(plane)) {
            sound_powerup.play()
            if (lives < MAX_LIVES) {
                lives++
            }
            gears.splice(i, 1)
        }
    }

    // Aggiorna e disegna aerei nemici
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (!gameOver && !isPaused) {
            obstacles[i].move()
        }
        obstacles[i].show()

        if (obstacles[i].offscreen()) {
            obstacles.splice(i, 1)
            continue
        }

        if (plane && !gameOver && !isPaused) {
            let distance = dist(
                plane.x + plane.width / 2,
                plane.y + plane.height / 2,
                obstacles[i].x + obstacles[i].imgShow.width / 2,
                obstacles[i].y + obstacles[i].imgShow.height / 2
            )
            if (plane.collision(distance, obstacles[i])) {
                obstacles.splice(i, 1)

                if (!isInvincible) {
                    lives--
                    
                    isInvincible = true
                    invincibleStartTime = millis()
                    
                    explosions.push(new Explosion(plane.x, plane.y, plane.width, plane.height))
                    sound_explosion.play()
                    
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
        if (!isPaused) {
            explosions[i].update()
        }
        explosions[i].show()
        
        if (explosions[i].finished()) {
            explosions.splice(i, 1)
        }
    }
    
    // Indicatore visivo stato della mano
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
        text("GET READY!", width / 2, height / 2 - 30)
        
        fill(255)
        textSize(80)
        text(secondsLeft, width / 2, height / 2 + 50)
        if (secondsLeft !== lastCountdownSecond) {
            lastCountdownSecond = secondsLeft
            sound_countdown.play()
        }
    }

    // Messaggio Game Over
    if (gameOver) {
        fill(255, 0, 0)
        textSize(72)
        textAlign(CENTER, CENTER)
        text("GAME OVER", width / 2, height / 2)
        if (!gameOverSoundPlayed) {
            gameOverSoundPlayed = true
            sound_gameOver.play()
            showButtons()
        }
    }

    // Overlay pausa â€" disegnato PER ULTIMO cosÃ¬ copre tutto il gioco
    if (isPaused) {
        fill(0, 0, 0, 150)
        noStroke()
        rect(0, 0, width, height)
        image(img_pause, width / 2 - img_pause.width / 2, height / 2 - img_pause.height / 2)

        // Scritta "press ESC to resume" sotto l'immagine di pausa
        textFont(arcadeFont)
        textAlign(CENTER, CENTER)
        noStroke()
        fill(200, 200, 200)
        textSize(14)
        text("Press ESC to resume", width / 2, height / 2 + img_pause.height / 2 + 40)
    }
}

function keyPressed() {
    if (keyCode === ESCAPE) {
        isPaused = !isPaused
        if (isPaused) showButtons()
        else hideButtons()
    }
}

async function loadHandTrackingModel() {
    model = await handpose.load()
    predictHand()
}

async function predictHand() {
    if (video && video.elt) {
        predictions = await model.estimateHands(video.elt)
        
        if (predictions.length > 0) {
            let prediction = predictions[0]
            let palmY = prediction.landmarks[0][1]
            
            handY = map(palmY, 0, 240, 30, 747)
            isHandClosed = detectHandClosed(prediction)
        } else {
            handY = null
            isHandClosed = false
        }
    }
    
    setTimeout(() => predictHand(), 50)
}

function detectHandClosed(prediction) {
    let annotations = prediction.annotations
    let wrist = prediction.landmarks[0]
    
    let thumbTip = annotations.thumb[3]
    let indexTip = annotations.indexFinger[3]
    let middleTip = annotations.middleFinger[3]
    let ringTip = annotations.ringFinger[3]
    let pinkyTip = annotations.pinky[3]
    
    let thumbDist = dist(thumbTip[0], thumbTip[1], wrist[0], wrist[1])
    let indexDist = dist(indexTip[0], indexTip[1], wrist[0], wrist[1])
    let middleDist = dist(middleTip[0], middleTip[1], wrist[0], wrist[1])
    let ringDist = dist(ringTip[0], ringTip[1], wrist[0], wrist[1])
    let pinkyDist = dist(pinkyTip[0], pinkyTip[1], wrist[0], wrist[1])
    
    let avgDist = (thumbDist + indexDist + middleDist + ringDist + pinkyDist) / 5
    
    return avgDist < 100
}