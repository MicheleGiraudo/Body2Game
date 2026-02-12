class Player{
    constructor(){
        this.x = width/2;
        this.y = height - 40;
        this.size = 30;
        this.speed = 5;
    }

    move(){
        if(keyIsDown(LEFT_ARROW)){
            this.x -= this.speed;
        }

        if(keyIsDown(RIGHT_ARROW)){
            this.x += this.speed;
        }

        this.x = constrain(this.x, 0, width - this.size);
    }

    show(){
        fill(0);
        rect(this.x, this.y, this.size, this.size);
    }
}