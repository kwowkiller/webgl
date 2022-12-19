import React, { useEffect, useRef } from "react";
import { Vector3, Matrix4, OrthographicCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;
let program: WebGLProgram;
let polygon: Polygon;

let camera: OrthographicCamera;
let controls: OrbitControls;
// 建立正交相机
function createOrthographicCamera() {
  // 这些参数保证相机尺寸宽高比和画布一致，物体不会变形
  const halfH = 2;
  const halfW = halfH * (window.innerWidth / window.innerHeight);
  const [left, right, top, bottom, near, far] = [
    -halfW,
    halfW,
    halfH,
    -halfH,
    -10,
    10,
  ];
  camera = new OrthographicCamera(left, right, top, bottom, near, far);
  camera.position.set(1, 1, 1);
}
createOrthographicCamera();
const projection = new Matrix4();
const modelView = new Matrix4();

function draw() {
  controls.update();
  projection.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  polygon.draw();
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    controls = new OrbitControls(camera, canvas);
    webgl = new WebGL(canvas);
    program = webgl.createProgram(vert, frag);
    polygon = new Polygon({
      gl: webgl.ctx,
      program: program,
      attrs: {
        my_Position: {
          size: 3,
          // prettier-ignore
          data: [
            0,0,0,
            ...new Vector3(1,0,0).toArray(),
            0,0,0,
            ...new Vector3(0,1,0).applyAxisAngle(new Vector3(1,0,0), Math.PI / 4).toArray(),
            0,0,0,
            ...new Vector3(0,0,1).toArray(),
          ],
        },
        my_Color: {
          size: 3,
          offset: 3,
          // prettier-ignore
          data: [
            1,0,0,
            1,0,0,
            0,1,0,
            0,1,0,
            0,0,1,
            0,0,1,
          ],
        },
      },
      uniforms: {
        u_ModelView: {
          func: "uniformMatrix4fv",
          args: [false, modelView.elements],
        },
        u_Projection: {
          func: "uniformMatrix4fv",
          // 注意这里是引用类型
          args: [false, projection.elements],
        },
      },
      modes: ["LINES"],
    });
    let theta = 0;
    (function anime() {
      // modelView.makeRotationY(theta);
      // theta += 0.01;
      draw();
      requestAnimationFrame(anime);
    })();
  }, []);
  return <canvas ref={ref}></canvas>;
}

export default App;

// prettier-ignore
const source = [
  // back
  -0.5, -0.5, -0.5,
  -0.5, 0.5, -0.5,
  0.5, -0.5, -0.5, 
  -0.5, 0.5, -0.5,
  0.5, 0.5, -0.5, 
  0.5, -0.5, -0.5, 
  // front
  -0.5, -0.5, 0.5, 
  0.5, -0.5, 0.5, 
  -0.5, 0.5, 0.5,
  -0.5, 0.5, 0.5,
  0.5, -0.5, 0.5,
  0.5, 0.5, 0.5,
  // top
  -0.5, 0.5, -0.5,
  -0.5, 0.5, 0.5,
  0.5, 0.5, -0.5,
  -0.5, 0.5, 0.5,
  0.5, 0.5, 0.5,
  0.5, 0.5, -0.5,
  // bottom
  -0.5, -0.5, -0.5,
  0.5, -0.5, -0.5,
  -0.5, -0.5, 0.5,
  -0.5, -0.5, 0.5, 
  0.5, -0.5, -0.5, 
  0.5, -0.5, 0.5, 
  // left
  -0.5, -0.5, -0.5, 
  -0.5, -0.5, 0.5,
  -0.5, 0.5, -0.5, 
  -0.5, -0.5, 0.5, 
  -0.5, 0.5, 0.5, 
  -0.5, 0.5, -0.5,
  // right
  0.5, -0.5, -0.5,
  0.5, 0.5, -0.5, 
  0.5, -0.5, 0.5, 
  0.5, -0.5, 0.5, 
  0.5, 0.5, -0.5, 
  0.5, 0.5, 0.5, 
];
