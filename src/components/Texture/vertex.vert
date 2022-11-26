// 顶点着色器
attribute vec4 my_Position;
attribute vec2 my_Pin;
varying vec2 v_Pin;

void main() {
  gl_Position = my_Position;
  v_Pin = my_Pin;
  gl_PointSize = 5.0;
}