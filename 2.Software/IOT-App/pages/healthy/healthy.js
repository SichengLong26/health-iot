var mqtt=require('../../utils/mqtt.min.js')
let client=null
Page({
    data: {
        Heart:0,
        Spo2:0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.connectmqtt()
    },
    connectmqtt:function(){
        var that=this
        const options={
            connectTimeout:4000,
            clientId:"d1f22er224",
            port:8084,
            username:'f585c3d5f499ffea9b710f13709a855d',
            password:'123456'
        }
        client=mqtt.connect('wxs://t.yoyolife.fun/mqtt',options)
        client.on('connect',(e)=>{
            console.log("mqtt服务器连接成功")
            client.subscribe('/iot/943/pub',
            {qos:0},function(err){
                if(!err){
                    console.log("订阅成功！")
                }
            })
        })
        client.on('message',function(topic,message){
            let dataFrameDev=[]
            dataFrameDev=JSON.parse(message)
            console.log(dataFrameDev)
        })
    }
  
})