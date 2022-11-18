type PolygonMode = "POINTS" | "LINE_STRIP" | "TRIANGLES";

export default class Polygon {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  modes: PolygonMode[];
  // size就是向量维度，可取值1,2,3,4
  size: number;
  // 为了方便操作顶点，使用二维数组
  vertices: number[][] = [];
  attr: string;
  // 为了画圆点做的额外处理，兼容mac系统的着色器
  private isPoint: WebGLUniformLocation | null;
  constructor(params: {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    size?: number;
    vertices?: number[][];
    attr: string;
    modes?: PolygonMode[];
  }) {
    const {
      gl,
      program,
      modes = ["POINTS"],
      size = 2,
      vertices = [],
      attr,
    } = params;
    this.gl = gl;
    this.program = program;
    this.modes = modes;
    this.size = size;
    this.attr = attr;
    this.vertices = vertices;
    this.isPoint = gl.getUniformLocation(program, "is_Point");
    this.init();
  }

  private init() {
    const { gl, program, size, attr } = this;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // this.bufferData();
    const _attr = gl.getAttribLocation(program, attr);
    gl.vertexAttribPointer(_attr, size, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(_attr);
  }

  private bufferData() {
    const { gl, vertices } = this;
    // 将二维数组flat铺平
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertices.flat()),
      gl.STATIC_DRAW
    );
  }

  draw() {
    this.bufferData();
    const { gl, modes, vertices } = this;
    for (let mode of modes) {
      // 为了画圆点做一些特殊处理
      gl.uniform1f(this.isPoint, mode === "POINTS" ? 1 : 0);
      gl.drawArrays(gl[mode], 0, vertices.length);
    }
  }
}
