let objects_list = [];
let collision_list = [];

let characters_list = [];

class Object {
    constructor(element, position, size, isBorder = true) {
        this.element = document.getElementById(element);
        this.style = getComputedStyle(this.element);

        this.type = 'object';
        
        this.position = new Vector2(position);

        if (!size) {
            size = [parseFloat(this.style.width), parseFloat(this.style.height)];
        }
        this.size = new Vector2(size);
        if (isBorder) {
            this.size = this.size.add( getElementBorder(this.style) );
        }

        this.half_size = this.size.div(2);

        this.animation_list = {};

        objects_list.push(this);
    }

    updateElementPosition() {
        this.element.style.left = (this.position.x - this.half_size.x) +'px';
        this.element.style.bottom =  (this.position.y - this.half_size.y) +'px';
    }

    updateAnimation() {
        for (var name in this.animation_list) {
            let anim = this.animation_list[name];
            if (anim['timer'].isDone) { 
                this.element.classList.remove(anim['realname']);
            }
        }
    }

    playAnimation(name) {
        if (this.animation_list.hasOwnProperty(name)) {
            let anim = this.animation_list[name];

            this.element.classList.add(anim['realname']);
            anim['timer'].start();
        }
    }
}


class Collider extends Object {
    constructor(element, position, size, isBorder = true, isReverse = false) {
        super(element, position, size, isBorder);
        this.isReverse = isReverse;

        collision_list.push(this);
    }
}

class Screen extends Collider {
    constructor(element) {
        super(element, [0, 0], null, false, true);
        this.position = this.half_size.copy;

        objects_list.pop(objects_list.length-1);
    }
}



class Character extends Object {
    constructor(element, position, size, color = null) {
        super(element, position, size);
        this.type = 'character';

        this.team_color = color ? color : this.style['border-color'];
        this.element.style['border-color'] = this.team_color;

        this.velocity = new Vector2();
        this.speed = 240;

        characters_list.push(this);

        this.animation_list['hit'] = {
            'timer': new Timer(0.5, true),
            'realname': "player-ball-hit"
        };
    }

    set color(rgb_value) {
        this.team_color = rgb_value;
        this.element.style['border-color'] = this.team_color;
    }

    applyCollisionHit(hit) {
        let axis = hit[2];
        let normal = hit[1]

        this.position[axis] += hit[0][axis] * normal[axis];
        this.velocity[axis] = 0;
    }

    updateCollision() {
        collision_list.forEach( collider => {
            if (collider.isReverse) {
                if (isOutside(this, collider)) {
                    let hit = applyInsideCollision(this, collider);
                    this.applyCollisionHit(hit);

                    if (isOutside(this, collider)) {
                        hit = applyInsideCollisionAxis[hit[2]](this, collider);
                        this.applyCollisionHit(hit);
                    }
                }
            } else {
                if (isColliding(this, collider)) {
                    let hit = applyCollision(this, collider);
                    this.applyCollisionHit(hit);
                }
            }
        });
    }

    updateVelocity() {
        this.position = this.position.add( this.velocity.mult(dt) );
    }
}



class Projectile extends Object {
    speed_min = 240;
    speed_max = 800;

    angle_min = 20;
    angle_max = 60;

    constructor(element, position, normal = 1, speed_increase = 50, size) {
        super(element, position, size);
        this.default_position = this.position.copy;

        this.direction = this.setRandomDirection(normal);

        this.isReseted = true;

        this.speed_increase = speed_increase;
        this._speed = this.speed_min;

        this.velocity = [0, 0];

        this.animation_list['hit'] = {
            'timer': new Timer(0.8, true),
            'realname': "pongball-hit"
        };
    }

    setRandomDirection(normal) {
        let angle = getRandomValue(this.angle_min, this.angle_max);
        let angle_side = getRandomInt() ? 1 : -1;

        angle *= angle_side;
        angle = (normal == -1) ? 180 - angle : angle;

        return degToVector(angle);
    }

    applyCollisionHit(hit) {
        let axis = hit[2];
        let normal = hit[1];

        this.position[axis] += hit[0][axis] * normal[axis];
        this.direction = reflectVector( this.direction, normal );
        this.velocity[axis] = 0;
    }
    
    isSideCollision(hit) {
        if (hit[2] == 0) {
            let normal = hit[1][0];

            this.resetParameters(normal);
            gamePlayersScores[-normal] += 1;
        }
    }

    resetParameters(normal = 1) {
        this.isReseted = true;

        this.position = this.default_position.copy;
        this.direction = this.setRandomDirection(normal);
        this.speed = this.speed_min;

        this.element.style['border-color'] = null;
    }

    updateCollision() {
        let new_collision_list = collision_list.concat(characters_list);

        new_collision_list.forEach( collider => {
            if (collider.isReverse) {
                if (isOutside(this, collider)) {
                    let hit = applyInsideCollision(this, collider);
                    this.applyCollisionHit(hit);
                    this.isSideCollision(hit);

                    if (isOutside(this, collider)) {
                        hit = applyInsideCollisionAxis[hit[2]](this, collider);
                        this.applyCollisionHit(hit);
                        this.isSideCollision(hit);
                    }
                    this.speed = this._speed - this.speed_increase/4;
                }
            } else {
                if (isColliding(this, collider)) {
                    let hit = applyCollision(this, collider);
                    this.applyCollisionHit(hit);
                    if (collider.type == 'character') {
                        this.speed = this._speed + this.speed_increase;

                        this.element.style['border-color'] = collider.team_color;
                        this.playAnimation('hit');

                        collider.playAnimation('hit');
                    } else {
                        this.speed = this._speed - this.speed_increase/4;
                    }
                }
            }
        });
    }

    set speed(value) {
        this._speed = Math.max( Math.min(value, this.speed_max), this.speed_min )
    }

    updateVelocity() {
        this.velocity = [
            this.direction[0] * this._speed,
            this.direction[1] * this._speed
        ];

        this.position[0] += this.velocity[0] * dt;
        this.position[1] += this.velocity[1] * dt;
    }
}