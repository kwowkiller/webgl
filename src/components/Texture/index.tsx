import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;

const maxV = 1;
const maxU = 1;
// 前两个是点坐标，后两个是图片uv坐标，uv坐标起点在图片左上角，向下和向右1个单位
const square = [
  [-0.5, 0.5, 0, 0],
  [-0.5, -0.5, 0, maxV],
  [0.5, 0.5, maxU, 0.0],
  [0.5, -0.5, maxU, maxV],
];

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    webgl.initShaders(vert, frag);
    const polygon = new Polygon({
      gl: webgl.ctx,
      program: webgl.program!,
      attrs: {
        my_Position: {
          size: 2,
          offset: 0,
        },
        // 定位图片
        my_Pin: {
          size: 2,
          offset: 2,
        },
      },
      vertices: square,
      modes: ["TRIANGLE_STRIP"],
    });
    const image = new Image();
    // 默认只能显示2的n次幂大小的图片，比如128*128，256*256
    // image.src = "/assets/256.jpeg";
    image.src = "/assets/1080.jpeg";
    image.onload = function () {
      const gl = polygon.gl;
      //对纹理图像垂直翻转
      // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      //纹理单元
      gl.activeTexture(gl.TEXTURE0);
      //纹理对象
      const texture = gl.createTexture();
      //向target 绑定纹理数据
      gl.bindTexture(gl.TEXTURE_2D, texture);
      //配置纹理图像
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      //配置纹理参数
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // 非2次幂大小图像处理
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(polygon.program, "u_Sampler"), 0);
      polygon.draw();
    };
  }, []);
  return <canvas ref={ref}></canvas>;
}

export default App;
