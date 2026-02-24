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

  /**
   * 计算向量关于法向量的反射向量
   * 反射公式: r = v - 2(v·n)n
   * 其中 v 是入射向量，n 是单位法向量
   * @param normal 单位法向量 (需要已归一化)
   * @returns 反射后的向量
   */
  reflect(normal: Vector2D): Vector2D {
    // 计算入射向量与法向量的点积
    const dotProduct = this.x * normal.x + this.y * normal.y;
    
    // 反射公式: r = v - 2(v·n)n
    return new Vector2D(
      this.x - 2 * dotProduct * normal.x,
      this.y - 2 * dotProduct * normal.y
    );
  }

  /**
   * 获取垂直于当前向量的单位法向量
   * 对于向量(x, y)，垂直向量是(-y, x)或(y, -x)
   * @returns 垂直向量
   */
  getPerpendicular(): Vector2D {
    return new Vector2D(-this.y, this.x);
  }

  /**
   * 计算向量的点积
   * @param other 另一个向量
   * @returns 点积结果
   */
  dot(other: Vector2D): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * 获取向量的逆向向量
   * @returns 逆向向量
   */
  negate(): Vector2D {
    return new Vector2D(-this.x, -this.y);
  }

  /**
   * 检查向量是否为零向量
   * @returns 是否为零向量
   */
  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }
}