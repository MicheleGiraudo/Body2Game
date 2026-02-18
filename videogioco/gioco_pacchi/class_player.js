class Player{
    constructor(){
        this.x = width/2;
        this.y = height - 300;
        this.size = 300;
        this.speed = 5;

        this.img = babboDx;
        this.targetX = width/2;
    }

    move(){
        // Se viene rilevato almeno un corpo
        if(poses.length > 0){
            let pose = poses[0];

            // Prende il punto del naso
            let nose = pose.keypoints.find(kp => kp.name === 'nose');
            
            // Se il naso è rilevato con buona precisione
            if(nose && nose.confidence > 0.1){
                
                // Converte posizione naso in posizione orizzontale del player
                this.targetX = map(nose.x, 0, 640, width, 0);
                
                if(this.targetX < this.x){
                    this.img = babboSx;
                } else if(this.targetX > this.x){
                    this.img = babboDx;
                }
                
                // Movimento fluido verso la posizione rilevata
                this.x = lerp(this.x, this.targetX, 0.2);
            }
        }

        this.x = constrain(this.x, 0, width - this.size);
    }

    show(){
        image(this.img, this.x, this.y, this.size, this.size);
    }
}