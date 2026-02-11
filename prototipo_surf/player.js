
class Player {
    constructor(imgIniziale, startX, startY) {
        this.x = startX
        this.y = startY
        this.imgShow = imgIniziale
        this.step = 25
        this.width = 60
        this.height = 60
    }

    moveDx() {
        this.x += this.step
        if (this.x + this.width > width) this.x = width - this.width
    }

    moveSx() {
        this.x -= this.step
        if (this.x < 0) this.x = 0
    }

    show() {
        image(this.imgShow, this.x, this.y, this.width, this.height)
    }
}

class Oggetto {
    constructor(img){
        this.img = img
        this.x = random(0, width - 60)
        this.y = -60
        this.vel = bgVel  // stessa velocità dello sfondo
        this.size = 60
    }

    move(){ this.y += this.vel }
    show(){ image(this.img, this.x, this.y, this.size, this.size) }
    fuoriSchermo(){ return this.y > height }
}
