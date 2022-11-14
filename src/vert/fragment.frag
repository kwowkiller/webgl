// 片元着色器
precision mediump float;
uniform vec4 my_Color;

void main() {
  // "片元"为1x1的正方形，中心点为(0.5,0.5)，判断要绘制的位置离中心点的距离，从而画圆
  float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
  if(dist < 0.5) {
    gl_FragColor = my_Color;
  } else {
    discard;
  }
}