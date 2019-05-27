//CONSTS
var player_logic = require('./constants.js').player_logic;
var player_render = require('./constants.js').player_render;
var player_info_render = require('./constants.js').player_info_render;
var game_logic = require('./constants.js').game_logic;


var directions = require('./types.js').directions;
var actions = require('./types.js').actions;
var game = require('./game.js');



class PlayerInfo {
    constructor(player, player_num) {
        this.player = player;
        this.player_num = player_num;
    }

    draw() {
        let x = (this.player_num % 2 == 0) ? 
                 player_info_render.INFO_CONTAINER_LEFT_POS_X:
                 player_info_render.INFO_CONTAINER_RIGHT_POS_X;

        let y = player_info_render.INFO_CONTAINER_POS_Y;
        
        // border
        // noFill();
        fill(player_info_render.INFO_CONTAINER_COLOR);
        rect(x-player_info_render.INFO_BORDER_X_OFFSET,
             y-player_info_render.INFO_BORDER_Y_OFFSET, 
             player_info_render.INFO_BORDER_WIDTH,
             player_info_render.INFO_BORDER_HEIGHT);

        fill(color(this.player.color));
        text(this.player.name, x, y);
        // health bar
        noFill();
        rect(x,
            y + player_info_render.HEALTH_BAR_Y_OFFSET,
            player_info_render.HEALTH_BAR_WIDTH, 
            player_info_render.HEALTH_BAR_HEIGHT);
        fill(player_info_render.HEALTH_BAR_COLOR);
        rect(x+player_info_render.HEALTH_BAR_INNER_X_OFFSET,
             y+player_info_render.HEALTH_BAR_INNER_Y_OFFSET,
             this.player.health,
             player_info_render.HEALTH_BAR_INNER_HEIGHT);

        // mana bar
        noFill();
        rect(x, 
             y+player_info_render.MANA_BAR_Y_OFFSET,
             player_info_render.MANA_BAR_WIDTH,
             player_info_render.MANA_BAR_HEIGHT);
        fill(player_info_render.MANA_BAR_COLOR);
        rect(x+player_info_render.MANA_BAR_INNER_X_OFFSET,
             y+player_info_render.MANA_BAR_INNER_Y_OFFSET,
             this.player.mana,
             player_info_render.HEALTH_BAR_INNER_HEIGHT);

        fill(color(this.player.color));
        text(this.player.getFitness(),
             x+player_info_render.FITNESS_X_OFFSET,
             y);

        
    }
}


class Arm {
    constructor() {
        this.out_dist = player_logic.ARM_REACH; //pixels
        this.out_time = player_logic.ARM_SPEED; //ticks
        this.punching = false;

        this.x = 0;
        this.y = 0;
        this.dir = 0;
        this.extension = 0;
    }

    punch() {
        this.time = 0;
        this.punching = true;
        this.connection_made = false;
    }

    tick(x, y, dir) {
        this.time++;
        if (this.time > this.out_time * 2) {
            this.punching = false;
            return;
        }
        var extension;
        if (this.time < this.out_time) { // moving out
            extension = this.time / this.out_time * this.out_dist;
        } else { // moving in
            extension = (this.out_time * 2 - this.time) / this.out_time * this.out_dist;
        }

        this.extension = extension;
        this.x = x;
        this.y = y;
        this.dir = dir;

        // collision detection
        if (!this.connection_made) {
            var opp = this.opp;
            if(game.collideRectRect(x, y, extension, player_logic.ARM_HEIGHT,
                opp.position_x, opp.position_y - opp.height, opp.width, opp.height)) {
                opp.takePunch(dir);
                this.connection_made = true;
            }
        }
    }

    draw() {
        if(!this.punching)
            return;
        fill(player_render.ARM_COLOR);
        if (this.dir == directions.LEFT)
            this.x -= this.extension;
        rect(this.x, this.y, this.extension, player_logic.ARM_HEIGHT);
    }
}

