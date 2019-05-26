var game;

function setup() {
    createCanvas(1000, 500);

    var entity1 = new Player('P1',
                100,
                0,
                20,
                30,
                width/2,
                height/2,
                0,
                0,
                'rgb(197,254,0)',
                0);
    var entity2 = new Player('P2',
                100,
                0,
                20,
                30,
                width/2+50,
                height/2,
                0,
                0,
                'rgb(254, 176, 41)',
                1);
    var controller1 = new PlayerOneController(entity1)
    var controller2 = new PlayerTwoController(entity2)
    game = new Game([entity1, entity2], [controller1, controller2]);
    game.setup();
}


function draw() {
    game.draw();

    for (var i = 0; i < animations.length; i++) {
        animations[i].draw();
    }
}


function keyPressed() {
    game.keyPressed();
}

function keyReleased() {
    game.keyReleased();
}



// Util
var animations = [];
class Animation {
    constructor(vals, times) {
        this.vals = vals;
        this.times = times;
        this.time = 0;
        this.done = false;
    }

    get_val() {
        
    }

    draw() {
        if (this.done)
            return;
        this.time += 1;
        if (this.time > this.length) {
            this.vals = this.end_vals;
            this.done = true;
            return;
        }
        for (var i = 0; i < this.vals.length; i++) {
            this.vals[i] = this.start_vals[i] + (this.end_vals[i] - this.start_vals[i]) * (this.time / this.length);
        }
    }
}






