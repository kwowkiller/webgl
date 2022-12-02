// 片元着色器
precision mediump float;
varying vec2 v_Pin;
uniform sampler2D u_Dress;
uniform sampler2D u_Mask;
uniform sampler2D u_Pattern0;
uniform sampler2D u_Pattern1;
uniform float u_Ratio;

void main() {
   vec4 blend = vec4(1, 1, 1, 1);
   vec4 u = texture2D(u_Dress, v_Pin);
   vec4 mask = texture2D(u_Mask, v_Pin);
   vec4 p0 = texture2D(u_Pattern0, v_Pin);
   vec4 p1 = texture2D(u_Pattern1, v_Pin);
   // 遮罩图片白色的衣服轮廓
   if(mask.x > 0.5) {
      // 两张纹理过渡
      blend = mix(p0, p1, u_Ratio);
   }
   gl_FragColor = blend * u ;
}