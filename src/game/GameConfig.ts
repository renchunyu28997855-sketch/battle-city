// 游戏配置常量
export const GAME_CONFIG = {
  // 玩家配置
  PLAYER_SPEED: 192,
  PLAYER_DEFAULT_HEALTH: 3,
  
  // 子弹配置
  BULLET_SPEED: {
    1: 192,
    2: 256,
    3: 320
  },
  BULLET_COOLDOWN: {
    1: 900,
    2: 700,
    3: 500
  },
  
  // 敌人配置
  MAX_ENEMIES_PER_LEVEL: 20,
  MAX_ON_SCREEN_ENEMIES: 4,
  ENEMY_SPAWN_INTERVAL: 3,
  
  // 地图配置
  TILE_SIZE: 64,
  MAP_WIDTH: 13,
  MAP_HEIGHT: 13,
  CANVAS_SIZE: 832,
  
  // 道具配置
  POWER_UP_DURATION: 15000,      // 15秒
  POWER_UP_FLASH_TIME: 3000,      // 闪烁开始时间（过期前3秒）
  
  // 效果持续时间
  INVINCIBLE_DURATION: 15000,    // 15秒
  CLOCK_DURATION: 10000,         // 10秒
  SHOVEL_DURATION: 20000,        // 20秒
  
  // 敌人无敌时间
  ENEMY_INVINCIBLE_TIME: 4000,   // 4秒
  
  // 爆炸效果
  EXPLOSION_DURATION: 500,       // 毫秒
  
  // 关卡配置
  TOTAL_LEVELS: 40,
  
  // 游戏状态
  STATE: {
    Menu: 0,
    ModeSelect: 1,
    LevelSelect: 2,
    Playing: 3,
    Paused: 4,
    GameOver: 5,
    LevelComplete: 6
  }
} as const;

// 敌人类型
export const ENEMY_TYPES = [
  'armored',   // 装甲车
  'light',     // 轻坦克
  'anti',      // 反坦克炮
  'heavy',     // 重坦克
  'normal'     // 普通坦克
] as const;

// 道具类型
export const POWERUP_TYPES = {
  HELMET: 'helmet',
  STAR: 'star',
  BOMB: 'bomb',
  CLOCK: 'clock',
  SHOVEL: 'shovel',
  TANK: 'tank',
  BOAT: 'boat',
  GUN: 'gun'
} as const;