class Player {
    constructor(name,
                color,
                player_num) {
        this.name   = name;
        this.color = color;
        this.player_num = player_num;

        //condition
        this.health = player_logic.STARTING_HEALTH;
        this.mana   = player_logic.STARTING_MANA;
        
        //position
        this.width        = player_logic.PLAYER_WIDTH;
        this.height       = player_logic.PLAYER_HEIGHT;
        this.position_x   = player_logic.STARTING_POS_X;
        this.position_y   = player_logic.STARTING_POS_Y;
        this.vel_x        = player_logic.STARTING_VEL_X;
        this.vel_y        = player_logic.STARTING_VEL_Y;
        
        //state
        this.onstage = true;
        this.direction = directions.STOP;
        this.lives = player_logic.STARTING_LIVES;
        this.face_dir = (this.player_num % 2 == 0) ? directions.RIGHT : directions.LEFT;
        this.charge_counter = 0;
        this.charging = false;
        this.blocking = false;
        this.knockback_time = 0;
        this.ticks = 0;
        this.dead = false;
        this.ticks_since_last_move = 0;

        //members
        this.arm = new Arm();
    }

    getFitness() {
        let fitness = 0;
        fitness += game_logic.LIFE_DELTA_MULTIPLIER * (this.lives - this.opponent.lives);
        fitness += game_logic.MANA_MULTIPLIER * this.mana;
        fitness += game_logic.HEALTH_MULTIPLIER * this.health;
        fitness -= this.ticks * game_logic.TICK_DISCOUNT;
        return fitness;
    }

    setOpponent(opp) {
        this.opponent = opp;
        this.arm.opp = opp;
        this.info = new PlayerInfo(this, this.player_num);
    }

    reset_mana_counter() {
        this.charging = false;
        this.charge_counter = 0;
    }

    set_onstage(flag) {
        this.onstage = flag;
    }

    block() {
        this.reset_mana_counter();
        this.blocking = true;
    }

    release_block() {
        this.blocking = false;
    }

    jump() {
        if (this.position_y == game.platform_y) 
            this.vel_y = player_logic.JUMP_VEL;
    }

    knockback(direction, damage) {
        switch(direction){
            case directions.LEFT:
                if(this.blocking) {
                    this.vel_x = -player_logic.KNOCKBACK_VEL_X_BLOCK;
                } else {
                    this.take_damage(damage);
                    this.vel_x = -player_logic.KNOCKBACK_VEL_X;
                    this.vel_y = -player_logic.KNOCKBACK_VEL_Y;
                }
                break;
            case directions.RIGHT:
                if(this.blocking) {
                    this.vel_x = player_logic.KNOCKBACK_VEL_X_BLOCK;
                } else {
                    this.take_damage(damage);
                    this.vel_x = player_logic.KNOCKBACK_VEL_X;
                    this.vel_y = -player_logic.KNOCKBACK_VEL_Y;
                }
                break;
        }
        this.knockback_time = player_logic.KNOCKBACK_TICKS;
    }

    takePunch(direction) {
        this.knockback(direction, player_logic.ATTACK_DAMAGE);
    }

    takePiu(direction) {
        this.knockback(direction, player_logic.ALT_ATTACK_DAMAGE);
    }

    take_damage(damage) {
        this.health -= damage;
        if (this.health < 0) {
            this.lives -= 1;
            this.respawn();
        }
    }

    attack() {
        this.arm.punch();
    }

    alt_attack() {
        if (this.mana > player_logic.ALT_ATTACK_COST) {
            // console.log("piu");
            this.mana = Math.max(0, this.mana - player_logic.ALT_ATTACK_COST);
            this.em.addEntity(
                new game.Projectile(this.position_x + (this.face_dir == directions.RIGHT ? this.width: 0),
                                    this.position_y-this.height+10, 
                                    this.face_dir,
                                    this.opponent));
        } 
    }

    charge_mana() {
        this.charging = true;
    }

    add_mana() {
        this.mana = Math.min(this.mana + this.charge_counter / player_logic.TICKS_PER_MANA_CHARGE,
                             player_logic.MAX_MANA);        
        this.reset_mana_counter();
    }

    takeAction(action) {
        switch(action) {
            case actions.JUMP:
                if (!this.blocking && !this.charging) {
                    this.jump();
                    this.reset_mana_counter();
                    this.ticks_since_last_move = 0;
                }
                break;
            case actions.ATTACK:
                if (!this.blocking && !this.charging) {
                    this.attack();
                    this.reset_mana_counter();
                    this.ticks_since_last_move = 0;
                }
                break;
            case actions.ALT_ATTACK:
                if (!this.blocking && !this.charging) {
                    this.alt_attack();
                    this.reset_mana_counter();
                    this.ticks_since_last_move = 0;
                }
                break;
            case actions.CHARGE_MANA:
                if (!this.blocking) {
                    this.charge_mana();
                }
                break;
            case actions.BLOCK:
                if (!this.charging) {
                    this.block();
                } 
                break;
            case actions.MOVE_LEFT:
                if (!this.blocking && !this.charging) {
                    this.takeDirection(directions.LEFT);
                }
                break;
            case actions.MOVE_RIGHT:
                if (!this.blocking && !this.charging) {
                    this.takeDirection(directions.RIGHT);
                }
                break;
        }
    }

