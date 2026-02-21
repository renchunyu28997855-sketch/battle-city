class HUD {
  private score: number = 0;
  private lives: number = 3;
  private level: number = 1;
  private enemiesRemaining: number = 0;
  
  constructor() {
  }
  
  /**
   * Update the HUD with new game data
   */
  update(score: number, lives: number, level: number, enemiesRemaining: number): void {
    this.score = score;
    this.lives = lives;
    this.level = level;
    this.enemiesRemaining = enemiesRemaining;
  }
  
  /**
   * Draw the HUD elements
   */
  draw(): void {
    console.log(`Score: ${this.score}`);
    console.log(`Lives: ${this.lives}`);
    console.log(`Level: ${this.level}`);
    console.log(`Enemies Remaining: ${this.enemiesRemaining}`);
  }
  
  /**
   * Get current score
   */
  getScore(): number {
    return this.score;
  }
  
  /**
   * Get remaining lives
   */
  getLives(): number {
    return this.lives;
  }
  
  /**
   * Get current level
   */
  getLevel(): number {
    return this.level;
  }
  
  /**
   * Get remaining enemies count
   */
  getEnemiesRemaining(): number {
    return this.enemiesRemaining;
  }
}

export default HUD;