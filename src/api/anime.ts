export class Compose {
  parent?: Compose;
  children: (Track | Compose)[] = [];

  add(obj: Track | Compose) {
    obj.parent = this;
    this.children.push(obj);
  }
  // 更新所有Track或Compose
  update(t: number) {
    this.children.forEach((c) => {
      c.update(t);
    });
  }
}

// 帧节点，第一个数表示时间，第二个数表示值，比如说在2000毫秒时，值（可能是大小，颜色等等）为0.5
type Frames = [number, number][];

export class Track {
  // 要改变动画数值的对象
  target: { [key: string]: any };
  parent?: Compose;
  // Track的 创建/开始 时间
  start = new Date().getTime();
  // 动画持续时间
  duration = 2000;
  // 重复动画
  repeat = true;
  // 对象关键帧，比如对象target:{x,y,size...}，定义每帧的size大小，map的key为size，value为Frames
  framesMap = new Map<string, Frames>();
  constructor(target: { [key: string]: any }) {
    this.target = target;
  }

  update(t: number) {
    const { start, target, duration, repeat, framesMap } = this;
    // 更新Track的时间t减去Track的start时间得到时间
    let time = t - start;
    if (repeat) {
      // 重复动画，用time除以duration，取余数，比如time到了2010了，除以duration则余10，从这里重新开始计时
      time = time % duration;
    }
    framesMap.forEach((frames, key) => {
      const lastIndex = frames.length - 1;
      if (time < frames[0][0]) {
        // 如果时间差小于第一帧的时间，则改变target的值为第一帧的值
        target[key] = frames[0][1];
      } else if (time > frames[lastIndex][0]) {
        // 如果时间差大于最后一帧的时间，则改变target的值为最后一帧的值
        target[key] = frames[lastIndex][1];
      } else {
        // 如果时间差在第一帧到最后一帧之间，则用补间动画来给target插值
        target[key] = tween(time, frames);
      }
    });
  }
}

function tween(time: number, fms: Frames) {
  for (let i = 0; i < fms.length - 1; i++) {
    const fm1 = fms[i]; // 当前帧i
    const fm2 = fms[i + 1]; //下一帧i+1
    // 时间在当前帧和下一帧之间时，使用帧时间做x，动画值做y，靠两点求出线性方程
    if (time >= fm1[0] && time <= fm2[0]) {
      const delta = {
        x: fm2[0] - fm1[0],
        y: fm2[1] - fm1[1],
      };
      const k = delta.y / delta.x;
      const b = fm1[1] - fm1[0] * k;
      // 求出斜率和截距，得到线性方程为y=kx+b，将time带入x，返回帧动画值
      return k * time + b;
    }
  }
}
