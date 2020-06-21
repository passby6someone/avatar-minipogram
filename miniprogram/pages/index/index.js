import WeCropper from '../../weCropper/we-cropper.js'

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
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID:'cloud://tufe-graduate-pridt.7475-tufe-graduate-pridt-1302348245/background.jpg',
        // maxAge: 60 * 60, // one hour
      }]
    }).then(res => {
      // get temp file URL
      that.setData({
        url: res.fileList[0]['tempFileURL']
      });
      console.log(res.fileList)
    }).catch(error => {
      // handle error
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
    var that = this;
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

  showUserAvatar:function(){
    // console.log('once')
    var that = this;
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              console.log(233)
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.getUserInfo({
                success: (res) => {
                  that.setData({
                    avatar: true,
                    imgSrc: res.userInfo.avatarUrl.replace('132', '0'),
                  })
                }
              });
            },
            fail(err){
              console.log(err);
              var handle = setInterval(()=>{
                console.log('?')
                wx.getUserInfo({
                  success: (res) => {
                    that.setData({
                      avatar: true,
                      imgSrc: res.userInfo.avatarUrl.replace('132', '0'),
                    })
                  }
                });
                if(that.data.avatar){
                  clearInterval(handle);
                }
              },1000)
            }
          })
        }
        else{
          wx.getUserInfo({
            success: (res) => {
              that.setData({
                avatar: true,
                imgSrc: res.userInfo.avatarUrl.replace('132', '0'),
              })
            }
          });
        }
      },
      fail:console.log
    })
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

// function once(callback){
//   var once = true;
//   return function(){
//     if(once){
//       callback(this);
//       once = false;
//     }
//   }
// }