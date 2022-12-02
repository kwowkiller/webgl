type PolygonMode =
  | "POINTS"
  | "LINE_STRIP"
  | "LINES"
  | "LINE_LOOP"
  | "TRIANGLES"
  | "TRIANGLE_FAN"
  | "TRIANGLE_STRIP";

interface Attrs {
  [key: string]: {
    size: number;
    offset?: number;
  };
}
interface Uniforms {
  [key: string]: {
    func: keyof WebGLRenderingContext;
    args: any[];
  };
}

export default class Polygon {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  modes: PolygonMode[];
  // 为了方便操作顶点，使用二维数组，也可以直接传入原数据data
  vertices: number[][] = [];
  attrs: Attrs;
  uniforms: Uniforms;
  textures: {
    image: any;
    pname?: number;
    param?: number;
    wrapS?: number;
    wrapT?: number;
    uniform: string;
  }[] = [];
  private data: Float32Array;
  // 为了画圆点做的额外处理，兼容mac系统的着色器
  private isPoint: WebGLUniformLocation | null;
  constructor(params: {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    vertices?: number[][];
    data?: Float32Array;
    attrs: Attrs;
    uniforms?: Uniforms;
    modes?: PolygonMode[];
  }) {
    const {
      gl,
      program,
      modes = ["POINTS"],
      vertices = [],
      data,
      attrs,
      uniforms = {},
    } = params;
    this.gl = gl;
    this.program = program;
    this.modes = modes;
    this.attrs = attrs;
    this.uniforms = uniforms;
    if (data) {
      this.data = data;
    } else {
      this.vertices = vertices;
      this.data = new Float32Array(this.vertices.flat());
    }
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
    if (this.vertices.length > 0) {
      this.data = new Float32Array(this.vertices.flat());
    }
    gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
  }

  private setUniform() {
    const { gl, program, uniforms } = this;
    for (const key in uniforms) {
      const location = gl.getUniformLocation(program, key);
      (gl[uniforms[key].func] as Function)(location, ...uniforms[key].args);
    }
  }

  private activeTexture() {
    const { gl, program, textures } = this;
    textures.forEach((item, index) => {
      const {
        image,
        pname = gl.TEXTURE_MIN_FILTER,
        param = gl.LINEAR,
        uniform,
        wrapS,
        wrapT,
      } = item;
      //对纹理图像垂直翻转，扫描图片时，以左下角为(0,0)，右上角为(1,1)扫描
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      //纹理单元
      gl.activeTexture(gl[`TEXTURE${index}` as "TEXTURE"]);
      //纹理对象
      const texture = gl.createTexture();
      //向target 绑定纹理数据
      gl.bindTexture(gl.TEXTURE_2D, texture);
      //配置纹理图像
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      //配置纹理参数
      gl.texParameteri(gl.TEXTURE_2D, pname, param);
      //非2次幂大小图像处理
      if (wrapS) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      }
      if (wrapT) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
      }
      gl.uniform1i(gl.getUniformLocation(program, uniform), index);
    });
  }

  draw(clear = true) {
    const { gl, modes } = this;
    if (clear) {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.bufferData();
    this.activeTexture();
    this.setUniform();
    for (let mode of modes) {
      // 为了画圆点做一些特殊处理
      gl.uniform1f(this.isPoint, mode === "POINTS" ? 1 : 0);
      gl.drawArrays(gl[mode], 0, this.data.length / this.size);
    }
  }
}
