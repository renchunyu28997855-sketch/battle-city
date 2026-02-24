/**
 * 子弹威力配置 - 统一管理所有子弹属性
 * 威力等级: 1=普通, 2=增强, 3=最强
 */

export interface BulletConfig {
  // 速度相关
  speed: number;           // 子弹飞行速度 (像素/秒)
  fireCooldown: number;    // 射击冷却时间 (毫秒)
  
  // 颜色
  color: string;           // 子弹颜色 (CSS颜色值)
  
  // 穿透能力
  canPenetrateBrick: boolean;   // 是否可以穿透砖块
  canPenetrateSteel: boolean;   // 是否可以穿透钢铁
  canPenetrateMultiple: number; // 最多穿透多少个敌人 (-1=无限穿透)
  brickPenetrationCount: number; // 一次能打掉的砖块数量
  
  // 反弹能力 (0=不反弹, >0=反弹次数)
  maxBounces: number;       // 最大反弹次数
  
  // 音效
  penetrateSound: 'none' | 'metal' | 'explosion';  // 穿透时的音效
  
  // 坦克外观
  tankColor: string;      // 坦克颜色 (当威力>=2时改变)
  tankDecoration: string; // 坦克装饰 (当威力>=3时添加)
}

// 子弹威力等级配置表
export const BULLET_LEVEL_CONFIG: Record<number, BulletConfig> = {
  // 等级1: 普通子弹
  1: {
    speed: 192,           // 最慢
    fireCooldown: 900,   // 基础射速
    
    color: 'white',      // 白色
    
    canPenetrateBrick: false,
    canPenetrateSteel: false,
    canPenetrateMultiple: 0,
    brickPenetrationCount: 1,  // 一次打1块砖
    
    maxBounces: 0,        // 不反弹
    
    penetrateSound: 'none',
    
    tankColor: 'blue',
    tankDecoration: 'none'
  },
  
  // 等级2: 增强子弹 (1颗星)
  2: {
    speed: 256,           // 中等
    fireCooldown: 700,    // 稍快
    
    color: 'silver',   // 银色
    
    canPenetrateBrick: true,  // 可以穿透砖块
    canPenetrateSteel: false,
    canPenetrateMultiple: 0,  // 不能穿透敌人
    brickPenetrationCount: 1,  // 一次打1块砖
    
    maxBounces: 0,        // 不反弹
    
    penetrateSound: 'none',
    
    tankColor: 'blue',
    tankDecoration: 'none'
  },
  
  // 等级3: 最强子弹 (2颗星/手枪)
  3: {
    speed: 320,           // 最快
    fireCooldown: 500,   // 快速射击
    
    color: 'gold',       // 金色
    
    canPenetrateBrick: true,
    canPenetrateSteel: true,   // 可以穿透钢铁
    canPenetrateMultiple: -1,   // -1表示无限穿透 (非装甲敌人)
    brickPenetrationCount: 2,  // 一次打掉2块砖
    
    maxBounces: 0,        // 不反弹
    
    penetrateSound: 'metal',   // 穿透钢铁音效
    
    tankColor: 'cyan',
    tankDecoration: 'star'
  }
};

// 特殊子弹颜色配置 (道具效果覆盖)
export const SPECIAL_BULLET_COLORS: Record<string, string> = {
  'star': 'yellow',  // 星星道具 - 黄色
  'gun': 'red'      // 手枪道具 - 红色
};

// 获取子弹配置
export function getBulletConfig(level: number): BulletConfig {
  return BULLET_LEVEL_CONFIG[Math.min(Math.max(level, 1), 3)] || BULLET_LEVEL_CONFIG[1];
}