    takeDirection(direction) {
        this.direction = direction;
        switch(this.direction){
            case directions.LEFT:
                this.face_dir = directions.LEFT;
                break;
            case directions.RIGHT:
                this.face_dir = directions.RIGHT;
                break;
            case directions.STOP:
                break;
        }

    }

    getCommandedXVel() {
        switch(this.direction){
            case directions.LEFT:
                this.ticks_since_last_move = 0;
                return -player_logic.MAX_X_VEL_COMMANDED;
            case directions.RIGHT:
                this.ticks_since_last_move = 0;
                return player_logic.MAX_X_VEL_COMMANDED;
            case directions.STOP:
                return 0;
        }
    }

    respawn(){
        if (this.lives <= 0) {
            this.dead = true;
        } else {
            this.position_x = player_logic.STARTING_POS_X;
            this.position_y = player_logic.STARTING_POS_Y;
            this.vel_x = player_logic.STARTING_VEL_X;
            this.vel_y = player_logic.STARTING_VEL_Y;
            this.health = player_logic.STARTING_HEALTH;
        }
    }

    updatePosition() {
        this.ticks += 1;
        this.ticks_since_last_move += 1;
        if (this.ticks_since_last_move > player_logic.INACTIVE_KILL_THRESHOLD) {
            this.ticks_since_last_move = 0;
            this.lives -= 1;
            this.respawn();
            return;
        }

        if (this.charging)
            this.charge_counter += 1;

        if (this.knockback_time > 0)
            this.knockback_time--;

        var commaned_xvel = this.getCommandedXVel();
        if (this.knockback_time == 0) {
            this.vel_x = commaned_xvel;
        }

        this.position_x = this.position_x + this.vel_x;
        this.vel_y = this.vel_y + game_logic.GRAVITY;
        let last_y = this.position_y;
        this.position_y = this.position_y + this.vel_y;

        if (this.position_x < game_logic.PLATFORM_STARTING_X + game_logic.PLATFORM_WIDTH &&
            this.position_x + this.width > game_logic.PLATFORM_STARTING_X &&
            last_y - this.height < game_logic.PLATFORM_STARTING_Y) {
            this.set_onstage(true);

            this.position_y = Math.min(game_logic.PLATFORM_STARTING_Y, this.position_y);
            if (this.position_y == game_logic.PLATFORM_STARTING_Y) {
                this.vel_y = 0;
                if (this.direction == directions.STOP) {
                    this.vel_x += this.vel_x > 0 ? -game_logic.FRICTION : game_logic.FRICTION;
                    if (Math.abs(this.vel_x) <= player_logic.MIN_VEL_X)
                        this.vel_x = 0;
                }
            }
        } else {
            this.set_onstage(false);
        }

        if (this.position_y > game_logic.PLATFORM_STARTING_Y && !this.onstage) {
            this.lives -= 1;
            this.respawn();
        }

        this.arm.tick(this.position_x + (this.face_dir == directions.RIGHT ? this.width: 0),
                      this.position_y-this.height+10,
                      this.face_dir);
    }

    setEntityManager(em) {
        this.em = em;
    }

    draw() {
        let c = this.color;
        if (this.charging) {
            c = player_render.CHARGING_COLOR;
        }
        if (this.blocking) {
            c = player_render.BLOCKING_COLOR;
        }
        fill(color(c));
        rect(this.position_x, this.position_y - this.height, this.width, this.height);
        fill(player_render.EYE_COLOR);
        ellipse(this.position_x + (this.face_dir == directions.RIGHT ? this.width-player_render.EYE_OFFSET_X: player_render.EYE_OFFSET_X),
                this.position_y-this.height+player_render.EYE_OFFSET_Y,
                player_render.EYE_RADIUS,
                player_render.EYE_RADIUS);
        
        this.arm.draw();
        this.info.draw();
    }
}

module.exports = {
    Player: Player,
}
