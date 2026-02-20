class Plane{
    constructor(imgIniziale, x, y) {
        this.x = x
        this.y = y
        this.imgShow = imgIniziale
        this.width = imgIniziale.width
        this.height = imgIniziale.height
        this.speed = 20
    }

    collision(distance, other) {
        // Distanza di collisione basata sulla somma dei raggi
        let collision_distance = (this.width + other.imgShow.width) / 2
        if(distance < collision_distance) {
            return true
        }
        return false
    }

    moveUp() {
        if(this.y > 30) this.y -= this.speed
    }

    moveDown() {
        if(this.y + this.height < height - 30)this.y += this.speed
    }
}