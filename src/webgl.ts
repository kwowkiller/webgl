export default class WebGL {
  ctx: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  program?: WebGLProgram;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("webgl")!;
    // 开启颜色合成，否则不显示透明颜色
    this.ctx.enable(this.ctx.BLEND);
    // 合成算法设置
    this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);
  }

  initShaders(vs: string, fs: string) {
    const { ctx } = this;
    this.program = ctx.createProgram()!;
    const vertex = this.loadShader(ctx.VERTEX_SHADER, vs);
    const fragment = this.loadShader(ctx.FRAGMENT_SHADER, fs);
    ctx.attachShader(this.program!, vertex);
    ctx.attachShader(this.program!, fragment);
    ctx.linkProgram(this.program!);
    ctx.useProgram(this.program!);
  }
  loadShader(type: GLenum, source: string) {
    const { ctx } = this;
    const shader = ctx.createShader(type)!;
    ctx.shaderSource(shader, source);
    ctx.compileShader(shader);
    return shader;
  }
  // 将css坐标系转换为webgl坐标系
  coordinate(event: React.MouseEvent): Point {
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
}

export interface Point {
  x: number;
  y: number;
}
