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
        if (isBorder) { this.size = this.size.add( getElementBorder(this.style) ); }

        this.half_size = this.size.div(2);

        this.collider = this.size.copy;
        this.half_collider = this.collider.div(2);

        this.animation_list = {};

        objects_list.push(this);
    }

    set setSize(vector) {
        this.size = new Vector2(vector);
        this.half_size = this.size.div(2);
    }

    set setCollider(vector) {
        this.collider = new Vector2(vector);
        this.half_collider = this.collider.div(2);
    }

    updateElementPosition() {
        this.element.style.left = (this.position.x - this.half_size.x) +'px';
        this.element.style.bottom = (this.position.y - this.half_size.y) +'px';
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

            if (anim['timer'].isActive) {
                this.element.classList.remove(anim['realname']);
                anim['timer'].reset();
            }

            anim['timer'].start();
            this.element.classList.add(anim['realname']);
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

    set color(value) {
        this.team_color = value;
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
            if (collider == this) { return }
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

        this.velocity = new Vector2();

        this.animation_list['hit'] = {
            'timer': new Timer(0.8, true),
            'realname': "pongball-hit"
        };
        this.animation_list['switch-color'] = {
            'timer': new Timer(0.8, true),
            'realname': "pongball-switch-color"
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

        this.playAnimation('hit');
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
        this.playAnimation('switch-color');
    }

    updateCollision() {
        let new_collision_list = collision_list.concat(characters_list);

        new_collision_list.forEach( collider => {
            if (collider == this) { return }
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
                        this.playAnimation('switch-color');

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
        this.velocity.xy = [
            this.direction.x * this._speed,
            this.direction.y * this._speed
        ];

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }
}