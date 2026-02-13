class Gear {
    constructor(imgIniziale) {
        this.x = width
        this.y = random(30, height - 100)
        this.speed = 15
        this.imgShow = imgIniziale
        this.rotation = 0
        this.rotationSpeed = 0.1
    }

    move() {
        this.x -= this.speed
        this.rotation += this.rotationSpeed
    }

    show() {
        push()
        translate(this.x + this.imgShow.width / 2, this.y + this.imgShow.height / 2)
        rotate(this.rotation)
        imageMode(CENTER)
        image(this.imgShow, 0, 0)
        pop()
    }

    offscreen() {
        return this.x <= -this.imgShow.width
    }
    
    collision(plane) {
        let distance = dist(
            this.x + this.imgShow.width / 2,
            this.y + this.imgShow.height / 2,
            plane.x + plane.width / 2,
            plane.y + plane.height / 2
        )
        
        let collision_distance = (this.imgShow.width + plane.width) / 2
        return distance < collision_distance
    }
}