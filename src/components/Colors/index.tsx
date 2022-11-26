import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;

const points = [
  [0, 0.4, 0],
  [-0.2, -0.1, 0],
  [0.2, -0.1, 0],
];
const colors = [
  [0, 0, 1, 1],
  [0, 1, 0, 1],
  [1, 0, 0, 1],
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
          size: 3,
          offset: 0
        },
        my_Color: {
          size: 4,
          offset: 3
        },
      },
      vertices: [
        [...points[0], ...colors[0]],
        [...points[1], ...colors[1]],
        [...points[2], ...colors[2]],
      ],
      modes: ["TRIANGLES"]
    });
    polygon.draw();
  }, []);
  return <canvas ref={ref}></canvas>;
}

export default App;
