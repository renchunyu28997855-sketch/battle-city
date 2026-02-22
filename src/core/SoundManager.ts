export class SoundManager {
    private static instance: SoundManager;
    private audioCtx: AudioContext | null = null;
    private bgmPlaying: boolean = false;
    
    private constructor() {
        // AudioContext will be created on first user interaction
    }
    
    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }
    
    private initAudio(): void {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }
    
    // Start background music
    startBGM(): void {
        this.initAudio();
        if (!this.audioCtx || this.bgmPlaying) return;
        
        this.bgmPlaying = true;
        
        // Create simple BGM loop using oscillators
        this.playBGMLoop();
    }
    
    private playBGMLoop(): void {
        if (!this.audioCtx || !this.bgmPlaying) return;
        
        // Classic tank battle melody (simplified)
        const notes = [130.81, 146.83, 164.81, 146.83, 130.81, 98.00, 130.81, 146.83];
        const tempo = 200; // ms per note
        
        let noteIndex = 0;
        const playNextNote = () => {
            if (!this.bgmPlaying || !this.audioCtx) return;
            
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.frequency.value = notes[noteIndex];
            osc.type = 'square';
            
            gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
            
            osc.start(this.audioCtx.currentTime);
            osc.stop(this.audioCtx.currentTime + 0.15);
            
            noteIndex = (noteIndex + 1) % notes.length;
            setTimeout(playNextNote, tempo);
        };
        
        playNextNote();
    }
    
    stopBGM(): void {
        this.bgmPlaying = false;
    }
    
    // Bullet firing sound
    playShoot(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // Shooting sound - descending pitch
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.1);
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.1);
    }
    
    // Explosion sound - 高频爆炸音
    playExplosion(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        // 创建多次爆炸,叠加在一起
        for (let i = 0; i < 3; i++) {
            const delay = i * 0.15;
            const duration = 0.4 + i * 0.1;
            const bufferSize = this.audioCtx.sampleRate * duration;
            const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let j = 0; j < bufferSize; j++) {
                data[j] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const gain = this.audioCtx.createGain();
            const filter = this.audioCtx.createBiquadFilter();
            
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1500 - i * 300, this.audioCtx.currentTime + delay);
            filter.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + delay + duration);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            // 每次爆炸音量递减
            const volume = 0.7 - i * 0.15;
            gain.gain.setValueAtTime(volume, this.audioCtx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + delay + duration);
            
            noise.start(this.audioCtx.currentTime + delay);
        }
    }
    
    // Enemy hit sound
    playHit(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.15);
        osc.type = 'sawtooth';
        
        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.15);
    }
    
    playMetalHit(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime + 0.05);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.15);
    }
    
    // 穿透音效 - 用于穿透子弹击中敌人
    playPenetrate(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 快速下降的音调
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.1);
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.1);
    }
    
    // Power-up collection sound - 清脆的上浮音效
    playPowerUp(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 上升音调
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.1);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.15);
    }
    
    // 穿透弹发射声音 - 更强劲的发射音效
    playPenetrateShoot(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 穿透弹发射 - 频率更高、音色更厚重
        osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.15);
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.15);
    }
    
    // 穿透弹击中爆炸声音 - 更大的爆炸
    playPenetrateExplosion(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const bufferSize = this.audioCtx.sampleRate * 0.5;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.4);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 更大的音量
        gain.gain.setValueAtTime(0.8, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);
        
        noise.start(this.audioCtx.currentTime);
    }
    
    // 穿透弹击穿钢砖声音 - 金属撞击+穿透
    playPenetrateSteel(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        // 金属撞击声
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 高频金属音
        osc.frequency.setValueAtTime(2000, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, this.audioCtx.currentTime + 0.2);
        osc.type = 'sawtooth';
        
        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.2);
        
        // 穿透音效
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        
        osc2.frequency.setValueAtTime(1500, this.audioCtx.currentTime + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.2);
        osc2.type = 'square';
        
        gain2.gain.setValueAtTime(0.4, this.audioCtx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
        
        osc2.start(this.audioCtx.currentTime + 0.05);
        osc2.stop(this.audioCtx.currentTime + 0.2);
    }
    
    // 闹钟音效 - 定时道具
    playClock(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        // 重复的闹钟声
        for (let i = 0; i < 3; i++) {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.frequency.setValueAtTime(800, this.audioCtx.currentTime + i * 0.3);
            osc.type = 'square';
            
            gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + i * 0.3 + 0.15);
            
            osc.start(this.audioCtx.currentTime + i * 0.3);
            osc.stop(this.audioCtx.currentTime + i * 0.3 + 0.15);
        }
    }
    
    // 星星道具音效 - 上升音效
    playStar(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 上升音效
        osc.frequency.setValueAtTime(523, this.audioCtx.currentTime);
        osc.frequency.setValueAtTime(659, this.audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, this.audioCtx.currentTime + 0.2);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.3);
    }
    
    // 头盔道具音效 - 护盾音效
    playHelmet(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 稳定的低音
        osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.2);
    }
    
    // 铁锹道具音效 - 挖掘/建造音效
    playShovel(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        // 两次挖掘声
        for (let i = 0; i < 2; i++) {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.frequency.setValueAtTime(150, this.audioCtx.currentTime + i * 0.15);
            osc.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + i * 0.15 + 0.1);
            osc.type = 'sawtooth';
            
            gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + i * 0.15 + 0.1);
            
            osc.start(this.audioCtx.currentTime + i * 0.15);
            osc.stop(this.audioCtx.currentTime + i * 0.15 + 0.1);
        }
    }
    
    // 坦克道具音效 - 坦克升级音效
    playTank(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 沉重的坦克声
        osc.frequency.setValueAtTime(100, this.audioCtx.currentTime);
        osc.frequency.setValueAtTime(80, this.audioCtx.currentTime + 0.1);
        osc.type = 'sawtooth';
        
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.2);
    }
    
    // 船道具音效 - 水上音效
    playBoat(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        // 柔和的水声
        osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.3);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.3);
    }
    
    // 枪道具音效 - 武器升级
    playGun(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        // 快速上升音效
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioCtx.currentTime + 0.15);
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        
        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.15);
    }
}
