var game_logic = require('./constants.js').game_logic;
var game_render = require('./constants.js').game_render;
var player_logic = require('./constants.js').player_logic;
var player_render = require('./constants.js').player_render;

var types = require('./types.js');
var directions = types.directions;
var actions = types.actions;


class Controller {
    constructor(entity) {
        this.entity = entity;

        this.left_arrow = false;
        this.right_arrow = false;
    }

    figure_direction(entity) {
        if(this.left_arrow && !this.right_arrow)
            entity.takeAction(actions.MOVE_LEFT);
        else if (this.right_arrow && !this.left_arrow)
            entity.takeAction(actions.MOVE_RIGHT);
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

class Game {
    constructor(entities, controllers) {
        this.entities = entities;
        this.controllers = controllers;
        this.em = new EntityManager();
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].setEntityManager(this.em);
        }
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
        background(game_render.BACKGROUND_COLOR);
    }

    finishGame() {
        if(!this.started)
            return;
        this.started = false;
        this.scores_callback(this.i, this.j, this.entities[0].getFitness(), this.entities[1].getFitness());
    }

    tick() {
        if(!this.started)
            return;
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].updatePosition();
            if (this.entities[i].dead) {
                this.finishGame();
            }
        }  
        
        this.em.updatePosition();

        for (var i = 0; i < this.nn_controllers.length; i++) {
            this.nn_controllers[i].update();
        }
    }

    draw() {
        if(!this.started)
            return;
        background(game_render.BACKGROUND_COLOR);
        fill(color('gray'))
        rect(game_logic.PLATFORM_STARTING_X,
             game_logic.PLATFORM_STARTING_Y,
             game_logic.PLATFORM_WIDTH,
             game_logic.PLATFORM_HEIGHT);
        for (var i = 0; i < this.entities.length; i++) {
            if (!this.entities[i].dead) {
                this.entities[i].draw();
            }
        }  
        this.em.draw();

        for (var i = 0; i < this.nn_controllers.length; i++) {
            this.nn_controllers[i].draw();
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
        this.vx = dir == directions.RIGHT ? player_logic.PROJECTILE_VEL_X: -player_logic.PROJECTILE_VEL_X;
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
            if(collideRectRect(this.x, 
                (this.vx < 0 ? this.y - player_logic.PROJECTILE_WIDTH: this.y),
                player_logic.PROJECTILE_WIDTH,
                player_logic.PROJECTILE_HEIGHT,
                opp.position_x, opp.position_y - opp.height, opp.width, opp.height)) {
                opp.takePiu((this.vx < 0 ? directions.LEFT: directions.RIGHT));
                this.connection_made = true;
                this.em.removeEntity(this);
            }
        }
    }

    draw() {
        fill(player_render.PROJECTILE_COLOR);
        rect(this.x, this.y, (this.vx < 0 ? -player_logic.PROJECTILE_WIDTH: player_logic.PROJECTILE_WIDTH), player_logic.PROJECTILE_HEIGHT);
    }
}


var collideRectRect = function(ax, ay, aw, ah, bx, by, bw, bh) {
    let ax2 = ax + aw;
    let ay2 = ay + ah;
    let bx2 = bx + bw;
    let by2 = by + bh;

    return ax < bx2 && ax2 > bx && ay < by2 && ay2 > by;
}


var game = {
    Controller: Controller,
    Game: Game,
    EntityManager: EntityManager,
    Projectile: Projectile,
    collideRectRect: collideRectRect,
}

module.exports = game;

// module.exports = {
//     Controller: Controller,
//     Game: Game,
//     EntityManager: EntityManager,
//     Projectile: Projectile,
//     gravity: gravity,
//     game.platform_y: game.platform_y,
//     platform_x: platform_x,
//     platform_length: platform_length,
// }
