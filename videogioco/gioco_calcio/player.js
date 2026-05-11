class Player{
    constructor(imgStartPlayer, x, y){

        //jump
        this.g = 6 // Gravity
        this.jumpPx = 60 //dimensione del salto



        //default
        this.x = x
        this.y = y
        
        this.vy = 0 //velocita asse y
        
        //player img
        this.imgShow = imgStartPlayer       
    }

    moveDx(v) {
        this.x += v
    }

    moveSx(v){
        this.x -= v
    }

    jump(){ 
        this.vy = -this.jumpPx
    }    

    discesa(ground){
        this.y += this.vy //aggiorna la posizione
        this.vy += this.g //applica la gravita e scende
        
        //tocca per terra
        if (this.y >= ground) {
            this.y = ground
            this.vy = 0
        }
    }

    touch(other, startX){
        if(
            (this.x + this.imgShow.width) >= other.x + 1 &&
            this.imgShow.width <= other.x &&
            (this.y + this.imgShow.height / 2) >= other.y
        ){
            this.x -= startX 
        }
    }

    reset(x, y){
        this.x = x
        this.y = y
        this.vy = 0
    }

    /*touch(d, other){
        let collisionDistance = (this.imgShow.width + other.imgShow.width) / 2
        if(d < collisionDistance){
            this.x = 100
            other.x = 1100
        }
    }*/
}