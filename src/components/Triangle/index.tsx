import React, { useEffect, useRef } from "react";
import WebGL from "../../api/webgl";
import vert from "./vertex.vert";
import frag from "./fragment.frag";
import Polygon from "../../api/polygon";
import { Point } from "../../api/coordinate";

let webgl: WebGL;
let program: WebGLProgram;
// 多边形容器
const container: Polygon[] = [];
// 正在绘制的多边形
let polygon: Polygon | null = null;

// 绘制容器内的所有多边形
function draw() {
  container.forEach((poly) => {
    poly.draw(false);
  });
}

// 找到附近的点
function getAccessPoint(event: React.MouseEvent) {
  let access: Point | undefined;
  // 遍历所有点判断鼠标是靠近某个点
  for (let i = 0; i < container.length; i++) {
    if (access) break;
    const vertices = container[i].attrs.my_Position.data;
    for (let j = 0; j < vertices.length; j += 2) {
      // 过滤掉当正在绘制的多边形的最后一个点
      if (polygon === container[i] && j === vertices.length - 2) continue;
      access = webgl.coordinate.mouseApproach(
        { x: vertices[j], y: vertices[j + 1] },
        event
      );
      if (access) break;
    }
  }
  return access;
}

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    webgl = new WebGL(canvas);
    program = webgl.createProgram(vert, frag);
    // (function render() {
    //   draw();
    //   requestAnimationFrame(render);
    // })();
  }, []);
  return (
    <canvas
      ref={ref}
      // 取消右键菜单
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(event) => {
        // 鼠标右键
        if (event.button === 2) {
          // 移除最后一个点（xy两个元素）
          polygon?.attrs.my_Position.data.splice(-2, 2);
          polygon = null;
        } else {
          // 如果离某个点很近，直接使用该点
          const { x, y } =
            getAccessPoint(event) || webgl.coordinate.mouseToWebGL(event);
          if (!polygon) {
            polygon = new Polygon({
              gl: webgl.ctx,
              program: program,
              attrs: {
                // 初次点击时创建两个点，一个固定点，一个随鼠标移动点
                my_Position: {
                  size: 2,
                  data: [x, y, x, y],
                },
              },
              modes: ["POINTS", "LINE_STRIP"],
            });
            container.push(polygon);
          } else {
            polygon.attrs.my_Position.data.push(x, y);
          }
        }
        draw();
      }}
      onMouseMove={(event) => {
        let access = getAccessPoint(event);
        const canvas = ref.current!;
        canvas.style.cursor = access ? "pointer" : "default";
        if (!polygon) return;
        // 如果靠近某个点，直接连到这个点
        const { x, y } = access || webgl.coordinate.mouseToWebGL(event);
        polygon.attrs.my_Position.data.splice(-2, 2, x, y);
        draw();
      }}
    ></canvas>
  );
}

export default App;
