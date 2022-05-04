Page({
  /**
   * 页面的初始数据
   */
  data: {
    weather_quality:"请求中",
    weather_text:"请求中",
    weather_temp:"请求中",
    city:"请求中",
    area:"请求中",
    advice:"请求中"

  },
  toEnv(){
    wx.navigateTo({
      url: '../env/env'
    })
  },
  toHealth(){
    wx.navigateTo({
      url: '../healthy/healthy'
    })
  },
  toCanvas(){
    wx.navigateTo({
      url: '../curves/curves'
    })
  },
  toDetail(){
    wx.navigateTo({
      url: '../weather/weather'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow: function () {
    var that=this
    wx.getLocation({
      success(res){
        const {latitude} = res
        const {longitude} = res
        const key = '1c6a3dc86f2544a3b18828ca409858c9'
        // 请求温度与天气状况
        wx.request({
          url: `https://devapi.qweather.com/v7/weather/now?location=${longitude},${latitude}&key=${key}`,
          success(res){
          //  console.log(res)
            that.setData({
              weather_temp:res.data.now.temp,
              weather_text:res.data.now.text
            })
          }
        })
        // 地理位置
        wx.request({
          url: `https://geoapi.qweather.com/v2/city/lookup?location=${longitude},${latitude}&key=${key}`,
          success(res){
          //  console.log(res)
            that.setData({
              city:res.data.location[0].adm2,
              area:res.data.location[0].name
            })
          }
        })
        //指数
        wx.request({
          url: `https://devapi.qweather.com/v7/indices/1d?location=${longitude},${latitude}&key=${key}&type=${0}`,
          success(res){
           // console.log(res)
            that.setData({
              advice:res.data.daily[2].text
            })
          }
        })
        //空气质量
        wx.request({
          url: `https://devapi.qweather.com/v7/air/now?location=${longitude},${latitude}&key=${key}`,
          success(res){
            console.log(res)
            that.setData({
              weather_quality:res.data.now.category
            })
          }
        })
      }
    })
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
    
  }
})