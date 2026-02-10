let player;
let cubi = [];
let colori;
let stackCount = 0;

function setup() {
  createCanvas(600, 400);

  player = {
    x: width / 2,
    y: height - 40,
    size: 30,
    speed: 5
  };

  colori = [
    color(0, 0, 255),   // blu
    color(255, 0, 0),   // rosso
    color(0, 255, 0)    // verde
  ];

  for (let k = 0; k < 6; k++) {
    cubi.push(createCube());
  }
}

function draw() {
  background(220);

  movePlayer();
  drawPlayer();

  for (let cubo of cubi) {

    // se NON è preso, scende lentamente
    if (!cubo.taken) {
      cubo.y += cubo.speed;

      if (cubo.y > height) {
        resetCube(cubo);
      }

      if (collide(player, cubo)) {
        cubo.taken = true;
        cubo.x = width - cubo.size;
        cubo.y = height - cubo.size * (stackCount + 1);
        cubo.speed = 0;
        stackCount++;
      }
    }

    fill(cubo.col);
    rect(cubo.x, cubo.y, cubo.size, cubo.size);
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
    x: random(width - 40),
    y: random(-300, 0),
    size: 30,
    speed: random(0.5, 1.5), // PIÙ LENTI 🐢
    col: random(colori),
    taken: false
  };
}

function resetCube(cubo) {
  cubo.x = random(width - 40);
  cubo.y = random(-200, 0);
  cubo.speed = random(0.5, 1.5);
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
