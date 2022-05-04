var mqtt=require('../../utils/mqtt.min.js')
var client=null
Page({
    /**
     * 页面的初始数据
     */
    data: {
        Temp:0,
        Hum:0,
        Smoke:0,
        Led:false,
        Beep:false,
        event:""
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(){
        this.connectmqtt()
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
                Smoke:dataFrameDev.Smoke
            })
            console.log(that.data.Temp)
        })
        client.on('reconnect', (error)=>{
            console.log('正在重新连接'+error)
        })
        client.on('error', (error)=>{
            console.log('连接失败')
        })
    },
    handleLED(e){
        var that=this
      //  console.log(e)
        let {value}=e.detail
      //  console.log(value)
      that.setData({
          Led:value,
      })
      if(value===true){
          that.setData({
            event:"您已开灯！",
          })
          client.publish('/iot/943/sub','{"target":"LED","value":1}',function(err){
            if(!err){
              console.log("成功发布开灯命令")
            }
          })
      }else{
        that.setData({
            event:""
          })
          client.publish('/iot/943/sub','{"target":"LED","value":0}',function(err){
            if(!err){
              console.log("成功发布关灯命令")
              }
            })
      }

    }
})