import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;
let degree = 0;
let radius = 200;
let scale = 1;

function circlePoint() {
  const gl = webgl.ctx;
  const isCircle = gl.getUniformLocation(webgl.program!, "is_Circle");
  gl.uniform1f(isCircle, 1);
  // 处理y轴比例不一致问题
  const myRatio = gl.getUniformLocation(webgl.program!, "my_Ratio");
  gl.uniform1f(myRatio, webgl.coordinate.ratio);
  const myDeg = gl.getUniformLocation(webgl.program!, "my_Deg");
  const myRadius = gl.getUniformLocation(webgl.program!, "my_Radius");
  gl.uniform1f(myDeg, degree + Math.PI);
  gl.uniform1f(myRadius, webgl.coordinate.px2gl({ w: radius }).w);
  gl.drawArrays(gl.POINTS, 0, 1);
}

// lenght 三角形的边长
function rotateTriangle() {
  const gl = webgl.ctx;
  const isCircle = gl.getUniformLocation(webgl.program!, "is_Circle");
  gl.uniform1f(isCircle, 0);
  const polygon = new Polygon({
    gl,
    program: webgl.program!,
    attrs: {
      my_Position: {
        size: 2,
      },
    },
    modes: ["TRIANGLES"],
  });
  const { w, h } = webgl.coordinate.px2gl({ w: radius, h: radius });
  // 三条边每条分别旋转0度，120度，240度，构成等边三角形
  polygon.vertices = new Array(3).fill(0).map((_, index) => {
    return [
      w * Math.cos(degree + index * ((Math.PI * 2) / 3)) * scale,
      h * Math.sin(degree + index * ((Math.PI * 2) / 3)) * scale,
    ];
  });
  polygon.draw(false);
}
let shrink = true;
function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    webgl.initShaders(vert, frag);
    (function anime() {
      degree += 0.005;
      if (scale <= 0) {
        shrink = false;
      }
      if (scale >= 1) {
        shrink = true;
      }
      scale += shrink ? -0.005 : 0.005;
      circlePoint();
      rotateTriangle();
      requestAnimationFrame(anime);
    })();
  }, []);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <canvas
        ref={ref}
        style={{ position: "absolute", top: 0, left: 0 }}
      ></canvas>
      <div
        style={{
          width: radius * 2,
          height: radius * 2,
          border: "1px solid",
          borderRadius: "50%",
        }}
      ></div>
    </div>
  );
}

export default App;
