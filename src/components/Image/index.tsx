import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import border_vert from "./border.vert";
import border_frag from "./border.frag";
import image_vert from "./image.vert";
import image_frag from "./image.frag";
import Polygon from "../../api/polygon";
import { Matrix4, OrthographicCamera, Vector2, Vector3 } from "three";
import Coordinate from "../../api/coordinate";

let webgl: WebGL;
let polygonBorder: Polygon;
let polygonImage: Polygon;
const vertices = [
  [-0.5, 0.5],
  [-0.5, -0.5],
  [0.5, 0.5],
  [0.5, -0.5],
];

let state: "ratate" | "pan" | "none" = "none";
const { innerWidth, innerHeight } = window;
const ratio = innerWidth / innerHeight;
let camera: OrthographicCamera;
// 建立正交相机
(function () {
  // 这些参数保证相机尺寸宽高比和画布一致，物体不会变形
  const halfH = 2;
  const halfW = halfH * ratio;
  const [left, right, top, bottom, near, far] = [
    -halfW,
    halfW,
    halfH,
    -halfH,
    1,
    8,
  ];
  camera = new OrthographicCamera(left, right, top, bottom, near, far);
  camera.position.copy(new Vector3(0, 0, 2));
  camera.lookAt(new Vector3());
})();
const pvMatrix = camera.projectionMatrix
  .clone()
  .multiply(camera.matrixWorldInverse);
const modelMatrix = new Matrix4();

const [dragStart, dragEnd] = [new Vector2(), new Vector2()];
let angleStart = 0;
let keyCode: "Alt" | "Shift" | string = "";
document.onkeydown = function (event) {
  keyCode = event.key as any;
};
document.onkeyup = function () {
  keyCode = "";
};
let corner = {
  i: 0,
  v: new Vector2(),
};

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    const programBorder = webgl.createProgram(border_vert, border_frag);
    const programImage = webgl.createProgram(image_vert, image_frag);

    const image = new Image();
    image.src = "/assets/256.jpeg";
    image.onload = function () {
      polygonBorder = new Polygon({
        gl: webgl.ctx,
        program: programBorder,
        attrs: {
          my_Position: {
            size: 2,
            data: [
              ...vertices[0],
              ...vertices[1],
              ...vertices[2],
              ...vertices[3],
            ],
          },
        },
        uniforms: {
          u_Pv: {
            func: "uniformMatrix4fv",
            args: [false, pvMatrix.elements],
          },
          u_Model: {
            func: "uniformMatrix4fv",
            args: [false, modelMatrix.elements],
          },
        },
        indices: new Uint8Array([0, 1, 3, 2]),
        modes: ["POINTS", "LINE_LOOP"],
      });

      polygonImage = new Polygon({
        gl: webgl.ctx,
        program: programImage,
        attrs: {
          my_Position: {
            size: 2,
            data: [
              ...vertices[0],
              ...vertices[1],
              ...vertices[2],
              ...vertices[3],
            ],
          },
          my_Pin: {
            size: 2,
            offset: 2,
            data: [0, 1, 0, 0, 1, 1, 1, 0],
          },
        },
        uniforms: {
          u_Pv: {
            func: "uniformMatrix4fv",
            args: [false, pvMatrix.elements],
          },
          u_Model: {
            func: "uniformMatrix4fv",
            args: [false, modelMatrix.elements],
          },
        },
        modes: ["TRIANGLE_STRIP"],
      });
      polygonImage.textures.push({
        image: image,
        uniform: "u_Image",
      });
      draw();
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ background: "#000" }}
      onMouseMove={(event) => {
        const { x, y } = webgl.coordinate.getWorldPosition(event, pvMatrix);
        const mouse = new Vector2(x, y);
        switch (state) {
          case "pan": {
            dragEnd.copy(mouse);
            const offset = dragEnd.clone().sub(dragStart);
            ref.current!.style.cursor = "move";
            draw({
              panOffset: offset,
            });
            dragStart.copy(dragEnd);
            break;
          }
          case "ratate": {
            ref.current!.style.cursor = "alias";
            const offset = mouse.sub(getRotateCenter());
            const angleEnd = Math.atan2(offset.y, offset.x);
            draw({ angle: angleEnd - angleStart });
            break;
          }
          default:
            if (mouseInImage(mouse)) {
              ref.current!.style.cursor = "move";
            } else if (mouseNearCorner(mouse) !== null) {
              ref.current!.style.cursor = "alias";
            } else {
              ref.current!.style.cursor = "default";
            }
        }
      }}
      onMouseDown={(event) => {
        const { x, y } = webgl.coordinate.getWorldPosition(event, pvMatrix);
        const mouse = new Vector2(x, y);
        if (mouseInImage(mouse)) {
          state = "pan";
          dragStart.copy(mouse);
        } else {
          const index = mouseNearCorner(mouse);
          if (index !== null) {
            corner.i = index;
            corner.v.set(vertices[index][0], vertices[index][1]);
            state = "ratate";
            const { x, y } = mouse.sub(getRotateCenter());
            angleStart = Math.atan2(y, x);
          }
        }
      }}
      onMouseUp={() => {
        updateVertices();
        state = "none";
      }}
      onWheel={({ deltaY }) => {
        draw({ zoom: deltaY });
        updateVertices();
      }}
    ></canvas>
  );
}

