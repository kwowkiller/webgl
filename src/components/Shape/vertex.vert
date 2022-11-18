// 顶点着色器
attribute vec4 my_Position;

void main() {
  gl_Position = my_Position;
  gl_PointSize = 5.0;
}