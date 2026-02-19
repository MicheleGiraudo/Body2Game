class Player{
    constructor(){
        this.x = width/2;        // posizione iniziale orizzontale (centro)
        this.y = height - 300;   // posizione verticale (vicino al fondo)
        this.size = 300;         
        this.speed = 5;     

        this.img = babboDx;      // immagine di default (guarda a destra)
        this.targetX = width/2;  // destinazione verso cui muoversi
    }

    move(){
        // Se viene rilevato almeno un corpo
        if(poses.length > 0){
            let pose = poses[0]; // prende il primo corpo rilevato

            // Prende il punto del naso
            let nose = pose.keypoints.find(kp => kp.name === 'nose');
            
            // Se il naso è rilevato con buona precisione
            if(nose && nose.confidence > 0.1){
                
                // Converte posizione naso (webcam) in posizione schermo (specchiata)
                this.targetX = map(nose.x, 0, 640, width, 0);
                
                // Cambia sprite in base alla direzione di movimento
                if(this.targetX < this.x){
                    this.img = babboSx; // si muove a sinistra
                } else if(this.targetX > this.x){
                    this.img = babboDx; // si muove a destra
                }
                
                // Movimento fluido verso la posizione rilevata
                this.x = lerp(this.x, this.targetX, 0.2);
            }
        }

        // Impedisce al personaggio di uscire dai bordi
        this.x = constrain(this.x, 0, width - this.size);
    }

    show(){
        image(this.img, this.x, this.y, this.size, this.size); // disegna il personaggio
    }
}