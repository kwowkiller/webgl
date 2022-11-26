import React, { useEffect, useRef, useState } from "react";
import { Vector3, Matrix4, Vector4 } from "three";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;
let polygon: Polygon;
let theta = 0;
const width = 0.3;

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [camera, setCamera] = useState({
    x: 0.07,
    y: 0.07,
    z: 0.5,
    u: 0,
    v: 0,
    w: 0,
  });
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas, 600);
    webgl.initShaders(vert, frag);
    // webgl.ctx.enable(webgl.ctx.CULL_FACE);
    // webgl.ctx.enable(webgl.ctx.DEPTH_TEST);

    const front = [
      [-width, width, width],
      [-width, -width, width],
      [width, width, width],
      [width, -width, width],
      [-width, width, width],
      [width, width, width],
      [-width, -width, width],
      [width, -width, width],
    ];
    const back = front.map(([x, y, z]) => [x, y, -z]);
    const top = [
      [-width, width, width],
      [width, width, width],
      [-width, width, -width],
      [width, width, -width],
      [-width, width, width],
      [-width, width, -width],
      [width, width, width],
      [width, width, -width],
    ];
    const bottom = top.map(([x, y, z]) => [x, -y, z]);
    const left = [
      [-width, width, width],
      [-width, -width, width],
      [-width, width, -width],
      [-width, -width, -width],
      [-width, width, width],
      [-width, width, -width],
      [-width, -width, width],
      [-width, -width, -width],
    ];
    const right = left.map(([x, y, z]) => [-x, y, z]);
    polygon = new Polygon({
      gl: webgl.ctx,
      program: webgl.program!,
      attrs: {
        my_Position: {
          size: 3,
        },
      },
      vertices: [...front, ...back, ...top, ...bottom, ...left, ...right],
      modes: ["LINES"],
    });

    (function anime() {
      // theta += 0.01;
      const modelMatrix = polygon.gl.getUniformLocation(
        webgl.program!,
        "my_Model"
      );
      polygon.gl.uniformMatrix4fv(
        modelMatrix,
        false,
        new Matrix4().makeRotationY(theta).elements
        // new Matrix4().elements,
      );
      polygon.draw();
      // requestAnimationFrame(anime);
    })();
  }, []);
  useEffect(() => {
    const viewMatrix = polygon.gl.getUniformLocation(
      webgl.program!,
      "my_Camera"
    );
    const { x, y, z, u, v, w } = camera;
    polygon.gl.uniformMatrix4fv(
      viewMatrix,
      false,
      getViewMatrix(
        new Vector3(x, y, z),
        // 目标点，0,0,0就是原点，就是这个正方体的中心
        new Vector3(u, v, w),
        new Vector3(0, 1, 0)
      )
      // new Matrix4().elements,
    );
    polygon.draw();
  }, [camera]);
  return (
    <>
      <canvas ref={ref}></canvas>
      <div
        style={{ display: "flex", width: "100%", flexWrap: "wrap", flex: 1 }}
      >
        {Object.keys(camera).map((key) => (
          <label key={key} style={{ textAlign: "center", width: "33%" }}>
            <span style={{ display: "block" }}>
              {key}: {camera[key as "x"]}
            </span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={camera[key as "x"]}
              onChange={(event) => {
                camera[key as "x"] = Number(event.target.value);
                setCamera({ ...camera });
              }}
            />
          </label>
        ))}
      </div>
    </>
  );
}
/**
 * 摄像机通过一个矩阵变换到原点，再用这个矩阵的逆乘以观察物，就得到了摄像机变化的效果
 * @param e 视点
 * @param t 目标点
 * @param u 辅助向量，用来求上方向
 * @returns 摄像机的正交旋转矩阵*位移矩阵
 */
function getViewMatrix(e: Vector3, t: Vector3, u: Vector3) {
  //基向量c，视线
  const c = new Vector3().subVectors(e, t).normalize();
  //基向量a，视线和上方向的垂线
  const a = new Vector3().crossVectors(u, c).normalize();
  //基向量b，修正上方向
  const b = new Vector3().crossVectors(c, a).normalize();
  //正交旋转矩阵
  // prettier-ignore
  const mr = new Matrix4().set(
    a.x, a.y, a.z, 0,
    b.x, b.y, b.z, 0,
    -c.x, -c.y, -c.z, 0,
    0, 0, 0, 1
  )
  //位移矩阵
  // prettier-ignore
  const mt = new Matrix4().set(
    1, 0, 0, -e.x,
    0, 1, 0, -e.y,
    0, 0, 1, -e.z,
    0, 0, 0, 1
  )
  return mr.multiply(mt).elements;
}
// getViewMatrix的简化版
function lookAt(e: Vector3, t: Vector3, u: Vector3) {
  //目标点到视点的向量
  const d = new Vector3().subVectors(e, t);
  d.normalize();
  //d和上方向的垂线
  const a = new Vector3().crossVectors(u, d);
  a.normalize();
  //d和a的垂线
  const b = new Vector3().crossVectors(d, a);
  b.normalize();
  //c 基于d取反
  const c = new Vector3(-d.x, -d.y, -d.z);
  // prettier-ignore
  return [
     a.x, b.x, c.x, 0,
     a.y, b.y, c.y, 0,
     a.z, b.z, c.z, 0,
     0, 0, 0, 1
   ]
}

export default App;
