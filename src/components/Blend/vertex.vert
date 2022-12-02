// 顶点着色器
attribute vec4 my_Position;
attribute vec2 my_Pin;
varying vec2 v_Pin;

void main() {
  v_Pin = my_Pin;
  gl_Position = my_Position;
}