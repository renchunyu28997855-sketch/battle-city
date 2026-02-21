export class ScoreManager {
  private score: number = 0;
  private lives: number = 3;

  constructor() {
    this.score = 0;
    this.lives = 3;
  }

  /**
   * Get current score
   * @returns Current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Get current lives
   * @returns Current lives
   */
  getLives(): number {
    return this.lives;
  }

  /**
   * Add score when enemy is killed
   * @param points Points to add based on enemy type
   */
  addScore(points: number): void {
    this.score += points;
    
    // Check if we should give an extra life
    if (this.score >= 20000 && this.lives < 10) {
      this.addLife();
    }
  }

  /**
   * Lose a life
   */
  loseLife(): void {
    this.lives--;
  }

  /**
   * Add a life
   */
  addLife(): void {
    this.lives++;
  }

  /**
   * Get points for killing different types of enemies
   * @param enemyType Type of enemy
   * @returns Points for killing that enemy type
   */
  static getEnemyPoints(enemyType: string): number {
    switch (enemyType) {
      case 'normal':
        return 100;
      case 'fast':
        return 200;
      case 'heavy':
        return 300;
      case 'super':
        return 400;
      default:
        return 100;
    }
  }
}