
var Controller = require('./game.js').Controller;
var Player = require('./player.js').Player;
var neataptic = require('neataptic');
var game = require('./game.js');
var directions = require('./types.js').directions;

var setNewGame = require('./train.js').setNewGame;
console.log(setNewGame);

var player_logic = require('./constants.js').player_logic;
var game_logic = require('./constants.js').game_logic;

var width = 1000;
var height = 500;


var game_obj = {
    game: null,
}

class NNController extends Controller {
    constructor(entity, opp, genome) {
        super(entity);
        this.opp = opp;
        this.genome = genome;
        this.keys = [false, false, false, false, false, false, false];
        this.start_moves = ['move_left', 'move_right', 'jump', 'attack', 'alt_attack', 'block', 'charge_mana'];
        this.stop_moves = ['stop_left', 'stop_right', 'default', 'default', 'default', 'release_block', 'add_mana'];
    }

    draw() {
        // draw fields
        function setColor(on) {
            fill(color(on ? 'red': 'black'));
        }
        let fields = ['L', 'R', 'J', 'A', 'Alt', 'B', 'C'];
        for (var i = 0; i < fields.length; i++) {
            setColor(this.keys[i]);
            text(fields[i], 20+50*this.entity.player_num, 20+i*20);
        }
    }

    export_inputs_json() {
      // 25 inputs
      let current_input = {
          my_pos_x: this.entity.position_x / game_logic.WIDTH,
          my_pos_y: this.entity.position_y / game_logic.HEIGTH,
          my_vel_x: this.entity.vel_x / player_logic.MAX_X_VEL,
          my_vel_y: this.entity.vel_y / player_logic.MAX_Y_VEL,
          opp_pos_x: this.opp.position_x / game_logic.WIDTH,
          opp_pos_y: this.opp.position_y / game_logic.HEIGHT,
          opp_vel_x: this.opp.vel_x / player_logic.MAX_X_VEL,
          opp_vel_y: this.opp.vel_y / player_logic.MAX_Y_VEL,
          my_blocking: Number(this.entity.blocking),
          opp_blocking: Number(this.opp.blocking),
          my_charging: Number(this.entity.charging),
          opp_charging: Number(this.opp.charging),
          left_edge: (this.entity.position_x+this.entity.width-game_logic.PLATFORM_STARTING_X)/game_logic.WIDTH,
          right_edge: (game_logic.PLATFORM_STARTING_X+game_logic.PLATFORM_WIDTH-this.entity.position_x)/game_logic.WIDTH,            
          my_facing_right: Number(this.entity.face_dir == directions.RIGHT),
          my_facing_left: Number(this.entity.face_dir == directions.LEFT),
          opp_facing_right: Number(this.opp.face_dir == directions.RIGHT),
          opp_facing_left: Number(this.opp.face_dir == directions.LEFT),
          my_health: this.entity.health/player_logic.MAX_HEALTH,
          my_mana: this.entity.mana/player_logic.MAX_MANA,
          my_lives: this.entity.lives/player_logic.STARTING_LIVES,
          opp_health: this.opp.health/player_logic.MAX_HEALTH,
          opp_mana: this.opp.mana/player_logic.MAX_MANA,
          opp_lives: this.opp.lives/player_logic.STARTING_LIVES,
      }
      let outgoing = JSON.stringify(current_input);
      // change this to post to python server hosting brain
      return outgoing;
    }

    consume_output_json(output_json) {
      // change to consume json from python server hosting brain
      let output_obj = JSON.parse(output_json);
      return output_obj;
    }

