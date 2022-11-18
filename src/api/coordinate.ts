export interface Point {
  x: number;
  y: number;
  z?: number;
  w?: number;
}

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

  // 鼠标坐标转为webgl坐标
  mouseToWebGL(event: React.MouseEvent) {
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
    return {
      x: x / (width / 2),
      y: y / (height / 2),
    };
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
