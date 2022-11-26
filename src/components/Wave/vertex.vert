// 顶点着色器
attribute vec4 my_Position;
attribute vec4 my_Color;
varying vec4 v_Color;
uniform mat4 my_ViewMatrix;

void main() {
  v_Color = my_Color;
  gl_Position = my_ViewMatrix * my_Position;
  gl_PointSize = 3.0;
}