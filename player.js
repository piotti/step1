var width = 1000;
var height = 500;

var directions = require('./types.js');
var game = require('./game.js');
var collideRectRect = function(ax, ay, aw, ah, bx, by, bw, bh) {
    let ax2 = ax + aw;
    let ay2 = ay + ah;
    let bx2 = bx + bw;
    let by2 = by + bh;

    return ax < bx2 && ax2 > bx && ay < by2 && ay2 > by;

}


class PlayerInfo {
    constructor(player, player_num) {
        this.player = player;
        this.player_num = player_num;
    }

    draw() {
        let x = width/2 + (this.player_num * 2 - 1 ) * 150 - 50;
        let y = height-60;
        // border
        // noFill();
        fill(color(220,220,220));
        rect(x-10, y-15, 125, 60);

        fill(color(this.player.color));
        text(this.player.name, x, y);
        // health bar
        noFill();
        rect(x, y+10, 104, 10);
        fill(color(200, 100, 100));
        rect(x+2, y+12, this.player.health, 6);

        // mana bar
        noFill();
        rect(x, y+25, 104, 10);
        fill(color(100, 100, 200));
        rect(x+2, y+27, this.player.mana, 6);

        fill(color(0));
        text(this.player.getFitness(), x+50, y);

        
    }
}


class Arm {
    constructor() {
        this.out_dist = 20; //pixels
        this.out_time = 5; //ticks
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
            // console.log('hi');
            if(collideRectRect(x, y, extension, 5,
                opp.position_x, opp.position_y - opp.height, opp.width, opp.height)) {
            // console.log('hey');
                opp.takePunch(dir);
                this.connection_made = true;
            }
        }
    }

    draw() {
        fill(color(0))
        if (dir == directions.LEFT)
            x -= extension;
        rect(x, y, extension, 5)
    }
}


class Player {
    

    constructor(name,
                health,
                mana,
                width,
                height,
                position_x,
                position_y,
                vel_x,
                vel_y,
                color,
                player_num) {

        this.jump_vel = -10;
        this.max_vel = 3;
        this.attack_damage = 12;
        this.alt_attack_damage = 6;

        this.name   = name;
        this.health = health;
        this.mana   = mana;
        this.player_num = player_num;
        this.width        = width;
        this.height       = height;
        this.position_x   = position_x;
        this.position_y   = position_y;
        this.vel_x        = vel_x;
        this.vel_y        = vel_y;
        this.acc_x = 0;

        this.color = color;

        this.onstage = true;
        this.direction = directions.STOP;
        this.lives = 3;

        this.face_dir = directions.RIGHT;


        this.charge_counter = 0;
        this.charging = false;

        this.arm = new Arm();

        this.blocking = false;

        this.knockback_time = 0;
        this.ticks = 0;

        this.dead = false;

        this.ticks_since_last_move = 0;
    }


    getFitness() {
        let fitness = 0;
        fitness += 1000 * (this.lives - this.opponent.lives);
        fitness += 20 * this.mana;
        fitness += 50 * this.health;
        fitness -= this.ticks * 0.1;
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
            this.vel_y = this.jump_vel;
    }

    knockback(direction, damage) {
        switch(direction){
            case directions.LEFT:
                if(this.blocking) {
                    this.vel_x = -8;
                    // this.vel_y -= 8;
                } else {
                    this.take_damage(damage);
                    this.vel_x = -5;
                    this.vel_y = -5;
                }
                
                break;
            case directions.RIGHT:
                if(this.blocking) {
                    this.vel_x = 8;
                    // this.vel_y += 8;
                } else {
                    this.take_damage(damage);
                    this.vel_x = 5;
                    this.vel_y = -5;
                }
                break;
        }
        this.knockback_time = 20;
    }

    takePunch(direction) {
        this.knockback(direction, this.attack_damage);
    }

    takePiu(direction) {
        this.knockback(direction, this.alt_attack_damage);
    }

