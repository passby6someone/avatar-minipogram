//app.js

import { events, BACKGROUND, AVATARS } from './events.js';

import config from './config.js';

console.log(config);

const {
  avatarImageNum,
  cloudId,
  avatarsUrl,
  backgroundUrl,
} = config;

function getCloudImg (fileID, saveType, field, type) {
  return wx.cloud.getTempFileURL({
    fileList: [{
      fileID: fileID,
      // maxAge: 60 * 60, // one hour
    }]
  }).then(res => {
    if (saveType.type === 'arr') {
      this.globalData[field][saveType.index] = res.fileList[0]['tempFileURL'];
    }
    else if (saveType.type === 'var') {
      this.globalData.backgroundUrl = res.fileList[0]['tempFileURL'];
    }
    console.log(res.fileList);
    console.log(fileID);
    type && events.trigger(type);
  });
  // .then(() => new Promise((resolve) => resolve()));
}

App({
  onLaunch: function () {
    const that = this;
    if (wx.cloud) {
      wx.cloud.init({
        env: cloudId
      });
    }
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    });
    getCloudImg.call(this, `${backgroundUrl}/background.jpg`, { type: 'var' }, 'backgroundUrl', BACKGROUND);
    let promiseList = [];
    for (let i = 0; i < avatarImageNum; i++) {
      promiseList.push(getCloudImg.call(this, `${avatarsUrl}/${i}.png`, {type: 'arr', index: i}, 'avatarUrls'));
    }
    Promise.all(promiseList).then(() => events.trigger(AVATARS));
  },
  globalData: {
    backgroundUrl: '',
    avatarUrls: [],
    events,
    avatarImageNum,
  }
})