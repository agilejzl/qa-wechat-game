//app.js
const util = require('utils/util.js')

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log("loginCode: " + res.code)
        var resCode = res.code;
        // 获取用户信息
        wx.getSetting({
          success: res => {
            console.log("sysInfo: ", wx.getSystemInfoSync())
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                // withCredentials: true,
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res.userInfo
                  console.log("wxUserInfo2: ", res)

                  // var js_code = wx.getStorageSync('resCode');
                  var js_code = resCode
                  if (js_code && this.globalData.userInfo) {
                    wx.request({
                      method: 'POST',
                      url: this.globalData.serverHost + 'api/sessions',
                      header: { 'Accept': 'application/vnd.api+json;version=1' },
                      data: { data: { js_code: js_code, user_info: this.globalData.userInfo, sys_info: wx.getSystemInfoSync() } },
                      success: res => {
                        console.log("signInfo2: ", res.data.data)
                        // wx.setStorageSync('auth_info', res.data.data)
                        this.globalData.authInfo = res.data.data
                      }
                    })
                  } else {
                    console.warn('signInfo2: null', js_code, this.globalData)
                  };

                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  var that = this
                  that.int = setInterval(function(){
                    if (that.userInfoReadyCallback && !util.isEmpty(that.globalData.authInfo)) {
                      // console.log("authInfo ->", that.globalData.authInfo)
                      if (that.globalData.authInfo.user.name != null) {
                        clearInterval(that.int)
                        that.userInfoReadyCallback(res)
                      };
                    }
                  }, 50)
                  
                }
              })
            } else {
              wx.request({
                method: 'POST',
                url: this.globalData.serverHost + 'api/sessions',
                header: { 'Accept': 'application/vnd.api+json;version=1' },
                data: { data: { js_code: resCode, user_info: this.globalData.userInfo } },
                success: res => {
                  console.log("signInfo0: ", res.data.data)
                  // wx.setStorageSync('auth_info', res.data.data)
                  if (util.isEmpty(this.globalData.authInfo)) {
                    this.globalData.authInfo = res.data.data
                  };
                }
              });
            }
          }
        });
      }
    });
  },
  globalData: {
    serverHost: 'https://qa-api.kdan.cn/',
    // serverHost: 'http://localhost:8090/',
    userInfo: null,
    authInfo: {}
  }
})