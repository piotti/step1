class Player {
    health = 100;
    mana   = 100;
    jump_vel = -10;
    max_vel = 3;
    constructor(name,
                health,
                mana,
                width,
                height,
                position_x,
                position_y,
                vel_x,
                vel_y,
                color) {

        this.name   = name;
        this.health = health;
        this.mana   = mana;
        
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
    }

    // get name() {
    //     return this.name;
    // }

    // get health() {
    //     return this.health;
    // }

    // get mana() {
    //     return this.mana;
    // }

    // get position_x() {
    //     return this.position_x;
    // }

    // set name(name) {
    //     this.name = name;
    // }

    // set health(health) {
    //     this.health = health;
    // }

    // set mana(mana) {
    //     this.mana = mana;
    // }

    // set position_x(x) {
    //     this.x = x;
    // }

    // get position_y() {
    //     return this.position_y;
    // }

    // set position_y(y) {
    //     this.y = y;
    // }


    // get vel_x() {
    //     return this.vel_x;
    // }

    // get vel_y() {
    //     return this.vel_y;
    // }

    // set vel_x(vel_x) {
    //     this.vel_x = vel_x;
    // }

    // set vel_y(vel_y) {
    //     this.vel_y = vel_y;
    // }

    set_onstage(flag) {
        this.onstage = flag;
    }

    jump() {
        if (this.position_y == platform_y) 
            this.vel_y = this.jump_vel;
    }

    attack() {

    }

    alt_attack() {

    }

    takeAction(action) {
        switch(action) {
            case actions.JUMP:
                jump();
                break;
            case actions.ATTACK:
                attack();
                break;
            case actions.ALT_ATTACK:
                alt_attack();
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
        this.vel_x += this.acc_x;
        this.vel_x = min(this.max_vel, max(-this.max_vel, this.vel_x));
        this.position_x = this.position_x + this.vel_x;
        this.vel_y = this.vel_y + gravity;
        let last_y = this.position_y;
        this.position_y = this.position_y + this.vel_y;

        if (this.position_x < platform_x + platform_length && this.position_x + this.width > platform_x && last_y - this.height < platform_y) {
            this.set_onstage(true); 
            if (this.direction == directions.STOP) {
                this.vel_x += this.vel_x > 0 ? -.5 : 0.5;
                if (abs(this.vel_x) <= 0.5)
                    this.vel_x = 0;
            }
            this.position_y = min(platform_y, this.position_y);
            if (this.position_y == platform_y) {
                this.vel_y = 0;
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

    draw() {
        fill(color(this.color));
        rect(this.position_x, this.position_y - this.height, this.width, this.height);
        fill(color(0,0,0));
        ellipse(this.position_x + (this.face_dir == directions.RIGHT ? this.width-5: 5), this.position_y-this.height+10, 5, 5);
    }
}