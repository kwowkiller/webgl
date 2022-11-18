// 叉乘判断p1 p2 p3三点构成的两个向量之间的关系
function crossProduct([p1, p2, p3]) {
  // p1到p2的向量
  const a = { x: p2.x - p1.x, y: p2.y - p1.y };
  // p1到p3的向量
  const b = { x: p3.x - p1.x, y: p3.y - p1.y };
  /*
  这两个向量叉乘得到的结果，即|a|*|b|*sin(夹角)，因为a模b模都是长度为正
  只有sin(夹角)的正负会影响到叉乘结果的正负，所以可以用叉乘的正方判断夹角的方向
   */
  // 向量b在向量a的哪边，正为逆时针(左边)，负为顺时针(右边)
  return a.x * b.y - a.y * b.x;
}

console.log(
  crossProduct([
    { x: -3, y: 2 },
    { x: 3, y: 1 },
    { x: -2, y: -6 },
  ])
);
