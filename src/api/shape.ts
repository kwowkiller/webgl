import { Matrix4, Vector3 } from "three";
import Coordinate, { Point, Triangle } from "./coordinate";

export default class Shape {
  points: Point[];
  triangles: Triangle[] = [];
  constructor(points: Point[]) {
    this.points = [...points];
  }

  // 将一系列点构成的封闭图形分解成三角形
  resolve(index = 0): Triangle[] {
    const { points } = this;
    // 按顺序取出三个点组成三角形，取余处理循环到头的情况
    const [a, b, c] = [
      index % points.length,
      (index + 1) % points.length,
      (index + 2) % points.length,
    ];
    const triangle: Triangle = [points[a], points[b], points[c]];
    if (points.length <= 3) {
      this.triangles.push(triangle);
      return this.triangles;
    }
    // 剩下的点是否都不在该三角形内
    const notInside = [
      ...points.slice(0, index + 1),
      ...points.slice(index + 3, points.length),
    ].every((p) => !Coordinate.inTriangle(p, triangle));
    // 这个三角形的顶点指向另外两点的向量，a和b，b在a的左侧
    const leftSide = Coordinate.crossProduct(triangle) < 0;
    if (notInside && leftSide) {
      // 如果都不在，将该三角形添加到triangles集合，并删掉points中该三角形的第二个点
      this.triangles.push(triangle);
      points.splice(b, 1);
    }
    // 如果没有找到三角形，就从下一个点开始遍历；如果找到了，因为i2已经被删除了，所以实际是从找到的三角形的第三个点开始遍历
    return this.resolve(b);
  }

  // 将一系列的点按轴方向规则排列的点拼成三角形构成面
  combine(size: number): Triangle[] {
    const { points } = this;
    const triangles: Triangle[] = [];
    for (let i = 0; i < points.length; i += 1) {
      // 第一行和每一行的最后一个不处理
      if (i < size || (i + 1) % size === 0) continue;
      // 从第二行开始，每个点构成两个三角形
      triangles.push([points[i], points[i - size], points[i - size + 1]]);
      triangles.push([points[i], points[i + 1], points[i - size + 1]]);
    }
    return triangles;
  }
}

// 球体
export class Sphere {
  r: number;
  w: number;
  h: number;

  // 球顶点 总数 x * (y-1) + 2
  vertices: Vector3[] = [];
  // 顶点索引
  indices: number[] = [];

  constructor(params: { r?: number; w?: number; h?: number } = {}) {
    const { r = 1, w = 16, h = 16 } = params;
    this.r = r;
    this.w = w;
    this.h = h;
    this.createVertices();
    this.createIndices();
    console.log(this.vertices.length);
    console.log(this.indices);
  }

  get data() {
    return this.vertices.map((item) => item.toArray()).flat();
  }

  createVertices() {
    const { r, w, h } = this;
    const north = new Vector3().setY(r);
    const south = new Vector3().setY(-r);
    const angleH = Math.PI / h;
    const angleW = (Math.PI * 2) / w;
    for (let y = 0; y < h; y++) {
      if (y === 0) {
        this.vertices.push(north);
        continue;
      }
      for (let x = 0; x < w; x++) {
        this.vertices.push(
          new Vector3()
            .copy(north)
            .applyAxisAngle(new Vector3(1, 0, 0), angleH * y)
            .applyAxisAngle(new Vector3(0, 1, 0), angleW * x)
        );
      }
    }
    this.vertices.push(south);
  }

  createIndices() {
    const { w } = this;
    this.vertices.forEach((_, index) => {
      if (index === 0) {
        for (let i = 1; i <= w; i++) {
          this.indices.push(0, i, (i % w) + 1);
        }
        return;
      }
      if (index >= this.vertices.length - 1 - w) {
        for (let i = 1; i <= w; i++) {
          this.indices.push(index, this.vertices.length - 1, (index % w) + 1);
        }
        return;
      }
      if (index % w === 0) {
        this.indices.push(index, index - w + 1, index + w);
        this.indices.push(index - w + 1, index + w, index + 1);
        return;
      }
      this.indices.push(index, index + w, index + w + 1);
      this.indices.push(index, index + 1, index + w + 1);
    });
  }
}
