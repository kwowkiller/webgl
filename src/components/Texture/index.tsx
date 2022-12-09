import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;
let program: WebGLProgram;

const maxV = 1;
const maxU = 1;
// 前两个是点坐标，后两个是图片uv坐标，uv坐标起点在图片左上角，向下和向右1个单位
const square = [
  [-0.5, 0.5, 0, 0],
  [-0.5, -0.5, 0, maxV],
  [0.5, 0.5, maxU, 0],
  [0.5, -0.5, maxU, maxV],
];

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    program = webgl.createProgram(vert, frag);
    const polygon = new Polygon({
      gl: webgl.ctx,
      program: program,
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
      polygon.textures.push({
        image,
        uniform: "u_Sampler",
        wrapS: webgl.ctx.CLAMP_TO_EDGE,
        wrapT: webgl.ctx.CLAMP_TO_EDGE,
      });
      polygon.draw();
    };
  }, []);
  return <canvas ref={ref}></canvas>;
}

export default App;