function updateVertices() {
  // 更新 vertices 数组数据
  vertices.forEach((v) => {
    const { x, y } = new Vector3(v[0], v[1], 0).applyMatrix4(modelMatrix);
    v[0] = x;
    v[1] = y;
  });
  // 重置变化矩阵
  panMatrix.elements[12] = 0;
  panMatrix.elements[13] = 0;
  rotateMatrix.makeRotationZ(0);
  zoomMatrix.makeScale(1, 1, 1);
  //  更新顶点信息
  const copy = [...vertices[0], ...vertices[1], ...vertices[2], ...vertices[3]];
  polygonBorder.attrs.my_Position.data = copy;
  polygonImage.attrs.my_Position.data = copy;
}

// 鼠标是否在图片里，将图片分成两个三角形，判断点是否在三角形内
function mouseInImage(mouse: Vector2) {
  const [leftTop, leftBottom, rightTop, rightBottom] = vertices;
  const leftTriangle = [leftTop, leftBottom, rightTop].map(([x, y]) => ({
    x,
    y,
  }));
  const rightTriangle = [rightBottom, leftBottom, rightTop].map(([x, y]) => ({
    x,
    y,
  }));
  return (
    Coordinate.inTriangle(mouse, leftTriangle as any) ||
    Coordinate.inTriangle(mouse, rightTriangle as any)
  );
}

// 鼠标是否靠近顶点，返回靠近的顶点的方位下标
function mouseNearCorner(mouse: Vector2) {
  let index = 0;
  for (const [x, y] of vertices) {
    if (mouse.distanceTo(new Vector2(x, y)) < 0.15) {
      // 世界坐标
      return index;
    }
    index++;
  }
  return null;
}

// 获取旋转中心
function getRotateCenter() {
  // 绕顶点旋转
  if (keyCode === "Alt") {
    //返回当前鼠标选中的顶点的斜对面点
    let v = [0, 0];
    switch (corner.i) {
      case 0: // 左上返回右下
        v = vertices[3];
        break;
      case 1: // 左下返回右上
        v = vertices[2];
        break;
      case 2: // 右上返回左下
        v = vertices[1];
        break;
      case 3: // 右下返回左上
        v = vertices[0];
        break;
    }
    return new Vector2(v[0], v[1]);
  }
  // 绕图片中心旋转
  const [lt, , , rb] = vertices;
  const x = (lt[0] + rb[0]) / 2;
  const y = (lt[1] + rb[1]) / 2;
  return new Vector2(x, y);
}

const panMatrix = new Matrix4();
const rotateMatrix = new Matrix4();
const zoomMatrix = new Matrix4();
function draw(
  params: { panOffset?: Vector2; angle?: number; zoom?: number } = {}
) {
  const m1 = new Matrix4();
  const m2 = new Matrix4();
  const center = getRotateCenter();
  m1.setPosition(center.x, center.y, 0);
  m2.setPosition(-center.x, -center.y, 0);

  let { panOffset, angle, zoom } = params;
  if (panOffset) {
    panMatrix.elements[12] += panOffset.x;
    panMatrix.elements[13] += panOffset.y;
  }
  if (angle) {
    rotateMatrix.makeRotationZ(angle);
  }
  if (zoom) {
    if (zoom < 0) {
      zoomMatrix.makeScale(1.01, 1.01, 1);
    } else {
      zoomMatrix.makeScale(0.99, 0.99, 1);
    }
  }
  modelMatrix.copy(
    m1
      .clone()
      .multiply(panMatrix)
      .multiply(rotateMatrix)
      .multiply(zoomMatrix)
      .multiply(m2)
  );
  polygonBorder.draw();
  polygonImage.draw();
}

export default App;
