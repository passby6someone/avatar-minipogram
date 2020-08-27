import { BACKGROUND, AVATARS } from '../../events.js';

const App = getApp();
// 可选择合成的模板的数量
// const imgNum = 6;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    origin: '',
    authorize: true,
    imgList0:[],
    imgList1:[],
    animationData0:[],
    animationData1:[],
    preAvater: '',
    imgSize:0,
    dpr:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    // 用于获取背景图像，背景图像我放云储存里了
    const { events } = App.globalData;
    console.log(App.globalData);
    events.listen(BACKGROUND, () => {
      that.setData({
        url: App.globalData.backgroundUrl,
      });
    });
    console.log(that.data);
    // 图片我是用0-n.png来命名的，imgNum在第一行声明了，这个数组用于wx:for进行列表渲染
    events.listen(AVATARS, () => {
      // options.src是index页传过来的参数，是需要合成的图片的地址
      const { avatarImageNum, avatarUrls } = App.globalData;
      console.log('avatarUrls', avatarUrls)
      that.setData({
        origin: options.src,
        imgList0: avatarUrls.slice(0, Math.ceil(avatarImageNum / 2)),
        imgList1: avatarUrls.slice(Math.ceil(avatarImageNum / 2))
        // imgList0: avatarUrls.slice(0, 3),
        // imgList1: avatarUrls.slice(3, 6)
      });
      console.log(that.data.imgList0, that.data.imgList1);
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    // 用的是小程序新的canvas的接口，type="2d"那个
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 获取系统信息（像素比）和画布宽度
        // 这里这个imgSize设置成canvas['_width'] * 2是为了拥有更大画布，从而使得图像更清晰
        const sysInfo = wx.getSystemInfoSync();
        const imgSize = canvas['_width'] * 2;
        const dpr = sysInfo.pixelRatio;
        that.setData({
          imgSize:imgSize,
          dpr:dpr
        })
        // 设置宽高是为了让canvas呈现正方形，引入像素比后缩放是官方代码
        canvas.width = imgSize * dpr
        canvas.height = imgSize * dpr
        ctx.scale(dpr, dpr)

        let img = canvas.createImage();
        img.src = that.data.origin;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, imgSize, imgSize);
        }
      })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    var shareObj = {
      title: '快来pick你喜欢的头像吧！',
      path: '/pages/index/index',
      imageUrl: "../../images/share.png"
    }
    return shareObj;
  },
  chooseThis:function(e){
    var that = this;
    if(this.data.preAvater === e.target.dataset['src']) {
      return false;
    }
    // 同上
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const imgSize = that.data.imgSize;
        // 清除画布
        ctx.clearRect(0,0,imgSize,imgSize);

        new Promise((resolve,reject)=>{
          let img = canvas.createImage();
          img.src = that.data.origin;
          img.onload = () => {
            ctx.drawImage(img, 0, 0, imgSize, imgSize);
            resolve();
          }
        }).then(()=>{
          let img = canvas.createImage();
          img.src = e.target.dataset['src'];
          // img.src = 'https://6176-avatar-rhixm-1302889945.tcb.qcloud.la/avatar/8.png'
          console.log(e.target.dataset['src']);
          img.onload = () => {
            ctx.drawImage(img, 0, 0, imgSize, imgSize)
          }
        }).then(() => {
          that.setData({
            preAvater: e.target.dataset['src'],
          });
        });
      })
  },
  showThis: function (e) {
    console.log(e);
    const { index, column } = e.currentTarget.dataset;
    let animation = wx.createAnimation({
      delay: 600,
      timingFunction: 'ease-out',
    });
    animation.opacity(1).step();
    const animationDataIndex = `animationData${column}`;
    const animationData = this.data[animationDataIndex];
    animationData[index] = animation;
    console.log(animationData);
    this.setData({
      [animationDataIndex]: animationData,
    });
    // return () => {
    // }
  },
  save: async function(){
    console.log('save');
    var that = this;
    const { authorize } = this.data;
    await new Promise((resolve, reject) => {
      wx.getSetting({
        success(result) {
          if (!result.authSetting['scope.writePhotosAlbum'] && authorize) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success() {
                resolve();
              },
              fail(err) {
                console.log('fail',err);
                that.setData({
                  authorize:false,
                })
              }
            });
          }
          else if (!result.authSetting['scope.writePhotosAlbum'] && !authorize) {
            wx.showModal({
              title: '提示',
              content: '请允许小程序保存图片到相册',
              success (res) {
                if (res.confirm) {         
                  wx.openSetting({
                    success (res) {
                      console.log(res.authSetting);
                      if (res.authSetting["scope.writePhotosAlbum"]) {
                        resolve();
                      }
                      else {
                        reject();
                      }
                    },
                    fail (err) {
                      console.log(err);
                      reject();
                    }
                  });
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            });
          }
          else {
            resolve();
          }
        },
        fail(err){
          console.log(err);
          reject();
        }
      });
    });
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const imgSize = that.data.imgSize;

        // 先canvas转图片到暂时路径，然后判断相册写入权限，没有则请求权限，有则储存
        // 写了很多promise避免回调地狱
        let tempFilePath = '';
        new Promise((resolve,reject)=>{
          wx.showLoading({
            title: '保存中',
          });
          wx.canvasToTempFilePath({
            destWidth:1000,
            destHeight:1000,
            canvas: canvas,
            success(res) {
              console.log(res.tempFilePath)
              tempFilePath = res.tempFilePath;
              resolve();
            },
            fail(err){
              reject(err);
            }
          })
        }).then(()=>{
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success() {
              wx.hideLoading();
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              })
            },
            fail() {
              wx.hideLoading();
            },
          });
        }).catch((err)=>console.log);
      })
  },
  navBack:function(){
    wx.navigateBack({
      delta: 1,
    })
  }
})