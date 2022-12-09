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
