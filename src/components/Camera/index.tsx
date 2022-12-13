import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";
import {
  Camera,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  Spherical,
  Vector2,
  Vector3,
} from "three";
// 画布尺寸
const { innerWidth, innerHeight } = window;
let webgl: WebGL;
let program: WebGLProgram;

const ratio = innerWidth / innerHeight;
let camera: Camera;
// 相机看向的目标点
const target = new Vector3();
// 视点
const eye = new Vector3(0, 0.5, 1);

// 建立正交相机
function createOrthographicCamera() {
  // 这些参数保证相机尺寸宽高比和画布一致，物体不会变形
  const halfH = 2;
  const halfW = halfH * ratio;
  const [left, right, top, bottom, near, far] = [
    -halfW,
    halfW,
    halfH,
    -halfH,
    1,
    20,
  ];
  camera = new OrthographicCamera(left, right, top, bottom, near, far);
  camera.position.copy(eye);
  target.set(0, 0, -2.5);
}

// 建立透视相机
function createPerspectiveCamera() {
  const [fov, aspect, near, far] = [50, ratio, 1, 20];
  camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.copy(eye);
  target.set(0, 0, -2.5);
}

createOrthographicCamera();

let triangle1: Polygon,
  triangle2: Polygon,
  triangle3: Polygon,
  triangle4: Polygon;
const projection = new Matrix4();

const panX = true;
const panY = true;
/**
 * 平移
 * @param vec2 鼠标移动的量
 * @returns 偏移值
 */
function pan({ x, y }: Vector2): Vector3 {
  //
  let distanceLeft = 0;
  let distanceUp = 0;
  if (camera instanceof OrthographicCamera) {
    // 相机的宽
    const cameraW = camera.right - camera.left;
    // 相机的高
    const cameraH = camera.top - camera.bottom;
    // 鼠标移动距离相对于画布尺寸的比
    const ratioX = x / innerWidth;
    const ratioY = y / innerHeight;
    distanceLeft = ratioX * cameraW;
    distanceUp = ratioY * cameraH;
  }
  if (camera instanceof PerspectiveCamera) {
    const { position, fov } = camera;
    //视线长度：相机视点到目标点的距离
    const sightLen = position.clone().sub(target).length();
    //视椎体垂直夹角的一半(弧度)
    //(fov/2)*Math.PI/180
    const halfFov = (fov * Math.PI) / 360;
    //目标平面的高度
    const targetHeight = sightLen * Math.tan(halfFov) * 2;
    //目标平面与画布的高度比
    const ratio = targetHeight / innerHeight;
    //画布位移量转目标平面位移量
    distanceLeft = x * ratio;
    distanceUp = y * ratio;
  }
  // 从相机矩阵中取出xy的对应列
  const mx = new Vector3().setFromMatrixColumn(camera.matrix, 0);
  const my = new Vector3().setFromMatrixColumn(camera.matrix, 1);
  const vx = mx.clone().multiplyScalar(-distanceLeft);
  const vy = my.clone().multiplyScalar(distanceUp);
  if (panX && !panY) return new Vector3().copy(vx);
  if (!panX && panY) return new Vector3().copy(vy);
  return new Vector3().copy(vx.add(vy));
}

const rotateX = true;
const rotateY = true;
/**
 * 旋转
 * @param vec2 鼠标移动的量
 * @returns 偏移值
 */
function rotate({ x, y }: Vector2) {
  const spherical = new Spherical();
  // 恢复到上次的位置
  spherical.setFromVector3(camera.position.clone().sub(target));
  if (rotateX) spherical.theta -= Math.PI * 2 * (x / innerWidth);
  if (rotateY) spherical.phi -= Math.PI * 2 * (y / innerHeight);
  return new Vector3().setFromSpherical(spherical);
}

// 缩放
function zoom(deltaY: number) {
  // 每滚一格缩放0.05倍左右
  const zoomScale = 0.95;
  let zoom = 0;
  if (deltaY < 0) {
    // 放大
    zoom = 1 / zoomScale;
  } else {
    // 缩小
    zoom = zoomScale;
  }
  if (camera instanceof OrthographicCamera) {
    camera.zoom *= zoom;
    camera.updateProjectionMatrix();
  }
  if (camera instanceof PerspectiveCamera) {
    camera.position.lerp(target, 1 - zoom);
  }
  draw();
}

