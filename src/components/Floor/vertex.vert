// 顶点着色器
attribute vec4 my_Position;
// 模型矩阵
uniform mat4 u_ModelView;
// 投影矩阵
uniform mat4 u_Projection;
attribute vec2 my_Pin;
varying vec2 v_Pin;

void main() {
  v_Pin = my_Pin;
  gl_Position = u_Projection * u_ModelView * my_Position;
}