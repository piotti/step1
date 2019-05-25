

class Controller {
    constructor(entity) {
        this.entity = entity;
    }

    move_left() {
        this.entity.takeDirection(directions.LEFT);
    }

    move_right() {
        this.entity.takeDirection(directions.RIGHT);
    }

    stop() {
        this.entity.takeDirection(directions.STOP);     
    }

    jump() {
        this.entity.jump();
    }

    keyPressed() {
        if(keyCode == this.left_key) {
            this.move_left();
        }
        if(keyCode == this.right_key) {
            this.move_right();
        }
        if(keyCode == this.jump_key) {
            this.jump();
        }
    }

    keyReleased() {
        if(keyCode == this.left_key) {
            if (this.entity.direction == directions.LEFT)
                this.stop();
        }
        if(keyCode == this.right_key) {
            if (this.entity.direction == directions.RIGHT)
                this.stop();
        }
    }


}

class PlayerOneController extends Controller{
    constructor(entity) {
        super(entity);
        this.left_key = LEFT_ARROW;
        this.right_key = RIGHT_ARROW;
        this.jump_key = UP_ARROW;
    }
}

class PlayerTwoController extends Controller{
    constructor(entity) {
        super(entity);
        this.left_key = 65; //A
        this.right_key = 68; //D
        this.jump_key = 87; //W
    }
}


var platform_length;
var platform_x;
var platform_y;
var gravity = 0.5;

class Game {
    constructor(entities, controllers) {
        this.entities = entities;
        this.controllers = controllers;

        platform_length = 600;
        platform_x = width/2-platform_length/2;
        platform_y = height-100;
    }

    setup() {
        background(200, 200, 200);
    }

    draw() {
        background(200, 200, 200);
        fill(color('gray'))
        rect(platform_x, platform_y, platform_length, 10);
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].updatePosition(directions.STOP)
            this.entities[i].draw();

        }  
    }

    keyPressed() {
        for (var i = 0; i < this.controllers.length; i++) {
            this.controllers[i].keyPressed();
        }
    }

    keyReleased() {
        for (var i = 0; i < this.controllers.length; i++) {
            this.controllers[i].keyReleased();
        }
    }
}

