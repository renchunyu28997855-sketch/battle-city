// 音效系统改进示例代码

/**
 * 本文件展示了如何改进 Battle City 的音效系统
 * 包括：
 * 1. 添加全局音量控制
 * 2. 音效预加载机制
 * 3. 参数化音效生成
 * 4. 音效缓存
 */

// ============================================================================
// 示例 1: 改进的 SoundManager（添加音量控制）
// ============================================================================

export interface AudioPreset {
    startFreq: number;
    endFreq: number;
    duration: number;
    waveType: 'sine' | 'square' | 'sawtooth' | 'triangle';
    volume: number;
    attack?: number;    // 淡入时间
    decay?: number;     // 淡出时间
}

export class EnhancedSoundManager {
    private static instance: EnhancedSoundManager;
    private audioCtx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private bgmPlaying: boolean = false;
    private audioCache: Map<string, AudioBuffer> = new Map();
    private muted: boolean = false;

    private constructor() {}

    static getInstance(): EnhancedSoundManager {
        if (!EnhancedSoundManager.instance) {
            EnhancedSoundManager.instance = new EnhancedSoundManager();
        }
        return EnhancedSoundManager.instance;
    }

    private initAudio(): void {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // 创建主增益节点用于全局音量控制
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.gain.value = 0.7;  // 默认 70% 音量
            this.masterGain.connect(this.audioCtx.destination);
        }
    }

    /**
     * 设置全局音量 (0.0 - 1.0)
     */
    setVolume(value: number): void {
        this.initAudio();
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }

    /**
     * 获取当前音量
     */
    getVolume(): number {
        return this.masterGain?.gain.value ?? 0.7;
    }

    /**
     * 启用/禁用所有音效
     */
    setMuted(muted: boolean): void {
        this.initAudio();
        this.muted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : this.getVolume();
        }
    }

    /**
     * 通用音效播放函数（参数化）
     */
    playSound(preset: AudioPreset): void {
        this.initAudio();
        if (!this.audioCtx || !this.masterGain || this.muted) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = preset.waveType;
        osc.frequency.setValueAtTime(preset.startFreq, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
            preset.endFreq,
            this.audioCtx.currentTime + preset.duration
        );

        osc.connect(gain);
        gain.connect(this.masterGain);

        // 音量包络
        const attackTime = preset.attack ?? 0.01;
        const decayTime = preset.decay ?? 0.05;
        
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(
            preset.volume,
            this.audioCtx.currentTime + attackTime
        );
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioCtx.currentTime + preset.duration - decayTime
        );

        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + preset.duration);
    }

    /**
     * 预加载外部音频文件
     */
    async preloadAudio(name: string, url: string): Promise<void> {
        this.initAudio();
        if (!this.audioCtx) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.audioCache.set(name, audioBuffer);
            console.log(`Audio preloaded: ${name}`);
        } catch (error) {
            console.error(`Failed to preload audio ${name}:`, error);
        }
    }

    /**
     * 播放预加载的音效
     */
    playFromCache(name: string, volume?: number): void {
        this.initAudio();
        if (!this.audioCtx || !this.masterGain || this.muted) return;

        const buffer = this.audioCache.get(name);
        if (!buffer) {
            console.warn(`Audio not found in cache: ${name}`);
            return;
        }

        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;

        const gain = this.audioCtx.createGain();
        gain.gain.value = volume ?? 1.0;

        source.connect(gain);
        gain.connect(this.masterGain);

        source.start(this.audioCtx.currentTime);
    }
}

// ============================================================================
// 示例 2: 音效预设库
// ============================================================================

export const AUDIO_PRESETS = {
    shoot: {
        startFreq: 880,
        endFreq: 110,
        duration: 0.1,
        waveType: 'square' as const,
        volume: 0.3,
    },
    
    penetrateShoot: {
        startFreq: 1200,
        endFreq: 80,
        duration: 0.15,
        waveType: 'square' as const,
        volume: 0.4,
    },
    
    powerUp: {
        startFreq: 400,
        endFreq: 800,
        duration: 0.1,
        waveType: 'sine' as const,
        volume: 0.3,
    },
    
    hit: {
        startFreq: 200,
        endFreq: 50,
        duration: 0.15,
        waveType: 'sawtooth' as const,
        volume: 0.2,
    },
    
    metalHit: {
        startFreq: 1200,
        endFreq: 500,
        duration: 0.15,
        waveType: 'sine' as const,
        volume: 0.4,
    },
    
    star: {
        startFreq: 523,
        endFreq: 784,
        duration: 0.3,
        waveType: 'sine' as const,
        volume: 0.3,
        attack: 0.05,
        decay: 0.1,
    },
};

// ============================================================================
// 示例 3: 在 main.ts 中的使用方式
// ============================================================================

/**
 * 使用示例（复制到 main.ts）
 */

/*
import { EnhancedSoundManager, AUDIO_PRESETS } from './core/EnhancedSoundManager';

const soundManager = EnhancedSoundManager.getInstance();

// 初始化（在页面加载后的首次用户交互时）
document.addEventListener('click', () => {
    soundManager.setVolume(0.7);
    console.log('Audio initialized');
});

// 在游戏中使用
function shootHandler() {
    if (playerTank && playerTank.bulletLevel >= 3) {
        soundManager.playSound(AUDIO_PRESETS.penetrateShoot);
    } else {
        soundManager.playSound(AUDIO_PRESETS.shoot);
    }
}

function powerUpCollectionHandler(type: PowerUpType) {
    soundManager.playSound(AUDIO_PRESETS.powerUp);
}

// 提供给用户音量控制
function setGameVolume(percent: number) {
    soundManager.setVolume(percent / 100);
}

// 提供给用户音效开关
function toggleSound(enable: boolean) {
    soundManager.setMuted(!enable);
}

// 预加载外部音效（可选）
async function preloadAudio() {
    await soundManager.preloadAudio('bgm_intro', 'assets/audio/bgm/intro.mp3');
    await soundManager.preloadAudio('bgm_loop', 'assets/audio/bgm/loop.mp3');
    await soundManager.preloadAudio('shoot_ext', 'assets/audio/sfx/shoot.wav');
}
*/

