import WeCropper from '../../weCropper/we-cropper.js'
import { BACKGROUND } from '../../events.js';

const App = getApp();
const device = wx.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const height = device.windowHeight - 50;
console.log(device.windowHeight);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'',
    avatar:false,
    imgSrc:'',
    avatarContainer:true,
    animationData: {},
    cropperOpt: {
      id: 'cropper', // 用于手势操作的canvas组件标识符
      targetId: 'targetCropper', // 用于用于生成截图的canvas组件标识符
      pixelRatio: device.pixelRatio, // 传入设备像素比
      width,  // 画布宽度
      height, // 画布高度
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x: (width - 200) / 2, /* 裁剪框x轴起点*/
        y: (height - 200) / 2, /* 裁剪框y轴期起点*/
        width: 200, // 裁剪框宽度
        height: 200 // 裁剪框高度
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log('data', App.globalData);
    const { events } = App.globalData;
    events.listen(BACKGROUND, () => {
      that.setData({
        url: App.globalData.backgroundUrl
      });
    });
    const { cropperOpt } = this.data

    this.cropper = new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
        console.log(`wecropper is ready for work!`)
      })
      // .on('beforeImageLoad', (ctx) => {
      //   wx.showToast({
      //     title: '上传中',
      //     icon: 'loading',
      //     duration: 20000
      //   })
      // })
      // .on('imageLoad', (ctx) => {
      //   wx.hideToast()
      // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var shareObj = {
      title:'快来pick你喜欢的头像吧！',
      path:'/pages/index/index',
      imageUrl: "../../images/share.png"
    }
    return shareObj;
  },

  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage() {
    var that = this;
    this.wecropper.getCropperImage((tempFilePath) => {
      // tempFilePath 为裁剪后的图片临时路径
      if (tempFilePath) {
        that.setData({
          imgSrc: tempFilePath,
          avatar:true,
          avatarContainer:true,
        })
      } else {
        console.log('获取图片地址失败，请稍后重试')
      }
    })
  },

  showUserAvatar:function(e){
    console.log(e);
    this.setData({
      avatar: true,
      imgSrc: e.detail.userInfo.avatarUrl.replace('132', '0'),
    });
  },

  chooseImg:function(){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const src = res.tempFilePaths[0];
        that.cropper.pushOrign(src)
        console.log(res);
        that.setData({
          avatarContainer:false
        })
      }
    })
  },

  hideCompress: function() {
    let animation = wx.createAnimation({
      delay: 500,
      timingFunction: 'ease-out',
    });
    animation.opacity(0).step();
    this.setData({
      animationData: animation
    })
  },

  navToMake:function(){
    var that = this;
    if (that.data.imgSrc!==''){
      wx.navigateTo({
        url: '/pages/avatarMaker/avatarMaker?src='+that.data.imgSrc,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    }
  }
});
