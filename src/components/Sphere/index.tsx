import React, { useEffect, useRef } from "react";
import { Vector3, Matrix4, OrthographicCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";
import { Sphere } from "../../api/shape";

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
  camera.position.set(0, 0, 2);
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
  polygon.draw(true);
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const sphere = new Sphere({
      w: 64,
      h: 64,
    });
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
          data: sphere.data,
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
      indices: new Uint16Array(sphere.indices),
      modes: ["TRIANGLES"],
    });
    (function anime() {
      draw();
      requestAnimationFrame(anime);
    })();
  }, []);
  return <canvas ref={ref}></canvas>;
}

export default App;
