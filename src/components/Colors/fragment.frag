// 片元着色器
precision mediump float;
uniform int u_Type;
// 画布大小
uniform vec2 canvas_Size;
uniform vec4 color_Start;
uniform vec4 color_End;
// gl_FragCoord 当前片段的窗口相对坐标 默认以窗口左下角为原点
// 终点起点，以左下角为原点，以像素大小为基底
// 左下角是(0,0) 右上角是(canvas.width,canvas.height)
uniform vec2 point_Start;
uniform vec2 point_End;
// 终点到起点的向量
vec2 start_End = point_End - point_Start;
// 终点到起点向量的模/长度
float m = length(start_End);
// 终点到起点向量归一化
// 目的是做点积的时候，得到的结果直接是投影长度，d点积n看作d在n上的投影乘以n的模
// 归一化后n的模为1，就直接得到d在n上的投影长度
vec2 n = normalize(start_End);
/*
   整体思路就是利用gl_FragCoord到start点的向量
   在end点到start点的向量上的投影长度 
   比上end点到start点的向量长度的比值
 */
void linearGradient() {
   // 当前gl_FragCoord到start点的向量
   vec2 d = vec2(gl_FragCoord) - point_Start;
   // d在n上的投影长度
   float c = clamp(dot(d, n), 0.0, m);
   float ratio = c / m;
   // 用这个投影的长度，比上m的比值，乘以color_end - color_start，再加上color_start
   gl_FragColor = color_Start + (color_End - color_Start) * ratio;
}

// 径向渐变半径
uniform float u_Radius;
/*
   整体思路就是当前gl_FragCoord到start点的距离
   比上半径u_Radius
 */
void radialGradient() {
   float d = distance(gl_FragCoord.xy, point_Start);
   float ratio = clamp(d / u_Radius, 0.0, 1.0);
   gl_FragColor = color_Start + (color_End - color_Start) * ratio;
}

///////////////////////////////////////////////////////////////////

float fakeRandom(vec2 v) {
   return fract(sin(dot(v, vec2(0.789, 0.987))) * 9527.0);
}

// 噪点
void noise() {
   vec2 v = gl_FragCoord.xy;
   gl_FragColor = vec4(vec3(fakeRandom(v)), 1.0);
}

// 控制旋转角度
uniform float u_Stamp;
// 极坐标放射
void polar() {
   // gl_FragCoord坐标系的中点
   vec2 center = canvas_Size / 2.0;
   vec2 p = gl_FragCoord.xy - center;
   float sin = sin(u_Stamp);
   float cos = cos(u_Stamp);
   // 乘以旋转矩阵，逆时针
   p = p * mat2(cos, sin, -sin, cos);
   // gl_FragCoord的xy作为三角形的两条直角边，到center的连线作为斜边，构成三角形
   // tan(gl_FragCoord到中点的角度)就是gl_FragCoord.y/gl_FragCoord.x
   // 求atan(y/x)可到到角度
   float degree = atan(p.y, p.x);
   // 构建一个x变动，y不变的向量来生成伪随机
   // 用int转换degress，否则小数误差会影响效果
   vec2 r = vec2(int(degree * 10.0), 0.0);
   gl_FragColor = vec4(vec3(fakeRandom(r)), 1.0);
}

// 正弦型放射
void sine() {
   vec2 center = canvas_Size / 2.0;
   vec2 p = center - gl_FragCoord.xy;
   float degree = atan(p.y, p.x);
   // 振幅 周期
   float s = 0.5 * sin(degree * 9.0) + 0.5;
   gl_FragColor = vec4(vec3(s), 1.0);
}

// 全景图
uniform sampler2D u_Image;
varying vec2 v_Pin;
float pi2 = radians(360.0);
void panorama() {
   vec2 center = canvas_Size / 2.0;
   vec2 p = center - gl_FragCoord.xy;
   float x = atan(p.y, p.x) / pi2;
   float y = length(p) / length(center);
   gl_FragColor = texture2D(u_Image, vec2(x, y));
}

void main() {
   if(u_Type == 0) {
      linearGradient();
   } else if(u_Type == 1) {
      radialGradient();
   } else if(u_Type == 2) {
      noise();
   } else if(u_Type == 3) {
      polar();
   } else if(u_Type == 4) {
      sine();
   } else if(u_Type == 5) {
      panorama();
   } else {
      // gl_FragColor = vec4(gl_FragCoord.x / 500.0, 0, 0, 1.0);

      // if(gl_FragCoord.y <= 100.0 && gl_FragCoord.x <= 100.0) {
      //    gl_FragColor = vec4(1,0,0,1);
      // }else{
      //    discard;
      // }

      gl_FragColor = vec4(length(vec2(0.01, 0.8)), 0, 0, 1);
   }
}