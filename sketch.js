var game_logic = require('./constants.js').game_logic;
var game_obj;

var run_gens = false;
function setup() {
    var canvas = createCanvas(game_logic.WIDTH, game_logic.HEIGHT);
    canvas.parent('p5canvas');

    game_obj = startEvaluation(0);

    // var entity1 = new Player('P1',
    //             60,
    //             20,
    //             20,
    //             30,
    //             width/2,
    //             height/2,
    //             0,
    //             0,
    //             'rgb(197,254,0)',
    //             0);
    // var entity2 = new Player('P2',
    //             60,
    //             20,
    //             20,
    //             30,
    //             width/2+50,
    //             height/2,
    //             0,
    //             0,
    //             'rgb(254, 176, 41)',
    //             1);
    // entity1.setOpponent(entity2);
    // entity2.setOpponent(entity1);
    // var controller1 = new PlayerOneController(entity1)
    // var controller2 = new PlayerTwoController(entity2)
    // game_obj = new Game([entity1, entity2], [controller1, controller2]);
    // game_obj.setup();
    // game_obj.start();
}

var ticks = 0;
function draw() {
    game_obj.tick();
    game_obj.draw();
}

// setup();

function startGens() {
    run_gens = true;
}

function stopGens() {
    run_gens = false;
}

function keyPressed() {
    game_obj.keyPressed();
}

function keyReleased() {
    game_obj.keyReleased();
}