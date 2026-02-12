class Palla {
  constructor(img, x, y) {
    this.x = x;
    this.y = y;

    this.vx = random(-25, 25); //angolazione
    this.vy = random(-40, -20); //velocita

    this.imgShow = img;

    this.maxSize = 80; //dimensione piu grande della palla 
    this.minSize = 35; //dimensione piu piccola della palla (fisica)
    this.size = this.maxSize;
    this.startY = y;
  }
}