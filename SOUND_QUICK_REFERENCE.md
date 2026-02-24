# Battle City 音效系统 - 快速参考指南

## 🎵 已实现的音效

### 游戏事件音效

```typescript
// 射击音效
soundManager.playShoot();              // 普通子弹：100ms
soundManager.playPenetrateShoot();     // 穿透弹：150ms

// 碰撞/爆炸
soundManager.playHit();                // 敌人受击（存活）：150ms
soundManager.playMetalHit();           // 金属碰撞：150ms
soundManager.playExplosion();          // 标准爆炸：550ms
soundManager.playPenetrate();          // 穿透命中：100ms
soundManager.playPenetrateExplosion(); // 穿透弹爆炸：400ms
soundManager.playPenetrateSteel();     // 穿透钢铁：200ms
```

### 道具音效

```typescript
// 各种道具
soundManager.playStar();      // ⭐ 星星（火力+1）
soundManager.playHelmet();    // 🪖 头盔（无敌）
soundManager.playClock();     // ⏱️ 时钟（冻结敌人）
soundManager.playShovel();    // ⛏️ 铁锹（要塞化）
soundManager.playTank();      // 🎖️ 坦克（生命+1）
soundManager.playBoat();      // 🚢 船（水上行走）
soundManager.playGun();       // 🔫 枪（火力3级）
soundManager.playPowerUp();   // 通用道具收集音效
```

---

## 🔊 Web Audio API 核心节点

### 1. OscillatorNode（振荡器）
生成纯正弦波、方波、锯齿波等。适合射击、道具等清晰音效。

```typescript
const osc = audioCtx.createOscillator();
osc.type = 'square';      // 波形类型
osc.frequency.value = 440; // Hz（赫兹）
osc.start(time);
osc.stop(time + 0.1);
```

**波形对比**:
- `sine` - 柔和、医疗感
- `square` - 8-bit、数字感 ✅ 推荐用于复古游戏
- `sawtooth` - 刺耳、明亮
- `triangle` - 介于 sine 和 square 之间

**常用频率**（Hz）:
```
50-100   低音鼓声
100-200  坦克低音
200-400  中低音（爆炸）
400-800  中音（发射声）
880-2000 高音（清脆、金属）
2000+    极高音（刺耳、警告声）
```

### 2. GainNode（音量控制）
控制音效的音量和淡入淡出。

```typescript
const gain = audioCtx.createGain();
gain.gain.value = 0.5; // 0-1 范围

// 衰减效果
gain.gain.setValueAtTime(0.5, time);
gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
```

### 3. BiquadFilterNode（滤波器）
改变频率响应，创建动态效果。

```typescript
const filter = audioCtx.createBiquadFilter();
filter.type = 'highpass';    // 保留高频（爆炸变尖锐）
filter.type = 'lowpass';     // 保留低频（沉闷）
filter.frequency.value = 1500; // 截止频率

// 爆炸效果：频率随时间下降
filter.frequency.setValueAtTime(1500, time);
filter.frequency.exponentialRampToValueAtTime(300, time + 0.4);
```

### 4. BufferSource（缓冲区）
播放预加载的音频数据（PCM 音频或其他格式）。

```typescript
const buffer = audioCtx.createBuffer(1, sampleCount, sampleRate);
// 或从外部加载
const response = await fetch('audio.wav');
const arrayBuffer = await response.arrayBuffer();
const buffer = await audioCtx.decodeAudioData(arrayBuffer);

const source = audioCtx.createBufferSource();
source.buffer = buffer;
source.start(time);
```

---

## 🛠️ 实现模式

### 模式 1: 纯振荡器（最简单）
```typescript
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();

osc.frequency.value = 880;
osc.type = 'square';
osc.connect(gain);
gain.connect(audioCtx.destination);

gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

osc.start(audioCtx.currentTime);
osc.stop(audioCtx.currentTime + 0.1);
```

### 模式 2: 噪声 + 滤波器（爆炸效果）
```typescript
// 生成噪声
const buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate);
const data = buffer.getChannelData(0);
for (let i = 0; i < sampleCount; i++) {
    data[i] = Math.random() * 2 - 1; // 随机值 [-1, 1]
}

// 播放和滤波
const noise = audioCtx.createBufferSource();
noise.buffer = buffer;

const filter = audioCtx.createBiquadFilter();
filter.type = 'highpass';
filter.frequency.setValueAtTime(1500, time);
filter.frequency.exponentialRampToValueAtTime(300, time + 0.4);

const gain = audioCtx.createGain();
noise.connect(filter);
filter.connect(gain);
gain.connect(audioCtx.destination);

gain.gain.setValueAtTime(0.7, time);
gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

noise.start(time);
```

### 模式 3: 多层叠加（丰富音效）
```typescript
// 创建多个振荡器组合
for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // 不同的频率和延迟
    osc.frequency.value = 440 * (i + 1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // 错开开始时间
    const delay = i * 0.1;
    gain.gain.setValueAtTime(0.3 - i * 0.1, audioCtx.currentTime + delay);
    
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + 0.2);
}
```

---

## 📊 现有实现分析

### 音效调用位置（main.ts）

| 行号 | 事件 | 调用 |
|------|------|------|
| 165 | 收集头盔 | `playHelmet()` |
| 171 | 收集星星 | `playStar()` |
| 186 | 手雷爆炸 | `playExplosion()` |
| 191 | 时钟激活 | `playClock()` |
| 207 | 铁锹激活 | `playShovel()` |
| 211 | 收集坦克 | `playTank()` |
| 216 | 收集船 | `playBoat()` |
| 220 | 收集枪 | `playGun()` |
| 388-390 | 玩家射击 | `playPenetrateShoot()` 或 `playShoot()` |
| 463 | 玩家2射击 | `playShoot()` |
| 545 | 收集道具通用 | `playPowerUp()` |
| 644 | 穿透弹命中 | `playPenetrate()` |
| 649 | 穿透弹击杀 | `playPenetrateExplosion()` |
| 665-712 | 敌人击杀 | `playExplosion()` 或 `playHit()` 或 `playMetalHit()` |

