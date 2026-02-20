class Cubo{
    constructor(){
        this.size = 80;  // dimensione
        this.reset();    // inizializza posizione e colore
        this.taken = false; // il cubo non è ancora stato raccolto
    }

    scendi(){
        this.y += this.speed; // sposta il cubo verso il basso
    }

    show(){
        image(this.img, this.x, this.y, this.size, this.size); // disegna il cubo
    }

    reset(){
        // Sceglie una X casuale evitando la zona della pila
        do {
            this.x = random(width - this.size);
        } while (this.x > pila - this.size && this.x < pila + this.size);

        this.y = random(-150, 0); // parte sopra lo schermo 
        this.speed = 2;           // velocità di caduta

        let scelta = random(["blu", "rosso", "verde", "giallo"]); 

        this.nome = scelta; // salva il nome del colore per confrontarlo dopo

        // Assegna l'immagine corrispondente al colore scelto
        switch(scelta){
            case "blu": this.img = blu; break;    
            case "rosso": this.img = rosso; break; 
            case "verde": this.img = verde; break; 
            case "giallo": this.img = giallo; break; 
        }

        this.taken = false; // reimposta lo stato del cubo come non raccolto
    }
}
