// Battle City main entry point
console.log('Battle City game initializing...');

// Canvas setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
    console.error('Failed to get canvas context');
} else {
    // Set canvas dimensions
    canvas.width = 416;
    canvas.height = 416;
    
    // Draw a simple grid to visualize the 13x13 map (32px per tile)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

console.log('Battle City game initialized');
