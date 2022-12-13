// 顶点着色器
attribute vec4 my_Position;
attribute vec4 my_Color;
// 模型矩阵
uniform mat4 u_ModelView;
// 投影矩阵
uniform mat4 u_Projection;
varying vec4 v_Color;

void main() {
  v_Color = my_Color;
  gl_Position = u_Projection * u_ModelView * my_Position;
}