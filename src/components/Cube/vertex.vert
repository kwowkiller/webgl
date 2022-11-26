// 顶点着色器
attribute vec4 my_Position;
uniform mat4 my_Camera;
uniform mat4 my_Model;

void main() {
  // 顺序很重要！先模型变换，再视图变换
  gl_Position = my_Camera * my_Model * my_Position;
}