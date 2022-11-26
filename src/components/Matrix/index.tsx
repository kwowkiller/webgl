import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;

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
        },
      },
      vertices: [
        [-0.1, 0.1],
        [-0.1, -0.1],
        [0.1, 0.1],
        [0.1, -0.1],
      ].map(([x, y]) => [x, y]),
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