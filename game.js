

class Controller {
    constructor(entity) {
        this.entity = entity;

        this.left_arrow = false;
        this.right_arrow = false;
    }

<<<<<<< HEAD
    figure_direction(entity) {
        if(this.left_arrow && !this.right_arrow)
            entity.takeAction(directions.LEFT);
        else if (this.right_arrow && !this.left_arrow)
            entity.takeAction(directions.RIGHT);
        else
            entity.takeDirection(directions.STOP);

    }

    default(){}

    move_left() {
        this.left_arrow = true;
        this.figure_direction(this.entity);    

    }

    move_right() {
        this.right_arrow = true;
        this.figure_direction(this.entity);    
    }
    stop_left() {
        this.left_arrow = false;
        this.figure_direction(this.entity);    
    }

    stop_right() {
        this.right_arrow = false;
        this.figure_direction(this.entity);    
    }

    stop() {
        this.entity.takeDirection(directions.STOP);     
    }

    jump() {
        this.entity.takeAction(actions.JUMP);
    }

    charge_mana() {
        this.entity.takeAction(actions.CHARGE_MANA);
    }

    attack() {
        this.entity.takeAction(actions.ATTACK);
    }

    alt_attack() {
        this.entity.takeAction(actions.ALT_ATTACK);
    }

    add_mana() {
        this.entity.add_mana();
    }
    
    block() {
        this.entity.takeAction(actions.BLOCK);
    }

    release_block() {
        this.entity.release_block();
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
        if(keyCode == this.block_key) {
            this.block();
        }
    }

    keyReleased() {
        if(keyCode == this.left_key) {
            this.stop_left();
        }
        if(keyCode == this.right_key) {
            this.stop_right();
        }
        if(keyCode == this.down_key) {
            this.add_mana();
        }
        if(keyCode == this.block_key) {
            this.release_block();
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






