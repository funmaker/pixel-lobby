
export class Vector {
  x; y; z;
  
  constructor(x = 0, y = x, z = x) {
    if(typeof x === "object") return void Object.assign(this, x);
    
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  static random(a, b, c, d, e, f, g) {
    let xmin, xmax, ymin, ymax, zmin, zmax, whole;
    switch(arguments.length) {
      case 1: [xmin, xmax, ymin, ymax, zmin, zmax, whole] = [0, a, 0, a, 0, a, true]; break;
      case 2: [xmin, xmax, ymin, ymax, zmin, zmax, whole] = [a, b, a, b, a, b, false]; break;
      case 3: [xmin, xmax, ymin, ymax, zmin, zmax, whole] = [a, b, a, b, a, b, c]; break;
      case 4: [xmin, xmax, ymin, ymax, zmin, zmax, whole] = [0, a, 0, b, 0, c, d]; break;
      case 6: [xmin, xmax, ymin, ymax, zmin, zmax, whole] = [a, b, c, d, e, f, false]; break;
      case 7: [xmin, xmax, ymin, ymax, zmin, zmax, whole] = [a, b, c, d, e, f, g]; break;
      default: throw new TypeError(`Wrong number of arguments: ${arguments.length}`);
    }
    
    if(typeof xmin === "object") xmin = xmin.x;
    if(typeof xmax === "object") xmax = xmax.x;
    if(typeof ymin === "object") ymin = ymin.y;
    if(typeof ymax === "object") ymax = ymax.y;
    if(typeof zmin === "object") zmin = zmin.z;
    if(typeof zmax === "object") zmax = zmax.z;
    
    const vec = new Vector(Math.random() * (xmax - xmin) + xmin, Math.random() * (ymax - ymin) + ymin, Math.random() * (zmax - zmin) + zmin);
    if(whole) vec.set(Math.floor(vec.x), Math.floor(vec.y), Math.floor(vec.z));
    return vec;
  }
  
  set(x = 0, y = x, z = x) {
    if(typeof x === "object") return void Object.assign(this, x);
    
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  
  magnitude2() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  
  add(rhs) {
    if(!(rhs instanceof Vector)) rhs = new Vector(rhs);
    return new Vector(this.x + rhs.x, this.y + rhs.y, this.z + rhs.z);
  }
  
  sub(rhs) {
    if(!(rhs instanceof Vector)) rhs = new Vector(rhs);
    return new Vector(this.x - rhs.x, this.y - rhs.y, this.z - rhs.z);
  }
  
  mul(rhs) {
    if(!(rhs instanceof Vector)) rhs = new Vector(rhs);
    return new Vector(this.x * rhs.x, this.y * rhs.y, this.z * rhs.z);
  }
  
  div(rhs) {
    if(!(rhs instanceof Vector)) rhs = new Vector(rhs);
    return new Vector(this.x / rhs.x, this.y / rhs.y, this.z / rhs.z);
  }
  
  between(min, max) {
    return this.x >= min.x && this.x < max.x && this.y >= min.y && this.y < max.y && this.z >= min.z && this.z < max.z;
  }
}

export class Smooth {
  current;
  target;
  smoothTime;
  maxSpeed;
  currentVelocity = 0;
  
  constructor(value = 0, smoothTime = 1, maxSpeed = Infinity) {
    this.current = this.target = value;
    this.smoothTime = smoothTime;
    this.maxSpeed = maxSpeed;
  }
  
  setTarget(target) {
    this.target = target;
  }
  
  set(current) {
    this.target = this.current = current;
  }
  
  update(deltaTime) {
    deltaTime = Math.max(0.0001, deltaTime);
    let num = 2 / this.smoothTime;
    let num2 = num * deltaTime;
    let num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
    let num4 = this.current - this.target;
    let num5 = this.target;
    let num6 = this.maxSpeed * this.smoothTime;
    if(num4 < -num6) num4 = -num6;
    if(num4 > num6) num4 = num6;
    this.target = this.current - num4;
    let num7 = (this.currentVelocity + num * num4) * deltaTime;
    this.currentVelocity = (this.currentVelocity - num * num7) * num3;
    let num8 = this.target + (num4 + num7) * num3;
    if(num5 - this.current > 0 === num8 > num5) {
      num8 = num5;
      this.currentVelocity = (num8 - num5) / deltaTime;
    }
    this.current = num8;
  }
}

export class SmoothVector extends Vector {
  xSmooth; ySmooth; zSmooth;
  
  constructor(x, y, z, smoothTime, maxSpeed) {
    super(x, y, z);
    this.xSmooth = new Smooth(x, smoothTime, maxSpeed);
    this.ySmooth = new Smooth(y, smoothTime, maxSpeed);
    this.zSmooth = new Smooth(z, smoothTime, maxSpeed);
  }
  
  setTarget(target) {
    this.xSmooth.setTarget(target.x);
    this.ySmooth.setTarget(target.y);
    this.zSmooth.setTarget(target.z);
  }
  
  set(current) {
    this.xSmooth.set(current.x);
    this.ySmooth.set(current.y);
    this.zSmooth.set(current.z);
    this.x = this.xSmooth.current;
    this.y = this.ySmooth.current;
    this.z = this.zSmooth.current;
  }
  
  update(deltaTime) {
    this.xSmooth.update(deltaTime);
    this.ySmooth.update(deltaTime);
    this.zSmooth.update(deltaTime);
    this.x = this.xSmooth.current;
    this.y = this.ySmooth.current;
    this.z = this.zSmooth.current;
  }
}
