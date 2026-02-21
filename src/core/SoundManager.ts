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
    
    // Explosion sound
    playExplosion(): void {
        this.initAudio();
        if (!this.audioCtx) return;
        
        // White noise for explosion
        const bufferSize = this.audioCtx.sampleRate * 0.3;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.3);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        
        noise.start(this.audioCtx.currentTime);
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
}
