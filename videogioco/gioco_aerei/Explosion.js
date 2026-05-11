class Explosion{
    constructor(x, y, width, height){
        // Centra l'esplosione sull'oggetto
        this.x = x + width / 2 - 50  // 50 è metà della larghezza dell'esplosione (100/2)
        this.y = y + height / 2 - 50  // 50 è metà dell'altezza dell'esplosione (100/2)
        this.frame = 0
        this.frameDelay = 5
    }

    update(){
        if(frameCount % this.frameDelay === 0) {
            this.frame++
        }
    }

    show(){
        if(this.frame < img_explosions.length) {  
            image(img_explosions[this.frame], this.x, this.y, 100, 100)
        }
    }

    finished() {
        return this.frame >= img_explosions.length
    }
}