// ============================================================================
// 示例 4: 爆炸音效生成函数（高级）
// ============================================================================

export class AdvancedSoundGenerator {
    private audioCtx: AudioContext;
    private masterGain: GainNode;

    constructor(audioCtx: AudioContext, masterGain: GainNode) {
        this.audioCtx = audioCtx;
        this.masterGain = masterGain;
    }

    /**
     * 生成复杂的爆炸音效
     * @param intensity 爆炸强度 (1-5)
     */
    playComplexExplosion(intensity: number = 3): void {
        const time = this.audioCtx.currentTime;
        const baseGain = Math.min(1, intensity / 5);

        // 第一层：低频轰鸣
        {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(30, time + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);

            gain.gain.setValueAtTime(baseGain * 0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

            osc.start(time);
            osc.stop(time + 0.3);
        }

        // 第二层：噪声冲击
        {
            const bufferSize = this.audioCtx.sampleRate * 0.4;
            const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.audioCtx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.audioCtx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2000 - intensity * 200, time);
            filter.frequency.exponentialRampToValueAtTime(500, time + 0.4);

            const gain = this.audioCtx.createGain();

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            gain.gain.setValueAtTime(baseGain * 0.8, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

            noise.start(time);
        }

        // 第三层：高音尖锐声
        if (intensity >= 3) {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, time + 0.05);
            osc.frequency.exponentialRampToValueAtTime(300, time + 0.2);

            osc.connect(gain);
            gain.connect(this.masterGain);

            gain.gain.setValueAtTime(baseGain * 0.4, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

            osc.start(time + 0.05);
            osc.stop(time + 0.2);
        }
    }

    /**
     * 生成多层音调效果（如升级提示）
     * @param notes 音符频率数组 (Hz)
     * @param duration 每个音符持续时间 (ms)
     */
    playMelody(notes: number[], duration: number = 100): void {
        let delay = 0;

        for (const freq of notes) {
            this.playNote(freq, duration, delay);
            delay += duration;
        }
    }

    private playNote(frequency: number, duration: number, delay: number): void {
        const time = this.audioCtx.currentTime + delay / 1000;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.value = frequency;

        osc.connect(gain);
        gain.connect(this.masterGain);

        const durationSeconds = duration / 1000;
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + durationSeconds);

        osc.start(time);
        osc.stop(time + durationSeconds);
    }
}

// ============================================================================
// 示例 5: UI 控制集成（HTML + TypeScript）
// ============================================================================

/*
HTML:
<div class="sound-controls">
    <label>
        音效音量:
        <input type="range" id="volumeSlider" min="0" max="100" value="70" />
        <span id="volumeLabel">70%</span>
    </label>
    <label>
        <input type="checkbox" id="soundToggle" checked />
        启用音效
    </label>
</div>

TypeScript:
const volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement;
const volumeLabel = document.getElementById('volumeLabel') as HTMLSpanElement;
const soundToggle = document.getElementById('soundToggle') as HTMLInputElement;

volumeSlider.addEventListener('input', (e) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    soundManager.setVolume(value / 100);
    volumeLabel.textContent = `${value}%`;
});

soundToggle.addEventListener('change', (e) => {
    soundManager.setMuted(!(e.target as HTMLInputElement).checked);
});
*/

// ============================================================================
// 示例 6: 性能监控工具
// ============================================================================

export class AudioPerformanceMonitor {
    private activeNodes: Map<string, number> = new Map();
    private maxConcurrent: number = 0;

    trackNodeCreation(nodeType: string): void {
        const count = (this.activeNodes.get(nodeType) ?? 0) + 1;
        this.activeNodes.set(nodeType, count);
        this.maxConcurrent = Math.max(
            this.maxConcurrent,
            Array.from(this.activeNodes.values()).reduce((a, b) => a + b, 0)
        );
    }

    trackNodeDestruction(nodeType: string): void {
        const count = Math.max(0, (this.activeNodes.get(nodeType) ?? 1) - 1);
        this.activeNodes.set(nodeType, count);
    }

    getStats(): {
        activeNodes: Map<string, number>;
        totalActive: number;
        maxConcurrent: number;
    } {
        const totalActive = Array.from(this.activeNodes.values()).reduce((a, b) => a + b, 0);
        return {
            activeNodes: this.activeNodes,
            totalActive,
            maxConcurrent: this.maxConcurrent,
        };
    }

    logStats(): void {
        const stats = this.getStats();
        console.table({
            'Active Nodes': stats.totalActive,
            'Max Concurrent': stats.maxConcurrent,
            'Details': Object.fromEntries(stats.activeNodes),
        });
    }
}

// ============================================================================
// 导出示例使用
// ============================================================================

export default {
    EnhancedSoundManager,
    AUDIO_PRESETS,
    AdvancedSoundGenerator,
    AudioPerformanceMonitor,
};
