// 这不是个传统意义上的订阅发布，只是为了确认资源是否加载
// 其实想写成redux那样的，之后再改把
export const events = {
  clientList: {},
  listen(event, fn) {
    if (this.clientList[event] === true) {
      fn();
      return true;
    }
    if (!this.clientList[event]) {
      this.clientList[event] = [];
    }
    this.clientList[event].push(fn);
  },
  trigger (type, ...args) {
    let fns = this.clientList[type]
    if (!fns || fns.length === 0) { // 如果没有绑定对应的消息
      this.clientList[type] = true
      return false;
    }
    fns.forEach(fn => {
        fn.call(this, ...args);
    });
    this.clientList[type] = true;
  },
}

// 按理来说，action和reducer要分离的，但是之后再重构把
export const BACKGROUND = 'BACKGROUND';
export const AVATARS = 'AVATERS';
