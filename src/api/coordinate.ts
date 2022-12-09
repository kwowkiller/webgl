import { Matrix4, Vector2, Vector3 } from "three";

export interface Point {
  x: number;
  y: number;
  z?: number;
  w?: number;
}

export type Triangle = [Point, Point, Point];

// 坐标系工具
export default class Coordinate {
  canvas: HTMLCanvasElement;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  get w() {
    return this.canvas.width;
  }

  get h() {
    return this.canvas.height;
  }

  // webgl的坐标为正方形的-1,1之间，当画布不是正方形是，x轴和y轴对应的坐标长度不一致
  get ratio() {
    return this.w / this.h;
  }

  // css的绝对大小的像素单位px转化为webgl的相对坐标点
  px2gl({ w = 0, h = 0 }: { w?: number; h?: number }) {
    return { w: w / (this.w / 2), h: h / (this.h / 2) };
  }

  // 使坐标点对应的长度成比例，比如用点绘制正方形的时候
  acceptRatio(points: Point[]): Point[] {
    return points.map(({ x, y }) => ({
      x,
      y: y * this.ratio,
    }));
  }

  // 象限转换，比如[-0.1,0.1]为第二象限，转为第三象限则为[-0.1,-0.1]
  quadrantChange(point: Point, quadrant: number): Point {
    const ax = Math.abs(point.x);
    const ay = Math.abs(point.y);
    switch (quadrant) {
      case 1:
        return { x: ax, y: ay };
      case 2:
        return { x: -ax, y: ay };
      case 3:
        return { x: -ax, y: -ay };
      case 4:
        return { x: ax, y: -ay };
      default:
        return point;
    }
  }

  /*
   判断点是否在三角形内，利用的是向量叉乘，判断点与三角形边的位置
   如果点在三条边的同一侧，则认为点在三角形内部，利用向量的叉乘判断点在哪一侧
   */
  static inTriangle(p: Point, [p1, p2, p3]: Triangle) {
    // 按三角形三个点的顺序依次和p点做叉乘，得到的结果都是同正或同负，说明点在三角形内
    const c = [
      this.crossProduct([p, p1, p2]),
      this.crossProduct([p, p2, p3]),
      this.crossProduct([p, p3, p1]),
    ];
    return c.every((it) => it > 0) || c.every((it) => it < 0);
  }

  // 叉乘判断p1 p2 p3三点构成的两个向量之间的关系
  static crossProduct([p1, p2, p3]: Triangle) {
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

  // 鼠标坐标转为webgl坐标
  mouseToWebGL(event: { clientX: number; clientY: number }) {
    // css坐标从浏览器窗口左上角起，即clientX和clientY
    // 画布的左上角相对于浏览器窗口的左上角的位置，即left和top
    // 构成向量 [clientX,clientY] - [left,top]，可得到鼠标相对于画布的位置
    // 如果画布和窗口一样大小，则clientX和clientY就是鼠标相对于画布的位置，因为left和top都为0
    const { left, top } = this.canvas.getBoundingClientRect();
    const [cssX, cssY] = [event.clientX - left, event.clientY - top];
    // console.log(cssX, cssY);
    // webgl的坐标系，以画布中心点为原点，范围-1~1之间
    // 画布左上角到鼠标的向量，加上画布左上角到原点的向量，得到鼠标相对于画布中心点的向量
    // 将canvas的width和height除以2，得到canvas原点坐标的范围，即x轴-width/2 ~ width/2，y轴 height/2 ~ - height/2
    // 此时原点到左上角的向量就是[-width/2,height/2]，左上角到鼠标的向量则为[cssX,-cssY]，相加得到原点到鼠标的向量
    const { width, height } = this.canvas;
    const [x, y] = [-width / 2 + cssX, height / 2 - cssY];
    // 最后，因为webgl坐标系范围是-1 ~ 1，所以对x,y进行缩放，得到最终结果
    return new Vector2(x / (width / 2), y / (height / 2));
  }

  // 鼠标位置转世界坐标
  getWorldPosition(
    event: { clientX: number; clientY: number },
    pvMatrix: Matrix4
  ) {
    const { clientX, clientY } = event;
    const [hw, hh] = [this.w / 2, this.h / 2];
    // 裁剪空间位
    const cp = new Vector3((clientX - hw) / hw, -(clientY - hh) / hh, 0);
    // 鼠标在世界坐标系中的位置
    const p = cp.applyMatrix4(pvMatrix.clone().invert());
    return new Vector2(p.x, p.y);
  }

  // 鼠标是否接近某个点
  mouseApproach(point: Point, event: React.MouseEvent): Point | undefined {
    const mouse = this.mouseToWebGL(event);
    // 有一些精度问题
    const [a, b] = [Math.abs(point.x - mouse.x), Math.abs(point.y - mouse.y)];
    if ([a, b].every((item) => item <= 0.02)) {
      return point;
    }
  }
}
