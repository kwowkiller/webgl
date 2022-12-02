// 顶点着色器
attribute vec4 my_Position;

void main() {
  // glsl里的矩阵是列主序的
  float degrees = 45.0;
  // 4x4的单位矩阵
  mat4 m0 = mat4(1);
  // 2x2的旋转45°矩阵
  mat4 m1 = mat4(mat2(
    cos(radians(degrees)), sin(radians(degrees)), 
    -sin(radians(degrees)), cos(radians(degrees)))
  );
  // 4x4的缩放矩阵，xy缩放1.2倍
  mat4 m2 = mat4(
    1.2,0,0,0,
    0,1.2,0,0,
    0,0,1,0,
    0,0,0,1
  );
  // 平移矩阵，x轴y轴平移0.5
  // 列主序用左乘
  mat4 m3 = mat4(
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0.5,0.5,0,1
  );
  // 行主序用右乘
  // mat4 m3 = mat4(
  //   1,0,0,0.5,
  //   0,1,0,0.5,
  //   0,0,1,0,
  //   0,0,0,1
  // );
  // 顺序很重要，先旋转后平移，和先平移后旋转完全不一样
  // 这里顺序为 旋转-平移-缩放
  gl_Position = m2 * m3 * m1 * my_Position;
  gl_PointSize = 10.0;
}