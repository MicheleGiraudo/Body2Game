class Rocket{
    constructor(imgIniziale) {
        this.x = width
        this.y = random(30, height-100)
        this.speed = 7 //velocità verso sinistra
        this.imgShow = imgIniziale
    }

    move() {
        this.x -= this.speed
    }

    show() {
        image(this.imgShow, this.x, this.y)
    }

    offscreen() {
        return this.x <= -this.imgShow.width
    }
}