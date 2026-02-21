export class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Adds another Vector2D to this vector
   * @param other The vector to add
   * @returns A new Vector2D representing the sum
   */
  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtracts another Vector2D from this vector
   * @param other The vector to subtract
   * @returns A new Vector2D representing the difference
   */
  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiplies this vector by a scalar
   * @param scalar The scalar to multiply by
   * @returns A new Vector2D representing the scaled vector
   */
  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * Gets the magnitude (length) of this vector
   * @returns The magnitude of the vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalizes this vector (makes it unit length)
   * @returns A new normalized Vector2D
   */
  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }

  /**
   * Gets the distance to another vector
   * @param other The other vector
   * @returns The Euclidean distance between the vectors
   */
  distanceTo(other: Vector2D): number {
    return this.subtract(other).magnitude();
  }

  /**
   * Creates a copy of this vector
   * @returns A new Vector2D with the same coordinates
   */
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
}