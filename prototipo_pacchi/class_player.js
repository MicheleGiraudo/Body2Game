class Player{
    constructor(){
        this.x = width/2;
        this.y = height - 300;
        this.size = 300;
        this.speed = 5;

        this.img = babboDx;
    }

    move(){
        if(keyIsDown(LEFT_ARROW)){
            this.x -= this.speed;
            this.img = babboSx;
        }

        if(keyIsDown(RIGHT_ARROW)){
            this.x += this.speed;
            this.img = babboDx;
        }

        this.x = constrain(this.x, 0, width - this.size);
    }

    show(){
        image(this.img, this.x, this.y, this.size, this.size);
    }
}
