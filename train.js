var player = require('./player.js');
console.log(player.Player);

var neat = require('./neural.js');
console.log(neat.setScores);

// var Game = require('./game.js').Game;



var game = neat.startEvaluation(0);

while(true) {
    game.tick();
}
