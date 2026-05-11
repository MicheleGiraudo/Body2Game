class Oggetto {
  constructor(img) {
    this.img = img;
    this.x = random(0, width - 70);
    this.y = -70;
    this.vel = bgVel;
    this.size = 70;
  }

  move() {
    this.y += this.vel;
  }

  show() {
    image(this.img, this.x, this.y, this.size, this.size);
  }

  fuoriSchermo() {
    return this.y > height;
  }
}
