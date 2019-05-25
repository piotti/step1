





var game;

function setup() {
    createCanvas(1000, 500);

    var entity1 = new Player('P1',
                100,
                100,
                20,
                30,
                width/2,
                height/2,
                0,
                0);
    var entity2 = new Player('P2',
                100,
                100,
                20,
                30,
                width/2+50,
                height/2,
                0,
                0);
    var controller1 = new PlayerOneController(entity1)
    var controller2 = new PlayerTwoController(entity2)
    game = new Game([entity1, entity2], [controller1, controller2]);
    game.setup();
}


function draw() {
    game.draw();
}


function keyPressed() {
    game.keyPressed();
}

function keyReleased() {
    game.keyReleased();
}