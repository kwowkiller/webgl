// 片元着色器
precision mediump float;
varying vec2 v_Pin;
uniform sampler2D u_Sampler;

void main() {
   // 片元也是个向量，可以用向量运算操作颜色
   // 比如这里就是通过乘以红色向量，给图片加了一层红色滤镜
   gl_FragColor = texture2D(u_Sampler, v_Pin) * vec4(1,0,0,1);
}