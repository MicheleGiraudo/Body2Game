class Player {
  constructor(imgIniziale, startX, startY) {
    this.x = startX;
    this.y = startY;
    this.imgShow = imgIniziale;
    this.width = 85;
    this.height = 85;
    this.invincibile = false;
    this.lampeggioDurata = 60; // frame
    this.lampeggioTimer = 0;
  }

  show() {
    if (this.invincibile) {
      if (frameCount % 10 < 5) return; // lampeggio
    }
    image(this.imgShow, this.x, this.y, this.width, this.height);
  }

  collide(obj) {
    return (
      this.x < obj.x + obj.size &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.size &&
      this.y + this.height > obj.y
    );
  }

  attivaInvincibilita() {
    this.invincibile = true;
    this.lampeggioTimer = this.lampeggioDurata;
  }

  update() {
    if (this.invincibile) {
      this.lampeggioTimer--;
      if (this.lampeggioTimer <= 0) this.invincibile = false;
    }
  }
}