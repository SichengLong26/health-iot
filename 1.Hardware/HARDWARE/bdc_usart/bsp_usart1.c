#include "bsp_usart1.h"
void USART1_Config(void)//配置串口
{
		GPIO_InitTypeDef GPIO_InitStructure;//GPIO初始化结构体
		USART_InitTypeDef USART_InitStructure;//串口初始化结构体
		
		/* config USART1 clock */
		RCC_APB2PeriphClockCmd(RCC_APB2Periph_USART1 | RCC_APB2Periph_GPIOA, ENABLE);//开串口1的时钟
		
		/* USART1 GPIO config */
		/* Configure USART1 Tx (PA.09) as alternate function push-pull */
		GPIO_InitStructure.GPIO_Pin = GPIO_Pin_9;//串口1是通过PA9引脚输出的
		GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;//GPIO模式为片上外设输出
		GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;//引脚速度为50MHZ
		GPIO_Init(GPIOA, &GPIO_InitStructure);  // PA口初始化  
		/* Configure USART1 Rx (PA.10) as input floating */
		GPIO_InitStructure.GPIO_Pin = GPIO_Pin_10;//串口1是通过PA10引脚输入的，
		GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;//设置为浮空输入方式
		GPIO_Init(GPIOA, &GPIO_InitStructure);//初始化PA口
			
		/* USART1 mode config */
		USART_InitStructure.USART_BaudRate = 115200;//串口波特率为115200
		USART_InitStructure.USART_WordLength = USART_WordLength_8b;//数据长度为8位
		USART_InitStructure.USART_StopBits = USART_StopBits_1;//1个停止位
		USART_InitStructure.USART_Parity = USART_Parity_No ;//无校验位
		USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;//硬件流控制位
		USART_InitStructure.USART_Mode = USART_Mode_Rx | USART_Mode_Tx;//全双工发送he接收模式
		USART_Init(USART1, &USART_InitStructure); //串口初始化
		USART_Cmd(USART1, ENABLE);//串口使能

}

/**********************************************************************/



///重定向c库函数printf到USART1
int fputc(int ch, FILE *f)//FILE *f为一个文件流。数据存在这里
{
		/* 发送一个字节数据到USART1 */
		USART_SendData(USART1, (uint8_t) ch);
		
		/* 等待发送完毕 */
		while (USART_GetFlagStatus(USART1, USART_FLAG_TC) == RESET);		
	
		return (ch);
}

///重定向c库函数scanf到USART1
int fgetc(FILE *f)
{
		/* 等待串口1输入数据 */
		while (USART_GetFlagStatus(USART1, USART_FLAG_RXNE) == RESET);

		return (int)USART_ReceiveData(USART1);
}