    take_damage(damage) {
        
        this.health -= damage;
        if (this.health < 0) {
            this.lives -= 1;
            this.respawn();
        }
    }

    attack() {
        // console.log("atak");
        switch(this.face_dir) {
            case directions.LEFT:
                //calculate hit
                break;
            case directions.RIGHT:
                //calculate hit
                break;
        }
        this.arm.punch();

    }

    alt_attack() {
        if (this.mana > 10) {
            // console.log("piu");
            this.mana -= 10;
            this.em.addEntity(new Projectile(this.position_x + (this.face_dir == directions.RIGHT ? this.width: 0), this.position_y-this.height+10, this.face_dir, this.opponent));
            switch(this.face_dir) {
                case directions.LEFT:
                    //calculate hit
                    break;
                case directions.RIGHT:
                    //calculate hit
                    break;
            }
        } 
    }

    charge_mana() {
        // console.log("AAAAAA");
        // start tick counter
        this.charging = true;
    }

    add_mana() {
        if (this.charge_counter > 5)
            this.mana += this.charge_counter / 5;    
            this.mana = min(this.mana, 100);        
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
                // this.acc_x = -1;
                break;
            case directions.RIGHT:
                this.face_dir = directions.RIGHT;
                // this.acc_x = 1;
                break;
            case directions.STOP:
                // this.acc_x = 0;
                break;
                // do nothing
        }

    }

    getCommandedXVel() {
        switch(this.direction){
            case directions.LEFT:
                this.ticks_since_last_move = 0;
                return -this.max_vel;
            case directions.RIGHT:
                this.ticks_since_last_move = 0;
                return this.max_vel;
            case directions.STOP:
                return 0;
        }
    }

    respawn(){
        console.log("respawning")
        if (this.lives <= 0) {
            console.log("ive died");
            this.dead = true;
        } else {
            this.position_x = width/2;
            this.position_y = height/2;
            this.vel_x = 0;
            this.vel_y = 0;
            this.health = 60;
        }
    }

    updatePosition() {
        this.ticks += 1;
        //charge counting
        this.ticks_since_last_move += 1;
        if (this.ticks_since_last_move > 200) {
            this.ticks_since_last_move = 0;
            console.log("too many ticks since last move, die");
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
        this.vel_y = this.vel_y + game.gravity;
        let last_y = this.position_y;
        this.position_y = this.position_y + this.vel_y;

        if (this.position_x < game.platform_x + game.platform_length && this.position_x + this.width > game.platform_x && last_y - this.height < game.platform_y) {
            this.set_onstage(true);

            this.position_y = min(game.platform_y, this.position_y);
            if (this.position_y == game.platform_y) {
                this.vel_y = 0;
                if (this.direction == directions.STOP) {
                    this.vel_x += this.vel_x > 0 ? -.5 : 0.5;
                    if (abs(this.vel_x) <= 0.5)
                        this.vel_x = 0;
                }
            }
        } else {
            this.set_onstage(false);
        }

        if (this.position_y > game.platform_y && !this.onstage) {
            this.lives -= 1;

            this.respawn();
        }

        this.arm.tick(this.position_x + (this.face_dir == directions.RIGHT ? this.width: 0), this.position_y-this.height+10, this.face_dir);

    }

    setEntityManager(em) {
        this.em = em;
    }

    draw() {
        let c = this.color;
        if (this.charging) {
            c = 'rgb(1, 254, 254)'
        }
        if (this.blocking) {
            c = 'rgb(116, 48, 218)'
        }
        fill(color(c));
        rect(this.position_x, this.position_y - this.height, this.width, this.height);
        fill(color(0,0,0));
        ellipse(this.position_x + (this.face_dir == directions.RIGHT ? this.width-5: 5), this.position_y-this.height+10, 5, 5);
        
        this.arm.draw();

        this.info.draw();
    }
}



module.exports = {
    Player: Player,
}

