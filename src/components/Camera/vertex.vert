// 顶点着色器
attribute vec4 my_Position;
// 模型矩阵
uniform mat4 u_ModelView;
// 投影矩阵
uniform mat4 u_Projection;

void main() {
  gl_Position = u_Projection * u_ModelView * my_Position;
}