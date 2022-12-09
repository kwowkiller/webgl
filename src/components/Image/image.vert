attribute vec4 my_Position;
attribute vec2 my_Pin;
varying vec2 v_Pin;
uniform mat4 u_Pv;
uniform mat4 u_Model;

void main() {
  v_Pin = my_Pin;
  gl_Position = u_Pv * u_Model * my_Position;
}