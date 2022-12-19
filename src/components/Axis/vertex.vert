// 顶点着色器
attribute vec4 my_Position;
uniform mat4 u_ModelView;
uniform mat4 u_Projection;
attribute vec3 my_Color;
varying vec3 v_Color;

void main() {
  v_Color = my_Color;
  gl_Position = u_Projection * u_ModelView * my_Position;
}