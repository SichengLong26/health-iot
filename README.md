# health-iot

这是一个基于MQTT协议的物联网健康监测系统，目前可以监测人体的心率、血氧等生理参数；
也可以监测家庭的温湿度、烟雾浓度等环境参数

### 设计流程图
![image](https://user-images.githubusercontent.com/97653369/166865967-b661f9a5-59c4-4277-bf1f-421781c9bacc.png)

### 项目代码说明
#### 1.Harware:硬件部分的所有程序
#### 1.Hardware\HARDWARE：传感器驱动程序
#### 1.Hardware\NET：数据传输程序
#### 2.Software：微信小程序上位机程序
#### 2.Software\IOT-App\components:微信小程序复组件
#### 2.Software\IOT-App\pages：微信小程序各个页面及功能

### 模块接线

##### DHT11模块： DO - PA15

##### ESP8266模块：TXD - PA3 / RXD - PA2

##### MQ2模块：AO - PC0
##### MAX30102VCC引脚连接STM32F103mini单片机的5伏引脚，GND连接5伏对应的GND，SCL连PC12，SDA连PC11，INT连PA5。MAX30102的其他引脚没有用到。
