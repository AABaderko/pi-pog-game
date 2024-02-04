
class Vector2 {
    constructor(x = 0, y = 0) {
        if (typeof x == 'object') {
            this.x = x[0]; this.y = x[1];
        } else {
            this.x = x; this.y = y;
        }
    }

    set [0](value) { this.x = value; }
    get [0]() { return this.x; }
    
    set [1](value) { this.y = value; }
    get [1]() { return this.y; }

    set xy(obj) {
        if (typeof obj == 'object') {
            this.x = obj[0]; this.y = obj[1];
        }
    }
    get xy() { return [x, y]; }

    get copy() {
        return new Vector2(this.x, this.y);
    }

    add(vector) {
        return new Vector2(this.x + vector[0], this.y + vector[1]);
    }

    sub(vector) {
        return new Vector2(this.x - vector[0], this.y - vector[1]);
    }

    mult(obj) {
        let vector = new Vector2();
        if (typeof obj == 'object') {
            vector.x = this.x * obj[0]; vector.y = this.y * obj[1];
        } else {
            vector.x = this.x * obj; vector.y = this.y * obj;
        }
        return vector;
    }

    div(obj) {
        let vector = new Vector2();
        if (typeof obj == 'object') {
            vector.x = this.x / obj[0]; vector.y = this.y / obj[1];
        } else {
            vector.x = this.x / obj; vector.y = this.y / obj;
        }
        return vector;
    }

    get length() { return Math.hypot(this.x, this.y)}

    get normalize() { return this.div(this.length); }

    dot(vector) {
        return ( (this.x * vector[0]) + (this.y * vector[1]) );
    }

}

timers_list = [];

class Timer {
    constructor(ticks = 0, inSeconds = false) {
        this.timer = 0;
        this.timer_end = (inSeconds) ? ticks*60 : ticks;
        this.timer_end_default = this.timer_end;

        this.isActive = false;

        timers_list.push(this);
    }

    set time(value) { this.timer_end = value; }

    start() { this.isActive = true; }
    stop() { this.isActive = false; }

    update() {
        if (!this.isActive) { return; }

        if (this.isDone) { 
            this.reset();
            return;
        }
        this.timer++;
    }

    reset() { 
        this.timer = 0;
        this.stop();
    }

    default() { this.timer_end = this.timer_end_default; }

    get isDone() {
        return ( this.timer >= this.timer_end );
    }
}

const getTop    = (obj) => { return obj.position.y + obj.half_size.y };
const getBottom = (obj) => { return obj.position.y - obj.half_size.y };
const getLeft   = (obj) => { return obj.position.x - obj.half_size.x };
const getRight  = (obj) => { return obj.position.x + obj.half_size.x };


function isColliding(obj, coll) {
    return (
        ( getTop (obj) > getBottom(coll) ) && ( getBottom(obj) < getTop (coll) ) &&
        ( getLeft(obj) < getRight (coll) ) && ( getRight (obj) > getLeft(coll) )
    )
}

function isOutside(obj, coll) {
    return (
        ( getTop(obj) > getTop(coll) ) || ( getBottom(obj) < getBottom(coll) ) ||
        ( getLeft(obj) < getLeft (coll) ) || ( getRight(obj) > getRight(coll) )
    )
}


function applyCollision(obj, coll) {
    let x_axis = [0, 0];
    let y_axis = [0, 0];
    let normal = 1;

    if ( getTop(obj) > getBottom(coll) ) {
        y_axis[0] = getTop(obj) - getBottom(coll);
    }
    if ( getBottom(obj) < getTop(coll) ) {
        y_axis[1] = getTop(coll) - getBottom(obj);
    }
    if ( getLeft(obj) < getRight(coll) ) {
        x_axis[0] = getRight(coll) - getLeft(obj);
    }
    if ( getRight(obj) > getLeft(coll) ) {
        x_axis[1] = getRight(obj) - getLeft(coll);
    }

    let x_min = Math.min(x_axis[0], x_axis[1]);
    let y_min = Math.min(y_axis[0], y_axis[1]);

    if (y_min < x_min) {
        normal = ( y_min == y_axis[1] ) ? 1 : -1;
        return [new Vector2(0, y_min), new Vector2(0, normal), 1]; // axis - 'y'=1
    } else {
        normal = ( x_min == x_axis[0] ) ? 1 : -1;
        return [new Vector2(x_min, 0), new Vector2(normal, 0), 0]; // axis - 'x'=0
    }
}

