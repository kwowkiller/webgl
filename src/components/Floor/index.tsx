import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";
import { Matrix4, PerspectiveCamera, Plane, Ray, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 画布尺寸
const { innerWidth, innerHeight } = window;
let webgl: WebGL;
let objects: Polygon[] = [];

const ratio = innerWidth / innerHeight;
let camera: PerspectiveCamera;
let controls: OrbitControls;
// 建立透视相机
function createPerspectiveCamera() {
  const [fov, aspect, near, far] = [50, ratio, 0.1, 1000];
  camera = new PerspectiveCamera(fov, aspect, near, far);
  // 视点
  camera.position.copy(new Vector3(-0.5, 3, 3));
}
createPerspectiveCamera();
const projection = new Matrix4();

function draw() {
  webgl.ctx.clear(webgl.ctx.COLOR_BUFFER_BIT);
  controls.update();
  projection.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  objects.forEach((item) => item.draw());
}

function createObject(index: number, image: HTMLImageElement) {
  const program = webgl.createProgram(vert, frag);
  const object = new Polygon({
    gl: webgl.ctx,
    program,
    attrs: {
      my_Position: {
        size: 3,
        // prettier-ignore
        data: [
          0.5, 0, 0.5,
          -0.5, 0, 0.5,
          0.5, 0, -0.5, 
          -0.5, 0, -0.5
        ],
      },
      my_Pin: {
        size: 2,
        offset: 3,
        data: [0, 0, 0, 1, 1, 0, 1, 1],
      },
    },
    textures: [{ image, uniform: "u_Sampler" }],
    uniforms: {
      u_Projection: {
        func: "uniformMatrix4fv",
        args: [false, projection.elements],
      },
      u_ModelView: {
        func: "uniformMatrix4fv",
        args: [
          false,
          new Matrix4().makeTranslation(0, index * 0.5, 0).elements,
        ],
      },
    },
    modes: ["TRIANGLE_STRIP"],
  });
  objects.push(object);
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    controls = new OrbitControls(camera, canvas);
    webgl = new WebGL(canvas);
    Promise.all(
      [-2, -1, 1, 2, 3, 0].map((item, index) =>
        getImage(`/assets/floor/${item}.png`).then((image) => ({
          index,
          image,
        }))
      )
    ).then((images) => {
      // createObject(1, images[0].image);
      images.forEach(({ index, image }) => createObject(index, image));
    });
    (function anime() {
      draw();
      requestAnimationFrame(anime);
    })();
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ background: "black" }}
      onClick={(event) => {
        getFloor(event);
      }}
    ></canvas>
  );
}

export default App;

function getImage(src: string) {
  return new Promise<HTMLImageElement>((reslove) => {
    const image = new Image();
    image.src = src;
    image.onload = function () {
      reslove(image);
    };
  });
}

function getFloor(event: { clientX: number; clientY: number }) {
  const mouse = webgl.coordinate.getWorldPosition(event, projection);
  let selected = -1;
  objects.forEach((object, index) => {
    const modelMatrix = new Matrix4().fromArray(
      object.uniforms.u_ModelView.args[1]
    );
    const vertices = object.attrs.my_Position.data;
    const A = new Vector3(vertices[0], vertices[1], vertices[2]).applyMatrix4(
      modelMatrix
    );
    const B = new Vector3(vertices[3], vertices[4], vertices[5]).applyMatrix4(
      modelMatrix
    );
    const C = new Vector3(vertices[6], vertices[7], vertices[8]).applyMatrix4(
      modelMatrix
    );
    const D = new Vector3(vertices[9], vertices[10], vertices[11]).applyMatrix4(
      modelMatrix
    );
    const ray = new Ray(camera.position).lookAt(mouse);
    const M =
      ray.intersectTriangle(A, B, C, false, new Vector3()) ||
      ray.intersectTriangle(B, C, D, false, new Vector3());
    if (M !== null) {
      selected = index;
    }
  });
  if (selected !== -1) {
    const matrix = new Matrix4();
    matrix.makeScale(2, 1, 2);
    matrix.elements[13] = selected * 0.5;
    console.log(matrix.elements);
    objects[selected].uniforms.u_ModelView.args[1] = matrix.elements;
  }
}
