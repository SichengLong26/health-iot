/*
1.项目名称：绿深旗舰店DHT11模块STM32F103RCT6测试程序
2.显示模块：串口返回数据
3.使用软件: keil5 for ARM
4.配套上位机：无
5.项目组成：DHT11模块
6.项目功能：串口返回测量的温湿度数据，波特率9600.
7.主要原理：具体参考DHT11数据手册
8.购买地址：https://lssz.tmall.com 或淘宝上搜索“绿深旗舰店”
10.版权声明：绿深旗舰店所有程序都申请软件著作权。均与本店产品配套出售，请不要传播，以免追究其法律责任！
接线定义:
	VCC--3.3V/5V
	GND--GND
	DATA--PA15
*/
#include "sys.h"
#include "delay.h"
#include "DHT11.h"
#include "stdio.h"
#include "usart.h"
#include "timer.h"
#include "led.h"
#include "oled.h"
#include "bsp_adc.h"
#include "bsp_usart1.h"
#include "usart.h"
//网络协议层
#include "onenet.h"
//网络设备
#include "esp8266.h"
#include "cJSON.h"

extern __IO uint16_t ADC_ConvertedValue;
float ADC_ConvertedValueLocal;

const char *devSubTopic[] = {"/iot/943/sub"};
const char devPubTopic[] = "/iot/943/pub";
unsigned short timeCount = 0;	//发送间隔变量
unsigned char *dataPtr = NULL;
char PUB_BUF[256]; //上传数据的buf
u8 LED_Status = 0;

int main(void)
{		
	LED0=1;
	u8 temperature;
	u8 humidity;
	float smoke;
	int t=0;
	NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);//设置中断优先级分组为组2：2位抢占优先级，2位响应优先级
	LED_Init();		  	//初始化与LED连接的硬件接口
	TIM3_Int_Init(4999,7199);//10Khz的计数频率，计数到5000为500ms  
	delay_init();
	Usart1_Init(115200); //debug调试
	Usart2_Init(115200); //esp8266串口
	DHT11_Init();
	OLED_Init();			//初始化OLED  
	OLED_Clear(); 
	UsartPrintf(USART_DEBUG, " Hardware init OK\r\n");
	ESP8266_Init();
	ADC1_Init();
	while(OneNet_DevLink())			//接入OneNET
		delay_ms(500);	
	OneNet_Subscribe(devSubTopic, 1);
	
	while(1)
	{
		ADC_ConvertedValueLocal = (float) ADC_ConvertedValue/4096*3.3;
		OLED_Clear();
		DHT11_Read_Data(&temperature, &humidity);	//读取温湿度值
		smoke=MQ2_GetPPM();
		UsartPrintf(USART1,"温度:%d℃\r\n湿度:%d%%RH\r\n浓度:%.2f\r\n", temperature, humidity,smoke);
		t=temperature;
		OLED_ShowString(0,0,"Temperature");
		OLED_ShowNum(83,0,t,3,16);//显示温度
		OLED_ShowString(0,3,"Humidity");
		OLED_ShowNum(83,3,humidity,3,16);//显示温度
		
		if(++timeCount >= 20)									//发送间隔5s
		{
			LED_Status = GPIO_ReadInputDataBit(GPIOA,GPIO_Pin_8);
			UsartPrintf(USART_DEBUG, "OneNet_Publish\r\n");
			sprintf(PUB_BUF,"{\"Temp\":%d,\"Hum\":%d,\"Led\":%d,\"Smoke\":%.2f}", temperature, humidity,LED_Status?0:1,smoke);
			OneNet_Publish(devPubTopic, PUB_BUF);
			timeCount = 0;
			ESP8266_Clear();
		}
		
		LED0 = LED_Status;
		dataPtr = ESP8266_GetIPD(3); // 8266接收信息
		if(dataPtr != NULL)
			OneNet_RevPro(dataPtr);
		
		delay_ms(500);
	}
}


