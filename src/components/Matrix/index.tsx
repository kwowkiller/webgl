import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;
let program: WebGLProgram;

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
          data: [
            [-0.1, 0.1],
            [-0.1, -0.1],
            [0.1, 0.1],
            [0.1, -0.1],
          ].flat(),
        },
      },
      modes: ["TRIANGLE_STRIP"],
    });
    polygon.draw();
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", top: 0, left: 0 }}
    ></canvas>
  );
}

export default App;
