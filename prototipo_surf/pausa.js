class Pausa {
  constructor(imgPausa, w, h) {
    this.imgShows = imgPausa;
    this.w = w || 800;  // larghezza di default, modifica a piacere
    this.h = h || 500;  // altezza di default, modifica a piacere
  }

  show() {
    image(
      this.imgShows,
      width / 2 - this.w / 2,
      height / 2 - this.h / 2,
      this.w,
      this.h
    );
  }
}