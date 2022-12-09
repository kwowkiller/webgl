import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";
import { Track } from "../../api/anime";

let webgl: WebGL;
let program: WebGLProgram;
// prettier-ignore
const source = new Float32Array([
  -0.4, 0.8, 0, 1,
  -0.4, -0.8, 0, 0,
  0.4, 0.8, 1, 1,
  0.4, -0.8, 1, 0,
]);

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    program = webgl.createProgram(vert, frag);
    const polygon = new Polygon({
      gl: webgl.ctx,
      program: program,
      attrs: {
        my_Position: {
          size: 2,
          offset: 0,
        },
        my_Pin: {
          size: 2,
          offset: 2,
        },
      },
      data: source,
      modes: ["TRIANGLE_STRIP"],
    });

    const fade = {
      ratio: 0,
    };
    const track = new Track(fade);
    // track.duration = 5000;
    track.framesMap = new Map([
      [
        "ratio",
        [
          [0, 0],
          [track.duration, 1],
        ],
      ],
    ]);

    Promise.all([
      getImage("/assets/blend/dress.jpg"),
      getImage("/assets/blend/mask-dress.jpg"),
      getImage("/assets/blend/pattern0.jpg"),
      getImage("/assets/blend/pattern1.jpg"),
      getImage("/assets/blend/pattern2.jpg"),
      getImage("/assets/blend/pattern3.jpg"),
      getImage("/assets/blend/pattern4.jpg"),
    ]).then((values) => {
      const [dress, mask, ...patterns] = values;
      polygon.textures.push(
        {
          image: dress,
          uniform: "u_Dress",
        },
        {
          image: mask,
          uniform: "u_Mask",
        },
        {
          image: patterns[0],
          uniform: "u_Pattern0",
        },
        {
          image: patterns[1],
          uniform: "u_Pattern1",
        }
      );
      let index = 1;
      track.onEnd = function () {
        if (index >= patterns.length) {
          index = 0;
        }
        fade.ratio = 0;
        this.restart();
        polygon.textures[2] = {
          image: patterns[index],
          uniform: "u_Pattern0",
        };
        polygon.textures[3] = {
          image: patterns[index + 1 >= patterns.length ? 0 : index + 1],
          uniform: "u_Pattern1",
        };
        index++;
      };

      (function anime() {
        // 这一行要放上面，避免微小的数值误差造成的闪烁
        track.update(new Date().getTime());
        polygon.uniforms = {
          u_Ratio: {
            func: "uniform1f",
            args: [fade.ratio],
          },
        };
        polygon.draw(false);
        requestAnimationFrame(anime);
      })();
    });
  }, []);
  return <canvas ref={ref}></canvas>;
}

function getImage(src: string) {
  return new Promise<HTMLImageElement>((reslove) => {
    const image = new Image();
    image.src = src;
    image.onload = function () {
      reslove(image);
    };
  });
}

export default App;
