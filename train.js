var player = require('./player.js');
console.log(player.Player);

var neat = require('./neural.js');
console.log(neat.setScores);

// var Game = require('./game.js').Game;




neat.startEvaluation(0);

var game_obj = neat.game_obj;

// console.log(game);

while(true) {
    game_obj.game.tick();
}
