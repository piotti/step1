

class Controller {
    constructor(entity) {
        this.entity = entity;
    }

    move_left(entity) {
        entity.takeDirection(directions.LEFT);
    }

    move_right(entity) {
        entity.takeDirection(directions.RIGHT);
    }

    stop(entity) {
        entity.takeDirection(directions.STOP);     
    }

    jump(entity) {
        entity.jump();
    }

    charge_mana(entity) {
        entity.charge_mana();
    }

    attack(entity) {
        entity.attack();
    }

    alt_attack(entity) {
        entity.alt_attack();
    }

    add_mana(entity) {
        entity.add_mana();
    }

    block(entity) {
        entity.block();
    }

    release_block(entity) {
        entity.release_block();
    }

    keyPressed() {
        if(keyCode == this.left_key) {
            this.move_left(this.entity);
        }
        if(keyCode == this.right_key) {
            this.move_right(this.entity);
        }
        if(keyCode == this.jump_key) {
            this.jump(this.entity);
        }
        if(keyCode == this.down_key) {
            this.charge_mana(this.entity);
        }
        if(keyCode == this.attack_key) {
            this.attack(this.entity);
        }
        if(keyCode == this.alt_attack_key){
            this.alt_attack(this.entity);
        }
        if(keyCode == this.block_key) {
            this.block(this.entity);
        }
    }

    keyReleased() {
        if(keyCode == this.left_key) {
            if (this.entity.direction == directions.LEFT)
                this.stop(this.entity);
        }
        if(keyCode == this.right_key) {
            if (this.entity.direction == directions.RIGHT)
                this.stop(this.entity);
        }
        if(keyCode == this.down_key) {
            this.add_mana(this.entity);
        }
        if(keyCode == this.block_key) {
            this.release_block(this.entity);
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
        this.block_key = 191; // /
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
        this.block_key = 88; // X
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

        this.nn_controllers = [];

        this.started = false;

    }

    start(scores_callback, i, j) {
        this.started = true;
        this.scores_callback = scores_callback;
        this.i = i;
        this.j = j;
    }

    setup() {
        background(200, 200, 200);
    }

    finishGame() {
        this.started = false;
        this.scores_callback(this.i, this.j, this.entities[0].getFitness(), this.entities[1].getFitness());
    }

    draw() {
        if(!this.started)
            return;
        background(200, 200, 200);
        fill(color('gray'))
        rect(platform_x, platform_y, platform_length, 10);
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].updatePosition()
            this.entities[i].draw();
            if (this.entities[i].dead && this.started) {
                this.finishGame();
            }

        }  

        this.em.updatePosition();
        this.em.draw();

        for (var i = 0; i < this.nn_controllers.length; i++) {
            this.nn_controllers[i].update();
        }
    }

    keyPressed() {
        if(!this.started)
            return;
        for (var i = 0; i < this.controllers.length; i++) {
            this.controllers[i].keyPressed();
        }
    }

    keyReleased() {
        if(!this.started)
            return;
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
    constructor(x, y, dir, opp) {
        this.x = x;
        this.y = y;
        this.vx = dir == directions.RIGHT ? 10: -10;
        this.opp = opp;
        this.connection_made = false;
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

        // collision detection
        if (!this.connection_made) {
            var opp = this.opp;
            // console.log('hi');
            if(collideRectRect(this.x, (this.vx < 0 ? this.y - 10: this.y), 10, 2,
                opp.position_x, opp.position_y - opp.height, opp.width, opp.height)) {
                opp.takePiu((this.vx < 0 ? directions.LEFT: directions.RIGHT));
                this.connection_made = true;
                this.em.removeEntity(this);
            }
        }
    }

    draw() {
        fill(color(0));
        rect(this.x, this.y, (this.vx < 0 ? -10: 10), 2);
        

    }
}






