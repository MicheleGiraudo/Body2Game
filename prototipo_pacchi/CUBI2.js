let player;
let cubi = [];
let colori;
let stackCount = 0;

let coloreAttivo;
let lastColorChange = 0;
let colorInterval = 10000;

let gameOver = false;
let win = false;

let stackX; // posizione pila a destra

function setup() {
  createCanvas(600, 400);

  player = {
    x: width / 2,
    y: height - 40,
    size: 30,
    speed: 5
  };

  colori = [
    color(0, 0, 255),
    color(255, 0, 0),
    color(0, 255, 0)
  ];

  coloreAttivo = random(colori);
  stackX = width - 50;

  for (let k = 0; k < 10; k++) {
    cubi.push(createCube());
  }
}

function draw() {
  background(220);

  drawColorScreen();

  if (gameOver || win) {
    drawEndScreen();
    return;
  }

  if (millis() - lastColorChange > colorInterval) {
    coloreAttivo = random(colori);
    lastColorChange = millis();
  }

  movePlayer();
  drawPlayer();

  for (let cubo of cubi) {

    if (!cubo.taken) {
      cubo.y += cubo.speed;

      if (cubo.y > height) {
        resetCube(cubo);
      }

      if (collide(player, cubo)) {
        if (cubo.col.toString() === coloreAttivo.toString()) {
          // ✅ COLORE GIUSTO → VA NELLA PILA
          cubo.taken = true;
          cubo.speed = 0;

          cubo.x = stackX;
          cubo.y = height - cubo.size * (stackCount + 1);

          stackCount++;

          if (stackCount >= 10) {
            win = true;
          }
        } else {
          // ❌ COLORE SBAGLIATO
          gameOver = true;
        }
      }
    }

    fill(cubo.col);
    rect(cubo.x, cubo.y, cubo.size, cubo.size);
  }
}

function drawColorScreen() {
  noStroke();
  fill(red(coloreAttivo), green(coloreAttivo), blue(coloreAttivo), 80);
  rect(0, 0, width, height);
}

function drawEndScreen() {
  background(0, 180);
  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);

  if (win) {
    text("HAI VINTO 🎉", width / 2, height / 2);
  } else {
    text("GAME OVER 💀", width / 2, height / 2);
  }
}

function movePlayer() {
  if (keyIsDown(LEFT_ARROW)) player.x -= player.speed;
  if (keyIsDown(RIGHT_ARROW)) player.x += player.speed;

  player.x = constrain(player.x, 0, width - player.size);
}

function drawPlayer() {
  fill(0);
  rect(player.x, player.y, player.size, player.size);
}

function createCube() {
  return {
    x: random(width - 80),
    y: random(-300, 0),
    size: 30,
    speed: random(1.5, 4),
    col: random(colori),
    taken: false
  };
}

function resetCube(cubo) {
  cubo.x = random(width - 80);
  cubo.y = random(-200, 0);
  cubo.speed = random(1.5, 4);
  cubo.col = random(colori);
  cubo.taken = false;
}

function collide(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}
