class Cubo{
    constructor(){
        this.size = 80;
        this.reset();
        this.taken = false;
    }

    scendi(){
        this.y += this.speed;
    }

    show(){
        image(this.img, this.x, this.y, this.size, this.size);
    }

    reset(){
    // Genera x evitando la zona della pila
        do {
            this.x = random(width - this.size);
        } while (this.x > pila - this.size && this.x < pila + this.size);

        this.y = random(-150, 0);
        this.speed = random(0.5, 2);

        let scelta = random(["blu", "rosso", "verde", "giallo"]);

        this.nome = scelta;

        // Associa immagine alla variabile scelta
        switch(scelta){
            case "blu": this.img = blu; break;    
            case "rosso": this.img = rosso; break; 
            case "verde": this.img = verde; break; 
            case "giallo": this.img = giallo; break; 
        }

        this.taken = false;
    }

}
