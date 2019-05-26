


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
    }
}


class Arm {
    constructor() {
        this.out_dist = 20; //pixels
        this.out_time = 5; //ticks
        this.punching = false;
    }

    punch() {
        this.time = 0;
        this.punching = true;
        this.connection_made = false;
    }

    draw(x, y, dir) {
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
        fill(color(0))
        if (dir == directions.LEFT)
            x -= extension;
        rect(x, y, extension, 5)

        // collision detection
        if (!this.connection_made) {
            var opp = this.opp;
            // console.log('hi');
            if(collideRectRect(x, y, extension, 5,
                opp.position_x, opp.position_y - opp.height, opp.width, opp.height)) {
            console.log('hey');
                opp.takePunch(dir);
                this.connection_made = true;
            }
        }
    }
}


class Player {
    health = 100;
    mana   = 0;
    jump_vel = -10;
    max_vel = 3;
    attack_damage = 4;
    alt_attack_damage = 2;

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
        this.info = new PlayerInfo(this, player_num);


        this.charge_counter = 0;
        this.charging = false;

        this.arm = new Arm();
    }


    setOpponent(opp) {
        this.opponent = opp;
        this.arm.opp = opp;
    }

    reset_mana_counter() {
        this.charging = false;
        this.charge_counter = 0;
    }

    set_onstage(flag) {
        this.onstage = flag;
    }

    jump() {
        if (this.position_y == platform_y) 
            this.vel_y = this.jump_vel;
    }

    knockback(direction, damage) {
        switch(direction){
            case directions.LEFT:
                this.take_damage(damage);
                this.vel_x -= 5;
                this.vel_y = -5;
                break;
            case directions.RIGHT:
                this.take_damage(damage);
                this.vel_x += 5;
                this.vel_y = -5;
                break;
        }
    }

    takePunch(direction) {
        this.knockback(direction, this.attack_damage);
    }

    takePiu(direction) {
        this.knockback(direction, this.alt_attack_damage);
    }

    take_damage(damage) {
        console.log(this.health);
        this.health -= damage;
    }

    attack() {
        console.log("atak");
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
            console.log("piu");
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
        console.log("AAAAAA");
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
                jump();
                this.reset_mana_counter();
                break;
            case actions.ATTACK:
                attack();
                this.reset_mana_counter();
                break;
            case actions.ALT_ATTACK:
                alt_attack();
                this.reset_mana_counter();
                break;
            case actions.CHARGE_MANA:
                charge_mana();
                break;
        }
    }

    takeDirection(direction) {
        this.direction = direction;
        switch(this.direction){
            case directions.LEFT:
                this.face_dir = directions.LEFT;
                this.acc_x = -1;
                break;
            case directions.RIGHT:
                this.face_dir = directions.RIGHT;
                this.acc_x = 1;
                break;
            case directions.STOP:
                this.acc_x = 0;
                break;
                // do nothing
        }

    }

    updatePosition() {
        //charge counting
        if (this.charging)
            this.charge_counter += 1;


        // this.vel_x += this.acc_x;
        if (this.vel_x * this.acc_x > 0) {
            if (abs(this.vel_x) < this.max_vel) {
                this.vel_x += this.acc_x;
            }
        } else {
            this.vel_x += this.acc_x;
        }
        // this.vel_x = min(this.max_vel, max(-this.max_vel, this.vel_x));
        this.position_x = this.position_x + this.vel_x;
        this.vel_y = this.vel_y + gravity;
        let last_y = this.position_y;
        this.position_y = this.position_y + this.vel_y;

        if (this.position_x < platform_x + platform_length && this.position_x + this.width > platform_x && last_y - this.height < platform_y) {
            this.set_onstage(true);

            this.position_y = min(platform_y, this.position_y);
            if (this.position_y == platform_y) {
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

        if (this.position_y > platform_y && !this.onstage) {
            this.lives -= 1;
            if (this.lives <= 0) {
                console.log("ive died");
            } else {
                this.position_x = width/2;
                this.position_y = height/2;
                this.vel_x = 0;
                this.vel_y = 0;
            }
        }
    }

    setEntityManager(em) {
        this.em = em;
    }

    draw() {
        let c = this.color;
        if (this.charging) {
            c = 'rgb(1, 254, 254)'
        }
        fill(color(c));
        rect(this.position_x, this.position_y - this.height, this.width, this.height);
        fill(color(0,0,0));
        ellipse(this.position_x + (this.face_dir == directions.RIGHT ? this.width-5: 5), this.position_y-this.height+10, 5, 5);
        

        this.arm.draw(this.position_x + (this.face_dir == directions.RIGHT ? this.width: 0), this.position_y-this.height+10, this.face_dir);

        this.info.draw();
    }
}