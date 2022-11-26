// 片元着色器
precision mediump float;
varying vec2 v_Pin;
uniform sampler2D u_Sampler;

void main() {
   gl_FragColor = texture2D(u_Sampler, v_Pin);
}