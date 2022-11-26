type PolygonMode =
  | "POINTS"
  | "LINE_STRIP"
  | "LINES"
  | "LINE_LOOP"
  | "TRIANGLES"
  | "TRIANGLE_FAN"
  | "TRIANGLE_STRIP";

export default class Polygon {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  modes: PolygonMode[];
  // 为了方便操作顶点，使用二维数组
  vertices: number[][] = [];
  attrs: {
    [key: string]: {
      size: number;
      offset?: number;
    };
  };
  private data: Float32Array;
  // 为了画圆点做的额外处理，兼容mac系统的着色器
  private isPoint: WebGLUniformLocation | null;
  constructor(params: {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    vertices?: number[][];
    attrs: {
      [key: string]: {
        size: number;
        offset?: number;
      };
    };
    modes?: PolygonMode[];
  }) {
    const { gl, program, modes = ["POINTS"], vertices = [], attrs } = params;
    this.gl = gl;
    this.program = program;
    this.modes = modes;
    this.attrs = attrs;
    this.vertices = vertices;
    this.data = new Float32Array(this.vertices.flat());
    this.isPoint = gl.getUniformLocation(program, "is_Point");
    this.init();
  }

  get size() {
    return Object.values(this.attrs)
      .map((a) => a.size)
      .reduce((p, c) => p + c);
  }

  private init() {
    const {
      gl,
      program,
      attrs,
      data: { BYTES_PER_ELEMENT },
    } = this;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // this.bufferData();
    for (const key in attrs) {
      const { size, offset = 0 } = attrs[key];
      const _attr = gl.getAttribLocation(program, key);
      gl.vertexAttribPointer(
        _attr,
        size,
        gl.FLOAT,
        false,
        this.size * BYTES_PER_ELEMENT,
        offset * BYTES_PER_ELEMENT
      );
      gl.enableVertexAttribArray(_attr);
    }
  }

  private bufferData() {
    const { gl } = this;
    // 更新data数组
    this.data = new Float32Array(this.vertices.flat());
    gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
  }

  draw(clear = true) {
    const { gl, modes } = this;
    if (clear) {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.bufferData();
    for (let mode of modes) {
      // 为了画圆点做一些特殊处理
      gl.uniform1f(this.isPoint, mode === "POINTS" ? 1 : 0);
      gl.drawArrays(gl[mode], 0, this.data.length / this.size);
    }
  }
}
