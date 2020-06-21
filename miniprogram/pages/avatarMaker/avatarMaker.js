// 可选择合成的模板的数量
const imgNum = 10;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    origin: '',
    imgList0:[],
    imgList1:[],
    imgSize:0,
    dpr:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    // 图片我是用0-n.png来命名的，imgNum在第一行声明了，这个数组用于wx:for进行列表渲染
    let list = [];
    for (let i = 0; i < imgNum;i++){
      list.push(`../../images/${i}.png`)
    }
    // options.src是index页传过来的参数，是需要合成的图片的地址
    this.setData({
      origin: options.src,
      imgList0: list.slice(0, Math.ceil(list.length / 2)),
      imgList1: list.slice(Math.ceil(list.length / 2))
    });
    // 用于获取背景图像，背景图像我放云储存里了
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: 'cloud://tufe-graduate-pridt.7475-tufe-graduate-pridt-1302348245/background.jpg',
      }]
    }).then(res => {
      that.setData({
        url: res.fileList[0]['tempFileURL']
      });
      console.log(res.fileList)
    }).catch(error => {
      // handle error
    });
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
    // console.log(e);
    var that = this;
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
          img.onload = () => {
            ctx.drawImage(img, 0, 0, imgSize, imgSize)
          }
        })

      })
  },
  save:function(){
    console.log('save');
    
    var that = this;
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
          return new Promise((resolve,reject)=>{
            wx.getSetting({
              success(result) {
                console.log(result);
                resolve(result);
              },
              fail(err){
                reject(err);
              }
            })
          });
        }).then((res)=>{
          return new Promise((resolve,reject)=>{
            if (!res.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                  resolve();
                },
                fail(err) {
                  reject(err);
                }
              })
            }
            else {
              resolve();
            }
          })
        }).then(()=>{
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success() {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 2000
              })
            }
          });
        }).catch((err)=>console.log)


      })
  },
  navBack:function(){
    wx.navigateBack({
      delta: 1,
    })
  }
})