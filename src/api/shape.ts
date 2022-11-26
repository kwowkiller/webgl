import { Point } from "./coordinate";

type Triangle = [Point, Point, Point];

export default class Shape {
  points: Point[];
  triangles: Triangle[] = [];
  constructor(points: Point[]) {
    this.points = [...points];
  }
  /*
   判断点是否在三角形内，利用的是向量叉乘，判断点与三角形边的位置
   如果点在三条边的同一侧，则认为点在三角形内部，利用向量的叉乘判断点在哪一侧
   */
  inTriangle(p: Point, [p1, p2, p3]: Triangle) {
    // 按三角形三个点的顺序依次和p点做叉乘，得到的结果都是同正或同负，说明点在三角形内
    const c = [
      this.crossProduct([p, p1, p2]),
      this.crossProduct([p, p2, p3]),
      this.crossProduct([p, p3, p1]),
    ];
    return c.every((it) => it > 0) || c.every((it) => it < 0);
  }

  // 叉乘判断p1 p2 p3三点构成的两个向量之间的关系
  crossProduct([p1, p2, p3]: Triangle) {
    // p1到p2的向量
    const a = { x: p2.x - p1.x, y: p2.y - p1.y };
    // p1到p3的向量
    const b = { x: p3.x - p1.x, y: p3.y - p1.y };
    /*
    这两个向量叉乘得到的结果，即|a|*|b|*sin(夹角)，因为a模b模都是长度为正
    只有sin(夹角)的正负会影响到叉乘结果的正负，所以可以用叉乘的正方判断夹角的方向
    */
    // 向量b在向量a的哪边，正为逆时针(左边)，负为顺时针(右边)
    return a.x * b.y - a.y * b.x;
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
    ].every((p) => !this.inTriangle(p, triangle));
    // 这个三角形的顶点指向另外两点的向量，a和b，b在a的左侧
    const leftSide = this.crossProduct(triangle) < 0;
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
