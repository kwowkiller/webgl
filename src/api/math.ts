export function sin(a = 1, omega = 1, phi = 0) {
  return function (x: number) {
    return a * Math.sin(omega * x + phi);
  };
}

export function linear(ax: number, ay: number, bx: number, by: number) {
  const delta = {
    x: bx - ax,
    y: by - ay,
  };
  const k = delta.y / delta.x;
  const b = ay - ax * k;
  return function (x: number) {
    return k * x + b;
  };
}
