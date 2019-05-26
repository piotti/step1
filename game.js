

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

    charge_mana() {
        this.entity.charge_mana();
    }

    attack() {
        this.entity.attack();
    }

    alt_attack() {
        this.entity.alt_attack();
    }

    add_mana() {
        this.entity.add_mana();
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
        if(keyCode == this.down_key) {
            this.charge_mana();
        }
        if(keyCode == this.attack_key) {
            this.attack();
        }
        if(keyCode == this.alt_attack_key){
            this.alt_attack();
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
        if(keyCode == this.down_key) {
            this.add_mana();
        }
    }
}

class PlayerOneController extends Controller{
    constructor(entity) {
        super(entity);
        this.left_key = LEFT_ARROW;
        this.right_key = RIGHT_ARROW;
        this.jump_key = UP_ARROW;
        this.down_key = 40;   
        this.attack_key = 16;
        this.alt_attack_key = 18;
    }
}

class PlayerTwoController extends Controller{
    constructor(entity) {
        super(entity);
        this.left_key = 65; //A
        this.right_key = 68; //D
        this.jump_key = 87; //W
        this.down_key = 83; //S
        this.attack_key = 69 //E
        this.alt_attack_key = 81; //Q
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
        this.em = new EntityManager();

        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].setEntityManager(this.em);
        }

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
            this.entities[i].updatePosition()
            this.entities[i].draw();

        }  

        this.em.updatePosition();
        this.em.draw();
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


class EntityManager {
    constructor() {
        this.entities = new Set();
    }

    removeEntity(ent) {
        this.entities.delete(ent);
    }

    addEntity(ent) {
        this.entities.add(ent);
        ent.setEntityManager(this);
    }


    updatePosition() {
        this.entities.forEach(function(e) {
            e.updatePosition();
        })
    }

    draw() {
        this.entities.forEach(function(e) {
            e.draw();
        })
    }
}


class Projectile {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.vx = dir == directions.RIGHT ? 10: -10;
    }

    setEntityManager(em) {
        this.em = em;
    }

    updatePosition() {
        this.x += this.vx;
        if (this.x < -10 || this.x > width + 10) {
            // remove
            this.em.removeEntity(this);
        }
    }

    draw() {
        fill(color(0));
        rect(this.x, this.y, (this.vx < 0 ? -10: 10), 2);
        

    }
}






