var game;

function setup() {
    var canvas = createCanvas(1000, 500);
    canvas.parent('p5canvas');

    startEvaluation();

    // var entity1 = new Player('P1',
    //             100,
    //             100,
    //             20,
    //             30,
    //             width/2,
    //             height/2,
    //             0,
    //             0,
    //             'rgb(197,254,0)',
    //             0);
    // var entity2 = new Player('P2',
    //             100,
    //             0,
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
    // game = new Game([entity1, entity2], [controller1, controller2]);
    // game.setup();
    // game.start();
}

var ticks = 0;
function draw() {
    game.draw();
}


function keyPressed() {
    game.keyPressed();
}

function keyReleased() {
    game.keyReleased();
}





