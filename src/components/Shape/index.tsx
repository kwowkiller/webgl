import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";
import { Point } from "../../api/coordinate";
import Shape from "../../api/shape";

let webgl: WebGL;
let program: WebGLProgram;

// 画一个以原点为中心，width为宽的正方形，width为px，绝对大小
function square(width: number) {
  const { coordinate } = webgl;
  // 处理px单位，转化为webgl坐标，webgl的坐标是-1到1，也就是2个单位长度
  // 因为是以原点为中心，即左边一半宽度，右边一半宽度，加起来就是width的宽度
  // 下面代码等同于 (width / (coordinate.w / 2)) / 2，得到的其实是正方形一半的宽度
  const half = width / coordinate.w;
  const point: Point = { x: half, y: coordinate.ratio * half };
  const polygon = new Polygon({
    gl: webgl.ctx,
    program: program,
    attrs: {
      my_Position: {
        size: 2,
        // 按2-3-4-1象限的顺序
        data: [2, 3, 4, 1, 2]
          .map((q) => coordinate.quadrantChange(point, q))
          .map((p) => [p.x, p.y])
          .flat(),
      },
    },
    uniforms: {
      my_Color: {
        func: "uniform4f",
        args: [0, 1, 0, 1],
      },
    },
    modes: ["POINTS", "LINE_STRIP"],
  });
  polygon.draw(false);
}

// 画一个复杂图案，一个以原点为中心的螺旋正方形
async function spiral() {
  const points: Point[] = [
    [0, 0],
    [0, -0.1],
    [-0.1, -0.1],
    [-0.1, 0.1],
    [0.3, 0.1],
    [0.3, -0.3],
    [-0.3, -0.3],
    [-0.3, 0.3],
    [0.3, 0.3],
    [0.3, 0.2],
    [-0.2, 0.2],
    [-0.2, -0.2],
    [0.2, -0.2],
    [0.2, 0],
    [0, 0],
  ].map(([x, y]) => ({ x, y: y * webgl.coordinate.ratio }));
  const polygon = new Polygon({
    gl: webgl.ctx,
    program: program,
    attrs: {
      my_Position: {
        size: 2,
        data: points.map((p) => [p.x, p.y]).flat()
      },
    },
    modes: ["POINTS", "LINE_STRIP"],
  });
  polygon.draw(false);
  const triangles: Point[] = [];
  new Shape(points).resolve().forEach((t) => {
    triangles.push(...t);
  });
  // console.log(triangles);
  polygon.modes = ["TRIANGLES"];
  for (let i = 0; i < triangles.length; i += 3) {
    const myColor = webgl.ctx.getUniformLocation(program, "my_Color");
    webgl.ctx.uniform4f(
      myColor,
      Math.random(),
      Math.random(),
      Math.random(),
      1
    );
    polygon.attrs.my_Position.data = triangles.slice(i, i + 3).map((p) => [p.x, p.y]).flat();
    // polygon.vertices.push(...triangles.slice(i, i + 3).map((p) => [p.x, p.y]));
    polygon.draw(false);
    // await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
  }
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    program = webgl.createProgram(vert, frag);
    square(600);
    spiral().then();
  }, []);
  return <canvas ref={ref}></canvas>;
}

export default App;
