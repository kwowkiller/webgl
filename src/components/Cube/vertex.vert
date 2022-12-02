// 顶点着色器
attribute vec4 my_Position;
attribute vec2 my_Pin;
uniform mat4 my_Camera;
uniform mat4 my_Model;
varying vec2 v_Pin;

void main() {
  v_Pin = my_Pin;
  // 顺序很重要！先模型变换，再视图变换
  gl_Position = my_Camera * my_Model * my_Position;
}