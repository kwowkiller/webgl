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
    data: Array<number>;
  };
}
interface Uniforms {
  [key: string]: {
    func: keyof WebGLRenderingContext;
    args: any[];
  };
}

interface Texture {
  image: any;
  wrapS?: number;
  wrapT?: number;
  uniform: string;
  params?: [number, number][];
  mipmap?: boolean;
  texture?: WebGLTexture;
}

export default class Polygon {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  modes: PolygonMode[];
  // 顶点顺序索引
  indices?: Uint8Array;
  attrs: Attrs;
  uniforms: Uniforms;
  textures: Texture[];
  // 顶点缓存
  private verticesBuffer?: WebGLBuffer;
  // 顶点索引缓存
  private indicesBuffer?: WebGLBuffer;

  data: Float32Array = new Float32Array();

  constructor(params: {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    indices?: Uint8Array;
    attrs: Attrs;
    uniforms?: Uniforms;
    textures?: Texture[];
    modes?: PolygonMode[];
  }) {
    const {
      gl,
      program,
      modes = ["POINTS"],
      indices,
      attrs,
      uniforms = {},
      textures = [],
    } = params;
    this.gl = gl;
    this.program = program;
    this.modes = modes;
    this.attrs = attrs;
    this.uniforms = uniforms;
    this.textures = textures;
    this.indices = indices;
    this.init();
  }

  // 单个顶点包含的数据长度，比如点(1,1,1,1,0,0,1)，前三个是顶点数据xyz，后四个是颜色数据rgba，长度为7
  get size() {
    return Object.values(this.attrs)
      .map((a) => a.size)
      .reduce((p, c) => p + c, 0);
  }

  // 顶点个数
  get count() {
    const attr = Object.values(this.attrs)[0];
    if (!attr) return 0;
    return attr.data.length / attr.size;
  }

  private init() {
    const { gl, program, attrs, indices } = this;
    gl.useProgram(this.program);
    if (!this.verticesBuffer) {
      this.verticesBuffer = gl.createBuffer()!;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    if (indices) {
      if (!this.indicesBuffer) {
        this.indicesBuffer = gl.createBuffer()!;
      }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    }
    // this.bufferData();
    // 固定值 4
    const { BYTES_PER_ELEMENT } = new Float32Array();
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
    const { gl, indices, attrs } = this;
    const source = new Array(this.size * this.count);
    for (const key in attrs) {
      const { data, size, offset = 0 } = attrs[key];
      for (let i = 0; i < this.count; i++) {
        source.splice(
          i * this.size + offset,
          size,
          ...data.slice(i * size, i * size + size)
        );
      }
    }
    this.data = new Float32Array(source);
    if (indices && indices.length > 0) {
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
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
        // pname = gl.TEXTURE_MIN_FILTER,
        // param = gl.LINEAR,
        params = [],
        mipmap,
        uniform,
        wrapS,
        wrapT,
      } = item;
      gl.uniform1i(gl.getUniformLocation(program, uniform), index);
      // 已经绑定过纹理
      if (item.texture) {
        gl.bindTexture(gl.TEXTURE_2D, item.texture);
        return;
      }
      //纹理单元
      gl.activeTexture(gl[`TEXTURE${index}` as "TEXTURE"]);
      //纹理对象
      item.texture = gl.createTexture()!;
      //向target 绑定纹理数据
      gl.bindTexture(gl.TEXTURE_2D, item.texture);
      //配置纹理图像
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        image
      );
      if (mipmap) {
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      //配置纹理参数
      // if (params.length > 0) {
      //   params.forEach(([pname, param]) =>
      //     gl.texParameteri(gl.TEXTURE_2D, pname, param)
      //   );
      // }
      //非2次幂大小图像处理
      if (wrapS) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      }
      if (wrapT) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
      }
    });
  }

  draw(clear = false) {
    const { gl, modes, indices } = this;
    this.init();
    if (clear) {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.bufferData();
    this.setUniform();
    this.activeTexture();
    for (let mode of modes) {
      if (indices && indices.length > 0) {
        gl.drawElements(gl[mode], indices.length, gl.UNSIGNED_BYTE, 0);
      } else {
        gl.drawArrays(gl[mode], 0, this.data.length / this.size);
      }
    }
  }
}
