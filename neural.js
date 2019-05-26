

class NNController extends Controller {
    constructor(entity, opp, genome) {
        super(entity);
        this.opp = opp;
        this.genome = genome;
        this.keys = [false, false, false, false, false, false, false];
        this.start_moves = [this.move_left, this.move_right, this.jump, this.attack, this.alt_attack, this.block, this.charge_mana];
        this.stop_moves = [this.stop, this.stop, function(){}, function(){}, function(){}, this.release_block, this.add_mana];
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
            int(this.opp.blocking),
            int(this.opp.charging),
            (this.entity.position_x+this.entity.width-platform_x)/width,
            (platform_x+platform_length - this.entity.position_x)/width,            
            int(this.entity.face_dir == directions.RIGHT),
            int(this.entity.face_dir == directions.LEFT),
            int(this.opp.face_dir == directions.RIGHT),
            int(this.opp.face_dir == directions.LEFT),
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
                    this.start_moves[i](this.entity);
                else
                    this.stop_moves[i](this.entity);
            }
        }


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
    12,
    7,
    getFitness,
    {
      popsize: PLAYER_AMOUNT,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * PLAYER_AMOUNT),
      fitnessPopulation:false,
    }
  );

}

initNeat();

/** Start the evaluation of the current generation */
function startEvaluation(i){
  console.log(neat.population);
  // for (var i = 0; i < 25; i++) {
    // let i = 0;
    let i_0 = i * 2;
    let i_1 = i_0 + 1;
    let g0 = neat.population[i_0];
    let g1 = neat.population[i_1];
    let p0 = new Player('P' + i_0,
                100,
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
                100,
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
    game = new Game([p0, p1], [c0, c1]);
    c0.game = game;
    c1.game = game;
    game.nn_controllers = [c0, c1];

    game.start(setScores, i_0, i_1);
  }
  // endEvaluation();
// }

    // drawGraph(g0.graph(500, 500), '.draw');

function setScores(i, j, score_i, score_j) {
    neat.population[i].score = score_i;
    neat.population[j].score = score_j;

    console.log("scored" + i + ": " + score_i );
    console.log("scored" + j + ": " + score_j);

    if (i/2<24) {
        startEvaluation(i/2+1);
    } else {
        endEvaluation();
    }
}

/** End the evaluation of the current generation */
function endEvaluation(){
  // console.log('Generation:', neat.generation, '- average score:', neat.getAverage());

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

  console.log(neat.population);

  neat.generation++;
  startEvaluation(0);
}