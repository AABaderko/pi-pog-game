
class Bot {
    constructor(character, target) {
        this.character = character;
        this.target = target;

        this.target_pre_position = null;

        this.controlSpeed = 1;
    }

    updateMovement() {
        this.character.velocity.xy = [0, 0];
        
        let minMovementLength = this.character.half_size.y/3;
        if (this.target.direction.x > 0) {
            this.controlSpeed = 1;
            
            if (gameDificulty == 'hard') {
                if (this.target.isReseted) {
                    this.target_pre_position = null;
                } else if (!this.target_pre_position) {
                    this.target_pre_position = this.targetPreCalculation(this.target, screenGame);
                    
                } else if (this.target_pre_position) {
                    minMovementLength = this.character.half_size.y/8;
                }
            }
        } else {
            this.controlSpeed = 0.25;
            minMovementLength = 0;

            this.target_pre_position = null;
        }

        let movementDirection = this.target_pre_position ? this.target_pre_position.y : this.target.position.y;
        movementDirection -= this.character.position.y;

        if (movementDirection > minMovementLength) {
            this.character.velocity.y =  this.character.speed * this.controlSpeed;
        } else if (movementDirection < -minMovementLength) {
            this.character.velocity.y = -this.character.speed * this.controlSpeed;
        }
    }

    targetPreCalculation(target, collider) {
        let cos = target.direction.x;
        let sin = target.direction.y;

        let cathetus = new Vector2();
        cathetus.x = (cos > 0) ? (collider.size.x - distFromSideScreen) - (target.position.x) : target.position.x;
        cathetus.y = (sin > 0) ? collider.size.y - (target.position.y) : target.position.y;

        let hypotenuse = new Vector2();
        hypotenuse.x = Math.abs(cathetus.x / cos);
        hypotenuse.y = Math.abs(cathetus.y / sin);

        let length = Math.min(hypotenuse.x, hypotenuse.y);
        let local_position = target.direction.mult(length);
        
        let target_clone = {};
        target_clone.direction = target.direction.copy;
        target_clone.position = target.position.add(local_position);
        target_clone.half_collider = target.half_collider.copy;

        let hit = applyInsideCollision(target_clone, collider);
        let axis = hit[2];
        let normal = hit[1];

        target_clone.position[axis] += hit[0][axis] * normal[axis];
        target_clone.direction = reflectVector( target_clone.direction, normal );

        if (length == hypotenuse.y) {
            return this.targetPreCalculation(target_clone, collider);
        }
        return target_clone.position;
    }
}