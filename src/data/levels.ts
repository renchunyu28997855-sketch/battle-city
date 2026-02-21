export interface MapConfig {
    width: number;
    height: number;
    tile_size: number;
}

export interface TileData {
    x: number;
    y: number;
    type: number;
}

export interface EnemyTypes {
    armor: number;
    light: number;
    medium: number;
    heavy: number;
}

export interface EnemyConfig {
    total_count: number;
    max_on_screen: number;
    spawn_interval: number;
    types: EnemyTypes;
}

export interface PlayerConfig {
    initial_lives: number;
    initial_level: number;
    respawn_invincible_time: number;
}

export interface ItemConfig {
    spawn_probability: number;
    allowed_items: string[];
}

export interface ClearReward {
    score_bonus: number;
    extra_life: boolean;
}

export interface LevelData {
    level_id: number;
    level_name: string;
    difficulty: number;
    map_config: MapConfig;
    map_tiles?: TileData[];
    enemy_config: EnemyConfig;
    player_config: PlayerConfig;
    item_config: ItemConfig;
    special_rules: string[];
    clear_reward: ClearReward;
}
