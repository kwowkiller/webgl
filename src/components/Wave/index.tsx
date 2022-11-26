import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";
import { Matrix4, Vector3 } from "three";
import { linear, sin } from "../../api/math";
import Shape from "../../api/shape";
import { Point } from "../../api/coordinate";

let webgl: WebGL;
let polygon: Polygon;

/* x,z 方向的空间坐标极值 */
const [minPosX, maxPosX, minPosZ, maxPosZ] = [-0.7, 0.8, -1, 1];
/* x,z 方向的弧度极值 */
const [minAngX, maxAngX, minAngZ, maxAngZ] = [0, Math.PI * 4, 0, Math.PI * 2];

/* 比例尺：将空间坐标和弧度相映射 */
const scaleX = linear(minPosX, minAngX, maxPosX, maxAngX);
const scaleZ = linear(minPosZ, minAngZ, maxPosZ, maxAngZ);

function createVertices() {
  const vertices = [];
  const step = 0.03;
  for (let z = minPosZ; z < maxPosZ; z += 0.04) {
    for (let x = minPosX; x < maxPosX; x += step) {
      vertices.push([x, 0, z]);
    }
  }
  // 用shape将按顺序排布的点转换成三角形点
  const shape = new Shape(vertices.map<Point>(([x, y, z]) => ({ x, y, z })));
  return (
    shape
      .combine((maxPosX - minPosX) / step)
      .flat()
      // 最后四个rgba，给一个透明度
      .map(({ x, y, z }) => [x, y, z as number, 0, 0, 1, 0.4])
  );
}

function setViewMatrix() {
  const gl = webgl.ctx;
  const matrix = gl.getUniformLocation(webgl.program!, "my_ViewMatrix");
  gl.uniformMatrix4fv(
    matrix,
    false,
    new Matrix4().lookAt(
      new Vector3(0.2, 0.3, 1),
      new Vector3(),
      new Vector3(0, 1, 0)
    ).elements
  );
}

// 用正弦函数操作数据
function updateVertices(offset = 0) {
  const { vertices } = polygon;
  for (let i = 0; i < vertices.length; i++) {
    const [x, y, z, r, g, b, a] = vertices[i];
    const angle = scaleZ(z);
    const A = Math.sin(angle) * 0.01 + 0.03;
    const phi = scaleX(x) + offset;
    // const phi = x + offset;
    // 改变y轴位置
    vertices[i][1] = sin(A, 2, phi)(angle);
    // 改变颜色
    vertices[i][3] = Math.sin(z);
    vertices[i][4] = Math.sin(x);
  }
  polygon.draw();
}

let offset = 0;

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    webgl.initShaders(vert, frag);
    polygon = new Polygon({
      gl: webgl.ctx,
      program: webgl.program!,
      attrs: {
        my_Position: {
          size: 3,
          offset: 0,
        },
        my_Color: {
          size: 4,
          offset: 3,
        },
      },
      // x轴的宽度算出每一x轴有多少个点
      vertices: createVertices(),
      modes: ["POINTS", "LINES", "TRIANGLES"],
    });
    setViewMatrix();
    (function anime() {
      offset += 0.1;
      updateVertices(offset);
      requestAnimationFrame(anime);
    })();
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", top: 0, left: 0, background: "#000" }}
    ></canvas>
  );
}

export default App;
