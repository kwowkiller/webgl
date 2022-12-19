// 顶点着色器
attribute vec4 my_Position;
uniform mat4 u_ModelView;
uniform mat4 u_Projection;

void main() {
  gl_Position = u_Projection * u_ModelView * my_Position;
  gl_PointSize = 2.0;
}