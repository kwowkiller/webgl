// 片元着色器
precision mediump float;
uniform vec4 my_Color;
// mac系统discard画线有问题会不显示线段，这个额外判断下，如果是画线就不discard
uniform bool is_Point;

void main() {
  if(is_Point) {
    // "片元"为1x1的正方形，中心点为(0.5,0.5)，判断要绘制的位置离中心点的距离，从而绘制圆像素而非正方形像素
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    if(dist < 0.5) {
      gl_FragColor = vec4(1, 0, 0, 1);
    } else {
      discard;
    }
  } else {
    gl_FragColor = vec4(1, 0, 0, 1);
  }
}