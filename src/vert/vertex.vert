// 顶点着色器
attribute vec4 my_Position;
attribute float my_Size;

void main() {
  gl_Position = my_Position;
  gl_PointSize = my_Size;
}