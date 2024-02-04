
class Bot {
    constructor(character, target) {
        this.character = character;
        this.target = target;

        this.controlSpeed = 1;
    }

    updateMovement() {
        this.character.velocity.xy = [0, 0];
        
        let movementDirection = this.target.position.y - this.character.position.y;
        let minMovementLenght = this.character.half_size.y/3;
        if (this.target.direction.x > 0) {
            this.controlSpeed = 1;
        } else {
            this.controlSpeed = 0.25;
            minMovementLenght = 0;
        }

        if (movementDirection > minMovementLenght) {
            this.character.velocity.y =  this.character.speed * this.controlSpeed;
        } else if (movementDirection < -minMovementLenght) {
            this.character.velocity.y = -this.character.speed * this.controlSpeed;
        }
    }
}