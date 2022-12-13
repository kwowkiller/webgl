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

// 角度转弧度
export function d2r(d: number) {
  return (d / 180) * Math.PI;
}

// 弧度转角度
export function r2d(r: number) {
  return (r / Math.PI) * 180;
}

export function separate(
  arr: number[],
  attrs: { size: number; offset: number }[]
) {
  const result: number[][] = attrs.map(() => []);
  const rowSize = attrs.map((item) => item.size).reduce((p, c) => p + c);
  for (let i = 0; i < arr.length; i += rowSize) {
    const row = arr.slice(i, i + rowSize);
    attrs.forEach(({ offset, size }, index) => {
      const start = offset;
      const end = start + size;
      result[index].push(...row.slice(start, end));
    });
  }
  return result;
}
