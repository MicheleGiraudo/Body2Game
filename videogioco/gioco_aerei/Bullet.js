class Bullet{
    constructor(imgIniziale, x, y) {
        this.imgShow = imgIniziale
        this.x = x
        this.y = y
        this.speed = 20
    }

    move() {
        this.x += this.speed
    }

    show() {
        image(this.imgShow, this.x, this.y)
    }

    offscreen() {
        return this.x >= width
    }
}