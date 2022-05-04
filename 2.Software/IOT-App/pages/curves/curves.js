// pages/index/lookrecord/lookrecord.js
var wxCharts = require('../../utils/wxcharts.js');   //引入wxChart文件
var mqtt=require('../../utils/mqtt.min.js') // 引入mqtt文件
var util = require("../../utils/util.js");
var client=null
var app = getApp();
var lineChart = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[
      {
        id:0,
        name:"趋势图",
        isActive:true
      },{
          id:1,
          name:"数据记录",
          isActive:false
      },
    ],
    time:"",
    xtime:"",
    Temp:0,
    temp_average:0,
    temp_sum:0,

    Hum:0,
    hum_average:0,
    hum_sum:0,

    Smoke:0,
    smoke_average:0,
    smoke_sum:0,

    Temp_array:[],
    Hum_array:[],
    Smoke_array:[],
    time_array:[],
    waterwaterdata:[50, 100, 80, 115, 120, 90, 125],
    smokesmokedata:[60, 70, 90, 105, 120, 130, 95],
    tempdata: [60,90, 60, 110,120,105,70],  //数据点
    categories: ['2018-6-13', '2018-6-14', '2018-6-15', '2018-6-16', '2018-6-17', '2018-6-18', '2018-6-19'],    //模拟的x轴横坐标参数
  },

  touchHandler: function (e) {
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(){
    this.curve()
    this.connectmqtt()
  //  this.gettime()
  },
  onShow:function(){
    this.notification()  // 调用方法
  },
  connectmqtt:function(){
    var that=this
    const options={
        connectTimeout:4000,
        clientId:"df2er24",
        port:8084,
        username:'f585c3d5f499ffea9b710f13709a855d',
        password:'123456'
    }
    client=mqtt.connect('wxs://t.yoyolife.fun/mqtt',options)
    client.on('connect',(e)=>{
        console.log("服务器连接成功")
        client.subscribe('/iot/943/pub',{qos:0},function(err){
            if(!err){
                console.log("订阅成功")
            }
        })
    })
    // 信息监听事件
    client.on('message', function(topic,message){
       // console.log(topic)
        let dataFrameDev ={}
        dataFrameDev = JSON.parse(message)
        console.log(dataFrameDev)
        that.setData({
            Temp:dataFrameDev.Temp,
            Hum:dataFrameDev.Hum,
            Smoke:dataFrameDev.Smoke,
        })
        // 设置温度、湿度、烟雾浓度的数组
        that.setData({
            Temp_array:that.data.Temp_array.concat(that.data.Temp),
            Hum_array:that.data.Hum_array.concat(that.data.Hum),
            Smoke_array:that.data.Smoke_array.concat(that.data.Smoke)
        })
        console.log(that.data.Temp)
        console.log(that.data.Temp_array)
        console.log(that.data.Hum_array)
        console.log(that.data.Smoke_array)

        // 获取到sensor data 后开始获取本地时间
        var xtime=that.data.xtime
        that.setData({
            xtime:util.formatTime(new Date())
        })
        console.log(that.data.xtime)
        that.setData({
          time_array:that.data.time_array.concat(that.data.xtime)
        })


        // 求烟雾浓度平均值
        var smoke_average=that.data.smoke_average
        var Smoke_array=that.data.Smoke_array
        var smoke_sum=that.data.smoke_sum
        that.setData({
          smoke_sum:smoke_sum+that.data.Smoke,
          smoke_average:parseInt(that.data.smoke_sum/(Smoke_array.length))
        })
        console.log(that.data.time_array)
        console.log("平均浓度"+that.data.smoke_average)

        // 求温度平均值
        var temp_average=that.datatempe_average
        var Temp_array=that.data.Temp_array
        var temp_sum=that.data.temp_sum
        that.setData({
          temp_sum:temp_sum+that.data.Temp,
          temp_average:parseInt(that.data.temp_sum/(Temp_array.length))
        })
        console.log(that.data.time_array)
        console.log("平均温度"+that.data.temp_average)

        // 求平均湿度
        var hum_average=that.data.hum_average
        var Hum_array=that.data.Hum_array
        var hum_sum=that.data.hum_sum
        that.setData({
          hum_sum:hum_sum+that.data.Hum,
          hum_average:parseInt(that.data.hum_sum/(Hum_array.length))
        })
        console.log(that.data.time_array)
        console.log("平均湿度"+that.data.hum_average)

    })
    client.on('reconnect', (error)=>{
        console.log('正在重新连接'+error)
    })
    client.on('error', (error)=>{
        console.log('连接失败')
    })
},
  curve (e) {
    var that=this
    
    var windowWidth = '', windowHeight='';    //定义宽高
    that.data.setInter = setInterval(function(){
      var waterwaterdata=that.data.Hum_array
      var smokesmokedata=that.data.Smoke_array
      var tempdata=that.data.Temp_array
      
      var categories=that.data.time_array
      try {
        var res = wx.getSystemInfoSync();    //试图获取屏幕宽高数据
        windowWidth = res.windowWidth / 750 * 690;   //以设计图750为主进行比例算换
        windowHeight = res.windowWidth / 750 * 550    //以设计图750为主进行比例算换
      } catch (e) {
        console.error('getSystemInfoSync failed!');   //如果获取失败
      }
      lineChart = new wxCharts({     //定义一个wxCharts图表实例
        canvasId: 'lineCanvas',     //输入wxml中canvas的id
        type: 'line',       //图标展示的类型有:'line','pie','column','area','ring','radar'
        categories: categories,
        animation: true,  //是否开启动画
        series: [{   //具体坐标数据
          name: '温度',  //名字
          data: tempdata, //数据点
          format: function (val, name) {  //点击显示的数据注释
            return val + 'mmHg';
          }
        }, {
          name: '烟雾浓度',
          data: smokesmokedata,
          format: function (val, name) {
            return val + 'mmHg';
          }
        }, {
          name: '湿度',
          data: waterwaterdata,
          format: function (val, name) {
            return val + '%';
          }
        }
        ],
        xAxis: {   //是否隐藏x轴分割线
          disableGrid: true,
        },
        yAxis: {      //y轴数据
          title: '数值',  //标题
          format: function (val) {  //返回数值
            return val.toFixed(2);
          },
          min: 30,   //最小值
          max:180,   //最大值
          gridColor: '#D8D8D8',
        },
        width: windowWidth,  //图表展示内容宽度
        height: windowHeight,  //图表展示内容高度
        dataLabel: false,  //是否在图表上直接显示数据
        dataPointShape: true, //是否在图标上显示数据点标志
        extra: {
          lineStyle: 'curve'  //曲线
        },
      });
    },3000)
  },
  notification: function () {
    var _this = this;
    var time = _this.data.time;
    _this.data.setInter = setInterval(function () {
       _this.setData({
        time: util.formatTime(new Date())
        }); 
        //console.log("时间为"+_this.data.time);   
    }, 1000); 
  },
  // gettime(){
  //   var that=this
  //   var xtime=that.data.xtime
  //   that.setData({
  //     xtime:util.formatTime(new Date())
  //   })

  // }
  handleItemChange(e){
    //    console.log(e)
        const {index}=e.detail;
        let {list}=this.data;
        list.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
        this.setData({
            list
        })  
    }

})