attribute vec4 my_Position;
uniform mat4 u_Pv;
uniform mat4 u_Model;

void main() {
  gl_Position = u_Pv * u_Model * my_Position;
  gl_PointSize = 10.0;
}