/**
 *
 * @param params 偏移量(xy向量) 旋转量(球坐标)
 */
function draw(params: { panOffset?: Vector3; rotateOffset?: Vector3 } = {}) {
  const { panOffset, rotateOffset } = params;
  if (panOffset) {
    // 目标点和相机视点一起移动
    target.add(panOffset);
    camera.position.add(panOffset);
  }
  if (rotateOffset) {
    camera.position.copy(target.clone().add(rotateOffset));
  }
  //更新投影视图矩阵
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
  projection.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );

  webgl.ctx.clear(webgl.ctx.DEPTH_BUFFER_BIT);
  webgl.ctx.clear(webgl.ctx.COLOR_BUFFER_BIT);
  triangle4?.draw(false);
  triangle3?.draw(false);
  triangle2?.draw(false);
  triangle1?.draw(false);
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  //鼠标拖拽的起始位和结束位，无论是左键按下还是右键按下
  const [dragStart, dragEnd] = [new Vector2(), new Vector2()];
  let state: "ratate" | "pan" | "none" = "none";
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    program = webgl.createProgram(vert, frag);
    webgl.ctx.enable(webgl.ctx.DEPTH_TEST);
    createTriangles();
    draw();
  }, []);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          textAlign: "center",
          color: "white",
        }}
      >
        <label>
          Orthographic
          <input
            type="radio"
            name="camera"
            defaultChecked
            onChange={() => {
              createOrthographicCamera();
              draw();
            }}
          />
        </label>
        <label>
          Perspective
          <input
            type="radio"
            name="camera"
            onChange={() => {
              createPerspectiveCamera();
              draw();
            }}
          />
        </label>
      </div>
      <canvas
        ref={ref}
        style={{ background: "black" }}
        // 取消右键菜单
        onContextMenu={(e) => e.preventDefault()}
        // 鼠标按下
        onPointerDown={({ clientX, clientY, button }) => {
          dragStart.set(clientX, clientY);
          // 左键button=0，右键button=2
          switch (button) {
            case 2:
              state = "ratate";
              break;
            case 0:
              state = "pan";
              break;
          }
        }}
        // 鼠标抬起
        onPointerUp={() => (state = "none")}
        // 鼠标移动，鼠标移动的越快，dragStart和dragEnd的差越大
        onPointerMove={({ clientX, clientY }) => {
          dragEnd.set(clientX, clientY);
          const offset = dragEnd.clone().sub(dragStart);
          switch (state) {
            case "pan":
              draw({
                panOffset: pan(offset),
              });
              break;
            case "ratate":
              draw({
                rotateOffset: rotate(offset),
              });
              break;
          }
          dragStart.copy(dragEnd);
        }}
        // 滚动操作，往前滚是负数，往后滚是正数
        onWheel={({ deltaY }) => zoom(deltaY)}
      ></canvas>
    </>
  );
}

function createTriangles() {
  triangle1 = createTriangle(
    [1, 0, 0, 1],
    new Matrix4().setPosition(-0.5, 0, -3)
  );
  triangle2 = createTriangle(
    [1, 0, 0, 1],
    new Matrix4().setPosition(0.5, 0, -3)
  );
  triangle3 = createTriangle(
    [1, 1, 0, 1],
    new Matrix4().setPosition(-0.5, 0, -2)
  );
  triangle4 = createTriangle(
    [1, 1, 0, 1],
    new Matrix4().setPosition(0.5, 0, -2)
  );
}

function createTriangle(color: number[], modelView: Matrix4) {
  return new Polygon({
    gl: webgl.ctx,
    program: program,
    attrs: {
      my_Position: {
        size: 3,
        // prettier-ignore
        data: [
          0, 0.3, 0, 
          -0.3, -0.3, 0, 
          0.3, -0.3, 0
        ],
      },
    },
    uniforms: {
      u_Color: {
        func: "uniform4fv",
        args: [color],
      },
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
    modes: ["TRIANGLES"],
  });
}

export default App;
