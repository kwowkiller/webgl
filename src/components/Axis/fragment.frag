// 片元着色器
precision mediump float;
varying vec3 v_Color;

void main() {
   gl_FragColor = vec4(v_Color, 1);
}