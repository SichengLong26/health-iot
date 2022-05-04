#include "bsp_adc.h"
#define ADC1_DR_Address    ((u32)0x40012400+0x4c)  //定义ADC的内存地址
#include <math.h>
static int floag1=0;
#define CAL_PPM 20  // 校准环境中PPM值
#define RL			5		// RL阻值
static float R0=1; // 元件在洁净空气中的阻值
float ppm;
__IO uint16_t ADC_ConvertedValue;
static void ADC1_GPIO_Config(void) //ADC端口配置
{
	GPIO_InitTypeDef GPIO_InitStructure;//GPIO初始化结构体；
	
	RCC_AHBPeriphClockCmd(RCC_AHBPeriph_DMA1, ENABLE);//使能DMA的时钟；
	
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1 | RCC_APB2Periph_GPIOC, ENABLE);//打开ADC1和GPIOC的时钟；
	
	GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0;//配置PC0引脚；
	
	GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AIN;//设置工作模式为模拟输入；
	
	GPIO_Init(GPIOC, &GPIO_InitStructure);//初始化GPIOC；
}
static void ADC1_Mode_Config(void)  //配置ADC1的模式
{
	/********以下是有关DMA的相关配置*************/
	
	DMA_InitTypeDef DMA_InitStructure;//DMA初始化结构体定义DMA初始化变量
	
	ADC_InitTypeDef ADC_InitStructure;//ADC初始化结构体定义ADC初始化变量
	
	DMA_DeInit(DMA1_Channel1);//设置DMA1通道1
	
	
	DMA_InitStructure.DMA_PeripheralBaseAddr = ADC1_DR_Address;//设定ADC的地址；
	
	DMA_InitStructure.DMA_MemoryBaseAddr = (u32)&ADC_ConvertedValue;//内存地址，采集的数据存在这里；
	
	DMA_InitStructure.DMA_DIR = DMA_DIR_PeripheralSRC;//设为源，表示数据是从这里出发的；
	
	DMA_InitStructure.DMA_BufferSize = 1;//因为一次只发送一个数据所以设为1；
	
	DMA_InitStructure.DMA_MemoryInc = DMA_MemoryInc_Disable;//因为只涉及一路数据的采集发送因此内存地址不变
	
	DMA_InitStructure.DMA_PeripheralInc = DMA_PeripheralInc_Disable;//因为只涉及一路数据的采集发送因此外设地址不变
	
	DMA_InitStructure.DMA_PeripheralDataSize = DMA_PeripheralDataSize_HalfWord;//外设至少要半字即16位才可以满足要求
	
	DMA_InitStructure.DMA_MemoryDataSize = DMA_MemoryDataSize_HalfWord;//内存至少要半字即16位才可以满足要求
	
	DMA_InitStructure.DMA_Mode = DMA_Mode_Circular;//DMA模式为循环传输，因为要采集多次;
	
	DMA_InitStructure.DMA_Priority = DMA_Priority_High;//设置为高、中、低优先级都可以因为只有一路在采集
	
	DMA_InitStructure.DMA_M2M = DMA_M2M_Disable;//关闭内存到内存的传输，因为我们需要的是外设传到内存的传输
	
	DMA_Init(DMA1_Channel1,&DMA_InitStructure);//DMA1通道1最后初始化
	
	DMA_Cmd(DMA1_Channel1, ENABLE);//使能DMA1的通道1；
	

	
	/********以下是有关ADC的相关配置*************/
	
	ADC_InitStructure.ADC_Mode = ADC_Mode_Independent;//设置为独立ADC模式，因为其采集只有一个通道；
	
	ADC_InitStructure.ADC_ScanConvMode = DISABLE;//禁止扫描模式，扫描模式适用于多通道采集
	
	ADC_InitStructure.ADC_ContinuousConvMode = ENABLE;//开启连续转换，以不停地进行ADC转换
	
	ADC_InitStructure.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None;//不使用外部触发转换，而使用内部软件触发
	
	ADC_InitStructure.ADC_DataAlign = ADC_DataAlign_Right;//采集数据右对齐
	
	ADC_InitStructure.ADC_NbrOfChannel = 1;//ADC number of channel,即要转换的通道数目；
	
	ADC_Init(ADC1, &ADC_InitStructure);//调用ADC初始化库函数
	
	RCC_ADCCLKConfig(RCC_PCLK2_Div8);//配置ADC时钟为8分频，9MHZ
	
	ADC_RegularChannelConfig(ADC1, ADC_Channel_10, 1, ADC_SampleTime_55Cycles5);//配置ADC1的通道为55.5个采样周期，
	
	ADC_DMACmd(ADC1, ENABLE);//使能ADC1的DMA传输
	
	ADC_Cmd(ADC1, ENABLE);//使能ADC1;
	
	while(ADC_GetResetCalibrationStatus(ADC1));//等待校准寄存器复位完成；
	
	ADC_StartCalibration(ADC1);//调用校准函数开始ADC校准；
	
	while(ADC_GetResetCalibrationStatus(ADC1));//等待校准寄存器复位完成；
	
	ADC_SoftwareStartConvCmd(ADC1, ENABLE);//前面不采用外部触发，而是采用内部软件触发，此处使能软件触发
	

}

void ADC1_Init(void)
{
	 ADC1_GPIO_Config();
	 ADC1_Mode_Config();
		
}	


 // 传感器校准函数
void MQ2_PPM_Calibration(float RS)
{
    R0 = RS / pow(CAL_PPM / 613.9f, 1 / -2.074f);
}
 
 // MQ2传感器数据处理
float MQ2_GetPPM(void)
{
    float Vrl = (float) ADC_ConvertedValue/4096*3.3;
    float RS = (3.3f - Vrl) / Vrl * RL; 
    if(Vrl>1&&floag1==0) // 获取系R0
    {
		MQ2_PPM_Calibration(RS);
		floag1=1;
    }
    ppm = 613.9f * pow(RS/R0, -2.074f);
    return  ppm;
}


