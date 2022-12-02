import React, { useEffect, useRef } from "react";
import { Color } from "three";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import { Compose, Track } from "../../api/anime";
import { Point } from "../../api/coordinate";

interface Star extends Point {
  color: Color;
  size: number;
  alpha: number;
}

let webgl: WebGL;
const compose = new Compose();
const stars: Star[] = [];

function renderCanvas() {
  webgl.ctx.clearColor(0, 0, 0, 0);
  webgl.ctx.clear(webgl.ctx.COLOR_BUFFER_BIT);
  stars.forEach(({ x, y, size, color, alpha }) => {
    const myColor = webgl.ctx.getUniformLocation(webgl.program!, "my_Color");
    webgl.ctx.uniform4f(myColor, color.r, color.g, color.b, alpha);
    const mySize = webgl.ctx.getAttribLocation(webgl.program!, "my_Size");
    webgl.ctx.vertexAttrib1f(mySize, size);
    const myPosition = webgl.ctx.getAttribLocation(
      webgl.program!,
      "my_Position"
    );
    webgl.ctx.vertexAttrib2f(myPosition, x, y);
    webgl.ctx.drawArrays(webgl.ctx.POINTS, 0, 1);
  });
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    webgl.initShaders(vert, frag);
    // const color = new Color("rgba(255,0,0,1)");
    // webgl.ctx.clearColor(color.r, color.g, color.b, 1);
    // webgl.ctx.clear(webgl.ctx.COLOR_BUFFER_BIT);
    // (function changeColor() {
    //   color.offsetHSL(0.005, 0, 0);
    //   webgl.ctx.clearColor(color.r, color.g, color.b, 1);
    //   webgl.ctx.clear(webgl.ctx.COLOR_BUFFER_BIT);
    //   requestAnimationFrame(changeColor);
    // })();
    (function render() {
      compose.update(new Date().getTime());
      renderCanvas();
      requestAnimationFrame(render);
    })();
  }, []);
  return (
    <canvas
      style={{
        backgroundImage:
          "url(https://img.1ppt.com/uploads/allimg/2009/1_200915192356_1.JPG)",
        backgroundSize: "cover",
      }}
      ref={ref}
      onClick={(event) => {
        const star: Star = {
          ...webgl.coordinate.mouseToWebGL(event),
          size: Math.random() * 20 + 5,
          color: new Color(
            `rgb(${Math.ceil(Math.random() * 255)},${Math.ceil(
              Math.random() * 255
            )},0)`
          ),
          alpha: 0,
        };
        stars.push(star);

        const track = new Track(star);
        track.repeat = true;
        track.framesMap = new Map([
          [
            "alpha",
            [
              [0, 0],
              [500, 0.25],
              [1500, 0.75],
              [track.duration, 1],
            ],
          ],
        ]);
        compose.add(track);
      }}
    ></canvas>
  );
}

export default App;
