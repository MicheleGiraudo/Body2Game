class Palla {
  constructor(img, x, y) {
    this.x = x;
    this.y = y;

    this.vx = random(-10, 10);
    this.vy = random(-8, -2);

    this.imgShow = img;

    this.maxSize = 80;
    this.minSize = 35;
    this.size = this.maxSize;
    this.startY = y;
  }
}