---

## 🎮 使用示例

### 基础调用（已完全实现）

```typescript
const soundManager = SoundManager.getInstance();

// 射击时
soundManager.playShoot();

// 击中敌人时
if (enemy.health <= 0) {
    soundManager.playExplosion();
} else {
    soundManager.playMetalHit();
}

// 收集道具
soundManager.playPowerUp();
```

### 条件调用（已实现）

```typescript
// 基于子弹等级的不同音效
const bulletLevel = playerTank.bulletLevel;
if (bulletLevel >= 3) {
    soundManager.playPenetrateShoot();  // 三级穿透弹
} else {
    soundManager.playShoot();           // 普通弹
}
```

### 建议的改进（待实现）

```typescript
// 1. 全局音量控制
soundManager.setVolume(0.5);

// 2. 启用/禁用音效
soundManager.setMuted(true);

// 3. 预加载音效（如果使用外部文件）
await soundManager.preloadAudio('shoot');

// 4. 背景音乐控制
soundManager.startBGM();
soundManager.stopBGM();
```

---

## ⚡ 性能优化技巧

### 1. 缓存振荡器节点（仅供参考，当前实现未缓存）
```typescript
// ❌ 不推荐：每次创建新节点
playShoot() {
    const osc = this.audioCtx.createOscillator();
    // ...
}

// ✅ 推荐：重用节点（如果需要高频调用）
// 但 Oscillator 节点启动/停止后无法重用，需要特殊处理
```

### 2. 频率预计算
```typescript
// 预计算音符频率
const NOTES = {
    C3: 130.81, C4: 261.63, C5: 523.25,
    D3: 146.83, D4: 293.66, D5: 587.33,
    E3: 164.81, E4: 329.63, E5: 659.25,
};

// 使用查表而不是重复计算
osc.frequency.value = NOTES.C4;
```

### 3. 减少并发音效
```typescript
// 监控并发数量
let activeOscillators = 0;

playShoot() {
    if (activeOscillators > 8) {
        console.warn('Too many concurrent sounds!');
        return;
    }
    
    const osc = this.audioCtx.createOscillator();
    activeOscillators++;
    
    // ... 播放逻辑
    
    osc.onended = () => {
        activeOscillators--;
    };
}
```

### 4. 避免频繁的 gain 变化
```typescript
// ❌ 避免：多次调用会导致性能问题
gain.gain.setValueAtTime(0.5, time1);
gain.gain.setValueAtTime(0.4, time2);
gain.gain.setValueAtTime(0.3, time3);

// ✅ 推荐：批量设置或使用斜坡
gain.gain.setValueAtTime(0.5, time1);
gain.gain.exponentialRampToValueAtTime(0.01, time1 + 0.5);
```

---

## 🔍 调试技巧

### 1. 检查 AudioContext 状态
```typescript
console.log(audioCtx.state);  // 'suspended', 'running', 'closed'

if (audioCtx.state === 'suspended') {
    audioCtx.resume();  // 需要用户交互才能恢复
}
```

### 2. 监控频率变化
```typescript
const osc = audioCtx.createOscillator();
console.log(osc.frequency.value); // 当前频率

osc.frequency.setValueAtTime(880, time);
console.log('频率设置为 880 Hz');

osc.frequency.exponentialRampToValueAtTime(110, time + 0.1);
console.log('在 100ms 内从 880 Hz 滑动到 110 Hz');
```

### 3. 测试不同波形
```typescript
const types = ['sine', 'square', 'sawtooth', 'triangle'];
for (const type of types) {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = 440;
    // ... 播放并聆听区别
}
```

---

## 📚 文件结构建议

### 当前（纯合成）
```
src/
└── core/
    └── SoundManager.ts  (484 行)
```

### 推荐升级（混合方案）
```
src/
├── core/
│   ├── SoundManager.ts
│   ├── AudioFileLoader.ts
│   └── AudioPresets.ts
└── assets/
    └── audio/
        ├── sfx/
        │   ├── shoot.wav
        │   ├── explosion.wav
        │   └── ...
        └── bgm/
            └── loop.mp3
```

---

## 🎯 关键参数速查表

### 音效持续时间
```
射击声：    100-150 ms
碰撞声：    100-200 ms
爆炸声：    300-500 ms
道具声：    150-300 ms
背景音乐：  无限（循环）
```

### 频率范围
```
超低频：    20-60 Hz      (难以听见，主要是感觉)
低频：      60-200 Hz     (鼓声、坦克)
中低频：    200-500 Hz    (爆炸基调)
中频：      500-2000 Hz   (发射声、碰撞)
高频：      2000-8000 Hz  (清脆、金属)
超高频：    8000+ Hz      (刺耳、警告)
```

### 音量参数
```
0.0 = 静音
0.1 = 非常小声
0.3 = 普通音效
0.5 = 中等音量
0.7 = 较大音量
1.0 = 最大音量
```

---

## ✅ 集成检查清单

- [x] SoundManager 已在 main.ts 初始化
- [x] 所有基础音效已实现
- [x] 所有游戏事件已连接音效
- [ ] 添加全局音量控制
- [ ] 添加音效启用/禁用开关
- [ ] 优化背景音乐
- [ ] 考虑集成外部音频文件
- [ ] 添加音效预加载机制

---

**最后更新**: 2025-02-24
**适用版本**: Battle City v0.0.1
