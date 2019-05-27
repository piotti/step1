
// PLAYER LOGIC
const player_logic =  {
    MAX_X_VEL_COMMANDED: 3,
    MAX_X_VEL: 8,
    JUMP_VEL: -10,
    ATTACK_DAMAGE: 12,
    ALT_ATTACK_DAMAGE: 6,
    ALT_ATTACK_COST: 10,
    MAX_HEALTH: 60,
    STARTING_HEALTH: 60,
    MAX_MANA: 100,
    STARTING_MANA: 20,
    TICKS_PER_MANA_CHARGE: 5,
    STARTING_LIVES: 3,
    PLAYER_WIDTH: 20,
    PLAYER_HEIGHT: 30,
    STARTING_POS_X: game_logic.WIDTH/2,
    STARTING_POS_Y: game_logic.HEIGHT/2,
    STARTING_VEL_X: 0,
    STARTING_VEL_Y: 0,
    KNOCKBACK_VEL_X: 5,
    KNOCKBACK_VEL_Y: 5,
    KNOCKBACK_VEL_X_BLOCK: 8,
    KNOCKBACK_TICKS: 20,
    INACTIVE_KILL_THRESHOLD: 200,
    MIN_VEL_X: 0.5,
    ARM_REACH: 20,
    ARM_SPEED: 5,
    ARM_HEIGHT: 5,
    PROJECTILE_VEL_X: 10,
    PROJECTILE_WIDTH: 10,
    PROJECTILE_HEIGHT: 2,
}

// PLAYER RENDER
const player_render = {
    COLOR: color(197,254,0),
    ALT_COLOR: color(254, 176, 41),
    CHARGING_COLOR: color(1,254,254),
    BLOCKING_COLOR: color(116,48,218),
    EYE_COLOR: color(0,0,0),
    EYE_OFFSET_X: 5,
    EYE_OFFSET_Y: 10,
    EYE_RADIUS: 5,
    ARM_COLOR: color(0,0,0),
    PROJECTILE_COLOR: color(0,0,0),
}

//PLAYER INFO RENDER
const player_info_render = {
    INFO_CONTAINER_COLOR: color(220, 220, 220),
    INFO_CONTAINER_LEFT_POS_X: game_logic.WIDTH/2 - 200,
    INFO_CONTAINER_RIGHT_POS_X: game_logic.WIDTH/2 + 100,
    INFO_CONTAINER_POS_Y: game_logic.WIDTH/2 + 100,
    INFO_BORDER_X_OFFSET: 10,
    INFO_BORDER_Y_OFFSET: 15,
    INFO_BORDER_WIDTH: 125,
    INFO_BORDER_HEIGHT: 60,
    HEALTH_BAR_Y_OFFSET: 10,
    HEALTH_BAR_WIDTH: player_logic.MAX_HEALTH+4,
    HEALTH_BAR_HEIGHT: 10,
    HEALTH_BAR_COLOR: color(200,100,100),
    HEALTH_BAR_INNER_X_OFFSET: 2,
    HEALTH_BAR_INNER_Y_OFFSET: 12,
    HEALTH_BAR_INNER_HEIGHT: 6,
    MANA_BAR_COLOR: color(100,100,200),
    MANA_BAR_Y_OFFSET: 25,
    MANA_BAR_WIDTH: game_logic.MAX_MANA + 4,
    MANA_BAR_HEIGHT: 10,
    MANA_BAR_INNER_X_OFFSET: 2,
    MANA_BAR_INNER_Y_OFFSET: 27,
    MANA_BAR_INNER_HEIGHT: 6,
    FITNESS_X_OFFSET: 50,
}

// GAME LOGIC
const game_logic = {
    WIDTH: 1000,
    HEIGHT: 500,
    GRAVITY: 0.5,
    PLATFORM_WIDTH: 600,
    PLATFORM_HEIGHT: 10,
    PLATFORM_STARTING_X: game_logic.WIDTH/2 - game_logic.PLATFORM_WIDTH/2,
    PLATFORM_STARTING_Y: game_logic.HEIGHT - 100,
    FRICTION: 0.5,
    LIFE_DELTA_MULTIPLIER: 1000,
    MANA_MULTIPLIER: 20,
    HEALTH_MULTIPLIER: 50,
    TICK_DISCOUNT: 0.1,
}

// GAME RENDER
const game_render = {
    BACKGROUND_COLOR: color(200,200,200),
}



module.exports = {
    player_logic: player_logic,
    player_render: player_render,
    player_info_render: player_info_render,
    game_logic: game_logic,
    game_render: game_render,
}
