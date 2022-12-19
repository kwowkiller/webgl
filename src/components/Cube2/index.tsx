import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";
import { Matrix4, PerspectiveCamera, Ray, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 画布尺寸
const { innerWidth, innerHeight } = window;
let webgl: WebGL;
let program: WebGLProgram;
let polygon: Polygon;

const ratio = innerWidth / innerHeight;
let camera: PerspectiveCamera;
let controls: OrbitControls;
// 建立透视相机
function createPerspectiveCamera() {
  const [fov, aspect, near, far] = [50, ratio, 0.1, 1000];
  camera = new PerspectiveCamera(fov, aspect, near, far);
  // 视点
  camera.position.copy(new Vector3(-3, 2, 5));
}

createPerspectiveCamera();

const projection = new Matrix4();
const modelMatrix = new Matrix4();
let selected = false;

function draw() {
  controls.update();
  projection.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  polygon.draw(true);
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    controls = new OrbitControls(camera, canvas);
    // controls.enabled = false;
    webgl = new WebGL(canvas);
    program = webgl.createProgram(vert, frag);
    polygon = new Polygon({
      gl: webgl.ctx,
      program,
      indices: indexes,
      attrs: {
        my_Position: {
          size: 3,
          data: source,
        },
        my_Color: {
          size: 3,
          data: colors,
          offset: 3,
        },
      },
      uniforms: {
        u_ModelView: {
          func: "uniformMatrix4fv",
          args: [false, modelMatrix.elements],
        },
        u_Projection: {
          func: "uniformMatrix4fv",
          // 注意这里是引用类型
          args: [false, projection.elements],
        },
      },
      modes: ["TRIANGLES"],
    });
    webgl.ctx.enable(webgl.ctx.DEPTH_TEST);
    let theta = 0;
    (function anime() {
      if (selected) {
        theta += 0.01;
        modelMatrix.makeRotationY(theta);
      }
      draw();
      requestAnimationFrame(anime);
    })();
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ background: "black" }}
      // onClick={(event) => {
      //   const mouse = webgl.coordinate.getWorldPosition(event, projection);
      //   const triangles = getTrianglesFromCube();
      //   const selected = triangles.some((t) => {
      //     return mouseInTriangle(mouse, t);
      //   });
      //   console.log(selected);
      // }}
      onMouseMove={(event) => {
        const mouse = webgl.coordinate.getWorldPosition(event, projection);
        const triangles = getTrianglesFromCube();
        selected = triangles.some((t) => {
          return mouseInTriangle(mouse, t);
        });
      }}
    ></canvas>
  );
}

export default App;

// function mouseInTriangle(
//   mouse: Vector3,
//   triangle: [Vector3, Vector3, Vector3]
// ) {
//   const eye = camera.position;
//   const [A, B, C] = triangle;
//   const AB = new Vector3().subVectors(B, A);
//   const BC = new Vector3().subVectors(C, B);
//   // 法线
//   const N = new Vector3().crossVectors(AB, BC).normalize();
//   // 视点到鼠标的射线
//   const V = new Vector3().subVectors(mouse, eye).normalize();
//   // 交点P=((A-E)·n/v·n)*v+E
//   const P = V.clone()
//     .multiplyScalar(A.clone().sub(eye).dot(N) / V.clone().dot(N))
//     .add(eye);
//   for (let i = 0; i < 3; i++) {
//     let j = (i + 1) % 3;
//     const [a, b] = [triangle[i], triangle[j]];
//     const pa = a.clone().sub(P);
//     const ab = b.clone().sub(a);
//     // 垂线
//     const d = pa.clone().cross(ab);
//     const len = d.dot(N);
//     if (len < 0) {
//       return false;
//     }
//   }
//   return true;
// }

function mouseInTriangle(
  mouse: Vector3,
  triangle: [Vector3, Vector3, Vector3]
) {
  const ray = new Ray(camera.position).lookAt(mouse);
  const M = ray.intersectTriangle(...triangle, true, new Vector3());
  return M !== null;
}

// 将正方体表面分解成12个三角形
function getTrianglesFromCube() {
  const points: Vector3[] = [];
  for (let i of indexes) {
    points.push(
      new Vector3(source[i * 3], source[i * 3 + 1], source[i * 3 + 2])
    );
  }
  points.forEach((p) => {
    p.applyMatrix4(modelMatrix);
  });
  const triangles: [Vector3, Vector3, Vector3][] = [];
  for (let i = 0; i < points.length; i += 3) {
    triangles.push([points[i], points[i + 1], points[i + 2]]);
  }
  return triangles;
}
// prettier-ignore
const source = [
  1, 1, 1,
  -1, 1, 1,
  -1, -1, 1,
  1, -1, 1,
  1, -1, -1,
  1, 1, -1,
  -1, 1, -1,
  -1, -1, -1,
];
// prettier-ignore
const colors = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
  1, 1, 0,
  0, 1, 1,
  1, 0, 1,
  1, 1, 1,
  0, 0, 0
];
// 顶点索引集合
// prettier-ignore
const indexes = new Uint16Array([
  0, 1, 2, 0, 2, 3,    // front
  0, 3, 4, 0, 4, 5,    // right
  0, 5, 6, 0, 6, 1,    // up
  1, 6, 7, 1, 7, 2,    // left
  7, 4, 3, 7, 3, 2,    // down
  4, 7, 6, 4, 6, 5     // back
])
