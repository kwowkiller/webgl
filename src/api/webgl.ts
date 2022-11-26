import Coordinate from "./coordinate";

export default class WebGL {
  ctx: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  program?: WebGLProgram;
  // 坐标系工具
  coordinate: Coordinate;
  constructor(canvas: HTMLCanvasElement, square = 0) {
    if (square) {
      canvas.width = square;
      canvas.height = square;
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext("webgl")!;
    this.coordinate = new Coordinate(canvas);
    // 开启颜色合成，否则不显示透明颜色
    this.ctx.enable(this.ctx.BLEND);
    // 合成算法设置，不同的算法，出来的结果可能很不一样
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
    const log = this.ctx.getShaderInfoLog(shader);
    if (log) {
      console.error(log);
    }
    return shader;
  }
}
