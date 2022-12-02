import React, { useEffect, useRef, useState } from "react";
import { Vector3, Matrix4, Vector4 } from "three";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;
let polygon: Polygon;
let theta = 0;

//数据源
// prettier-ignore
const source = new Float32Array([
  // back
  -0.5, -0.5, -0.5, 0, 0,
  -0.5, 0.5, -0.5, 0, 0.5,
  0.5, -0.5, -0.5, 0.25, 0,
  -0.5, 0.5, -0.5, 0, 0.5,
  0.5, 0.5, -0.5, 0.25, 0.5,
  0.5, -0.5, -0.5, 0.25, 0,
  // front
  -0.5, -0.5, 0.5, 0.25, 0,
  0.5, -0.5, 0.5, 0.5, 0,
  -0.5, 0.5, 0.5, 0.25, 0.5,
  -0.5, 0.5, 0.5, 0.25, 0.5,
  0.5, -0.5, 0.5, 0.5, 0,
  0.5, 0.5, 0.5, 0.5, 0.5,
  // top
  -0.5, 0.5, -0.5, 0.5, 0,
  -0.5, 0.5, 0.5, 0.5, 0.5,
  0.5, 0.5, -0.5, 0.75, 0,
  -0.5, 0.5, 0.5, 0.5, 0.5,
  0.5, 0.5, 0.5, 0.75, 0.5,
  0.5, 0.5, -0.5, 0.75, 0,
  // bottom
  -0.5, -0.5, -0.5, 0, 0.5,
  0.5, -0.5, -0.5, 0.25, 0.5,
  -0.5, -0.5, 0.5, 0, 1,
  -0.5, -0.5, 0.5, 0, 1,
  0.5, -0.5, -0.5, 0.25, 0.5,
  0.5, -0.5, 0.5, 0.25, 1,
  // left
  -0.5, -0.5, -0.5, 0.25, 0.5,
  -0.5, -0.5, 0.5, 0.25, 1,
  -0.5, 0.5, -0.5, 0.5, 0.5,
  -0.5, -0.5, 0.5, 0.25, 1,
  -0.5, 0.5, 0.5, 0.5, 1,
  -0.5, 0.5, -0.5, 0.5, 0.5,
  // right
  0.5, -0.5, -0.5, 0.5, 0.5,
  0.5, 0.5, -0.5, 0.75, 0.5,
  0.5, -0.5, 0.5, 0.5, 1,
  0.5, -0.5, 0.5, 0.5, 1,
  0.5, 0.5, -0.5, 0.75, 0.5,
  0.5, 0.5, 0.5, 0.75, 1,
]);

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [camera, setCamera] = useState({
    x: 0.07,
    y: 0.07,
    z: 0.5,
    u: 0,
    v: 0,
    w: 0,
    r: 0,
    s: 1,
    t: 0,
  });
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas, 600);
    webgl.initShaders(vert, frag);
    webgl.ctx.enable(webgl.ctx.CULL_FACE);
    webgl.ctx.enable(webgl.ctx.DEPTH_TEST);
    polygon = new Polygon({
      gl: webgl.ctx,
      program: webgl.program!,
      attrs: {
        my_Position: {
          size: 3,
        },
        my_Pin: {
          size: 2,
          offset: 3,
        },
      },
      data: source,
      modes: ["TRIANGLES"],
    });

    const image = new Image();
    image.src = "/assets/mf2.jpg";
    image.onload = function () {
      const gl = polygon.gl;
      //对纹理图像垂直翻转
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      //纹理单元
      gl.activeTexture(gl.TEXTURE0);
      //纹理对象
      const texture = gl.createTexture();
      //向target 绑定纹理数据
      gl.bindTexture(gl.TEXTURE_2D, texture);
      //配置纹理图像
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      //配置纹理参数
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // 非2次幂大小图像处理
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(polygon.program, "u_Sampler"), 0);

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
        polygon.draw(false);
        // requestAnimationFrame(anime);
      })();
    };
  }, []);
  useEffect(() => {
    const viewMatrix = polygon.gl.getUniformLocation(
      webgl.program!,
      "my_Camera"
    );
    const { x, y, z, u, v, w, r, s, t } = camera;
    polygon.gl.uniformMatrix4fv(
      viewMatrix,
      false,
      new Matrix4().lookAt(
        new Vector3(x, y, z),
        // 目标点，0,0,0就是原点，就是这个正方体的中心
        new Vector3(u, v, w),
        new Vector3(r, s, t)
      ).elements
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

export default App;
