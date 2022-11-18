// 片元着色器
precision mediump float;
uniform vec4 my_Color;

void main() {
   gl_FragColor = my_Color;
}