    update() {
        // console.log(this.entity);
        let input = [
            this.entity.position_x/width,
            this.entity.position_y/height,
            this.entity.vel_x / 8.0,
            this.entity.vel_y / 8.0,
            this.opp.position_x/width,
            this.opp.position_y/height,
            this.opp.vel_x / 8.0,
            this.opp.vel_y / 8.0,
            Number(this.opp.blocking),
            Number(this.opp.charging),
            (this.entity.position_x+this.entity.width-game.platform_x)/width,
            (game.platform_x+game.platform_length - this.entity.position_x)/width,            
            Number(this.entity.face_dir == directions.RIGHT),
            Number(this.entity.face_dir == directions.LEFT),
            Number(this.opp.face_dir == directions.RIGHT),
            Number(this.opp.face_dir == directions.LEFT),
            this.entity.health/100,
            this.entity.mana/100,
            this.entity.lives/3,
            this.opp.health/100,
            this.opp.mana/100,
            this.opp.lives/3,
        ];
        let output = this.genome.activate(input);
        let bools = [];
        for (var i = 0; i < output.length; i++) {
            bools[i] = output[i] >= 0.5;
        }
        for (var i = 0; i < bools.length; i++) {
            if(bools[i] != this.keys[i]) {
                this.keys[i] = bools[i];
                if (bools[i])
                    this[this.start_moves[i]]();
                else
                    this[this.stop_moves[i]]();
            }
        }
    }
}

const PLAYER_AMOUNT = 50;
const ELITISM_PERCENT = 0.1;
const MUTATION_RATE = 0.3;

/*
INPUTS:
1. posx
2. posy
3. velx
4. vely
5. opp posx
6. opp posy
7. opp velx
8. opp vely
9. opp blocking
10. opp charging
11. distance to stage left
12. ditance stage right
13. face right
14. face left
15. opp face right
16. opp face left
17. health
18. manna
19. lives
19. opp health
20. health manna
21. lives



OUTPUTS:
1. left
2. right
3. jump
4. attack
5. alt
6. block
7. charge

*/

var neat;

function getFitness(genome) {
    return genome.score;
}

function initNeat(){
  neat = new neataptic.Neat(
    21,
    7,
    getFitness,
    {
      popsize: PLAYER_AMOUNT,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * PLAYER_AMOUNT),
      network: new neataptic.architect.Random(21, 8, 7),
      // fitnessPopulation:false,
    }
  );

}

initNeat();

/** Start the evaluation of the current generation */
function startEvaluation(i){
  // console.log(neat.population);
  // for (var i = 0; i < 25; i++) {
    // let i = 0;
    let i_0 = i * 2;
    let i_1 = i_0 + 1;
    let g0 = neat.population[i_0];
    let g1 = neat.population[i_1];
    let p0 = new Player('P' + i_0,
                60,
                20,
                20,
                30,
                width/2,
                height/2,
                0,
                0,
                'rgb(197,254,0)',
                0);
    let p1 = new Player('P' + i_1,
                60,
                20,
                20,
                30,
                width/2+50,
                height/2,
                0,
                0,
                'rgb(254, 176, 41)',
                1);
    p0.setOpponent(p1);
    p1.setOpponent(p0);
    let c0 = new NNController(p0, p1, g0);
    let c1 = new NNController(p1, p0, g1);
    let gm = new game.Game([p0, p1], [c0, c1]);
    c0.game = gm;
    c1.game = gm;
    gm.nn_controllers = [c0, c1];

    gm.start(setScores, i_0, i_1);

    game_obj.game = gm;

  }
  // endEvaluation();
// }

    // drawGraph(g0.graph(500, 500), '.draw');

function setScores(i, j, score_i, score_j) {
    neat.population[i].score = score_i;
    neat.population[j].score = score_j;

    // console.log("scored" + i + ": " + score_i );
    // console.log("scored" + j + ": " + score_j);

    if (i/2<24) {
        startEvaluation(i/2+1);
    } else {
        endEvaluation();
    }
}

/** End the evaluation of the current generation */
function endEvaluation(){
  console.log('Generation:', neat.generation, '- average score:', neat.getAverage());

  neat.sort();
  var newPopulation = [];

  // Elitism
  for(var i = 0; i < neat.elitism; i++){
    newPopulation.push(neat.population[i]);
  }

  // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring());
  }

  // Replace the old population with the new population
  neat.population = newPopulation;
  neat.mutate();

  // console.log(neat.population);

  neat.generation++;
  startEvaluation(0);
}

module.exports = {
    setScores: setScores,
    startEvaluation: startEvaluation,
    game_obj: game_obj, 
}

