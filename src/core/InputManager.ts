/**
 * InputManager handles keyboard input for Battle City game
 * Supports multiple simultaneous key presses using Set data structure
 */
export class InputManager {
  private pressedKeys: Set<string>;

  constructor() {
    this.pressedKeys = new Set<string>();
    
    // Add event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  /**
   * Handle key down events
   * @param event Keyboard event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.pressedKeys.add(event.code);
  }

  /**
   * Handle key up events
   * @param event Keyboard event
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.pressedKeys.delete(event.code);
  }

  /**
   * Check if a key is currently pressed
   * @param code The key code to check
   * @returns True if key is pressed, false otherwise
   */
  isPressed(code: string): boolean {
    return this.pressedKeys.has(code);
  }

  /**
   * Get all currently pressed keys
   * @returns Set of currently pressed key codes
   */
  getPressedKeys(): Set<string> {
    return new Set(this.pressedKeys);
  }
}