function applyInsideCollisionX(obj, coll) {
    let x_axis = [0, 0];

    if ( getLeft(obj) < getLeft(coll) ) {
        x_axis[0] = getLeft(obj) - getLeft(coll);
    }
    if ( getRight(obj) > getRight(coll) ) {
        x_axis[1] = getRight(coll) - getRight(obj);
    }

    let x_min = Math.min(x_axis[0], x_axis[1]);
    let normal = ( x_min == x_axis[1] ) ? 1 : -1;
    return [new Vector2(x_min, 0), new Vector2(normal, 0), 0];
}

function applyInsideCollisionY(obj, coll) {
    let y_axis = [0, 0];

    if ( getTop(obj) > getTop(coll) ) {
        y_axis[0] = getTop(coll) - getTop(obj);
    }
    if ( getBottom(obj) < getBottom(coll) ) {
        y_axis[1] = getBottom(obj) - getBottom(coll);
    }

    let y_min = Math.min(y_axis[0], y_axis[1]);
    let normal = ( y_min == y_axis[0] ) ? 1 : -1;
    return [new Vector2(0, y_min), new Vector2(0, normal), 1];
}

const applyInsideCollisionAxis = [
    applyInsideCollisionY,
    applyInsideCollisionX
];

function applyInsideCollision(obj, coll) {
    let x_axis = [0, 0];
    let y_axis = [0, 0];
    let normal = 1;

    if ( getTop(obj) > getTop(coll) ) {
        y_axis[0] = getTop(coll) - getTop(obj);
    }
    if ( getBottom(obj) < getBottom(coll) ) {
        y_axis[1] = getBottom(obj) - getBottom(coll);
    }
    if ( getLeft(obj) < getLeft(coll) ) {
        x_axis[0] = getLeft(obj) - getLeft(coll);
    }
    if ( getRight(obj) > getRight(coll) ) {
        x_axis[1] = getRight(coll) - getRight(obj);
    }

    let x_min = Math.min(x_axis[0], x_axis[1]);
    let y_min = Math.min(y_axis[0], y_axis[1]);

    if (y_min < x_min) {
        normal = ( y_min == y_axis[0] ) ? 1 : -1;
        return [new Vector2(0, y_min), new Vector2(0, normal), 1]; // axis - 'y'=1
    } else {
        normal = ( x_min == x_axis[1] ) ? 1 : -1;
        return [new Vector2(x_min, 0), new Vector2(normal, 0), 0]; // axis - 'x'=0
    }
}

function getRandomValue(max = 1, min = 0) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(max = 1) {
    return Math.round(Math.random() * max);
}

function copyArray(array) {
    return array.map((x) => x)
}



function degToRad(deg) {
    return (deg * Math.PI) / 180;
}
function radToDeg(rad) {
    return (rad * 180) / Math.PI;
}


function degToVector(deg) {
    let rad = degToRad(deg);
    return new Vector2(Math.cos(rad), Math.sin(rad));
}

function vectorToDeg(vector) {
    let x = Math.acos(vector[0]);
    let y = Math.asin(vector[1]);

    x = radToDeg(x); y = radToDeg(y);

    if (y < 0) { return 360 - x; }
    return x;
}

function reflectVector(vector, normal) {
    let normalize = normal.normalize;
    let dot = 2 * vector.dot(normalize);
    return vector.sub( normalize.mult(dot) );
}


function getElementBorder(style) {
    let border_vector = new Vector2();
    let border = parseFloat(style.border);
    if (border) {
        border_vector.x = 2 * border;
        border_vector.y = 2 * border;
    } else if (style['border-top-width']) {
        border_vector.x = (parseFloat(style['border-left-width']) + parseFloat(style['border-right-width']))
        border_vector.y = (parseFloat(style['border-top-width']) + parseFloat(style['border-bottom-width']))
    }
    return border_vector;
}