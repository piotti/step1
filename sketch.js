





var game;

function setup() {
    createCanvas(1000, 500);

    var entity = new Player('P1',
                100,
                100,
                20,
                30,
                width/2,
                height/2,
                0,
                0);
    var controller = new PlayerOneController(entity)
    game = new Game([entity], [controller]);
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