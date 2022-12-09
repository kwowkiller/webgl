// 片元着色器
precision mediump float;
uniform sampler2D u_Image;
varying vec2 v_Pin;

void main() {
   gl_FragColor = texture2D(u_Image, v_Pin);
}