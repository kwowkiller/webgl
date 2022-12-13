import React, { useEffect, useRef, useState } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";

let webgl: WebGL;
let program: WebGLProgram;
let polygon: Polygon;
let thread = 0;

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  const types = [
    { label: "线性渐变", value: "linear" },
    { label: "径向渐变", value: "radial" },
    { label: "噪点", value: "noise" },
    { label: "极坐标放射", value: "polar" },
    { label: "正弦型放射", value: "sine" },
    { label: "全景图", value: "panorama" },
  ];
  types.push({ label: "TEST", value: "" });
  const [value, setValue] = useState(types[5].value);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas, 300);
    program = webgl.createProgram(vert, frag);
    polygon = new Polygon({
      gl: webgl.ctx,
      program: program,
      attrs: {
        my_Position: {
          size: 2,
          data: [
            [-1, 1],
            [-1, -1],
            [1, 1],
            [1, -1],
          ].flat(),
        },
        my_Pin: {
          size: 2,
          offset: 2,
          data: [
            [0, 1],
            [0, 0],
            [1, 1],
            [1, 0],
          ].flat(),
        },
      },
      uniforms: {
        color_Start: {
          func: "uniform4fv",
          args: [[1, 0, 0, 1]],
        },
        color_End: {
          func: "uniform4fv",
          args: [[0, 0, 1, 1]],
        },
        canvas_Size: {
          func: "uniform2f",
          args: [canvas.width, canvas.height],
        },
      },
      modes: ["TRIANGLE_STRIP"],
    });
  }, []);
  useEffect(() => {
    const canvas = ref.current!;
    window.cancelAnimationFrame(thread);
    switch (value) {
      case "linear":
        Object.assign(polygon.uniforms, {
          u_Type: {
            func: "uniform1i",
            args: [0],
          },
          u_Radius: {
            func: "uniform1f",
            args: [0],
          },
          point_Start: {
            func: "uniform2fv",
            args: [[0, 0]],
          },
          point_End: {
            func: "uniform2fv",
            args: [[canvas.width, canvas.height]],
          },
        });
        break;
      case "radial":
        // 起点设为画布中心点
        Object.assign(polygon.uniforms, {
          u_Type: {
            func: "uniform1i",
            args: [1],
          },
          point_Start: {
            func: "uniform2fv",
            args: [[canvas.width / 2, canvas.height / 2]],
          },
          u_Radius: {
            func: "uniform1f",
            args: [canvas.width / 2],
          },
        });
        break;
      case "noise":
        polygon.uniforms.u_Type = {
          func: "uniform1i",
          args: [2],
        };
        break;
      case "polar": {
        polygon.uniforms.u_Type = {
          func: "uniform1i",
          args: [3],
        };
        let last = 0;
        const interval = 40;
        (function anime(stamp: number) {
          if (last % interval > stamp % interval) {
            polygon.uniforms.u_Stamp = {
              func: "uniform1f",
              args: [stamp / 10000],
            };
            polygon.draw();
          }
          last = stamp;
          thread = requestAnimationFrame(anime);
        })(0);
        break;
      }
      case "sine":
        polygon.uniforms.u_Type = {
          func: "uniform1i",
          args: [4],
        };
        polygon.draw();
        break;
      case "panorama": {
        polygon.uniforms.u_Type = {
          func: "uniform1i",
          args: [5],
        };
        const image = new Image();
        image.src = "/assets/room.jpg";
        image.onload = function () {
          polygon.textures = [{ image, uniform: "u_Image" }];
          polygon.draw();
        };
        break;
      }
      default:
        polygon.uniforms.u_Type = {
          func: "uniform1i",
          args: [-1],
        };
        break;
    }
    polygon.draw();
  }, [value]);
  return (
    <>
      <canvas ref={ref}></canvas>
      <div style={{ padding: "12px 24px", textAlign: "center" }}>
        {types.map((item) => (
          <label
            key={item.value}
            style={{ marginRight: 16, display: "inline-block" }}
          >
            {item.label}
            <input
              type="radio"
              name="type"
              value={item.value}
              checked={value === item.value}
              onChange={() => {
                setValue(item.value);
              }}
            />
          </label>
        ))}
      </div>
    </>
  );
}

export default App;
