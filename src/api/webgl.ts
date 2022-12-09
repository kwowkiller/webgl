import Coordinate from "./coordinate";

export default class WebGL {
  ctx: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
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

  createProgram(vs: string, fs: string) {
    const { ctx } = this;
    const program = ctx.createProgram()!;
    const vertex = this.loadShader(ctx.VERTEX_SHADER, vs);
    const fragment = this.loadShader(ctx.FRAGMENT_SHADER, fs);
    ctx.attachShader(program!, vertex);
    ctx.attachShader(program!, fragment);
    ctx.linkProgram(program!);
    // ctx.useProgram(this.program!);
    return program;
  }
  private loadShader(type: GLenum, source: string) {
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
