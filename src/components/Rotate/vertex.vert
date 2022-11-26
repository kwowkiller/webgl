// 顶点着色器
uniform float my_Deg;
uniform float my_Radius;
// 处理xy轴比例不同问题
uniform float my_Ratio;
// 画的是圆还是三角形
uniform bool is_Circle;
attribute vec4 my_Position;

void main() {
  // gl_Position = vec4(0,0,0,1);
  if(is_Circle) {
    gl_Position.x = cos(my_Deg) * my_Radius;
    gl_Position.y = sin(my_Deg) * my_Radius * my_Ratio;
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
  } else {
    gl_Position = my_Position;
  }
  gl_PointSize = 10.0;
}