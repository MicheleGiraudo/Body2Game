class Pausa {
  constructor(imgPausa) {
    this.imgShows = imgPausa;
  }

  show() {
    image(this.imgShows, width / 2 - this.imgShows.width / 2, height / 2 - this.imgShows.height / 2);
  }
}