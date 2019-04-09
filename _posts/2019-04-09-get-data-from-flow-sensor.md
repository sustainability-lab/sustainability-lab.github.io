---
title: Getting data from Flow Sensors
layout: post
use_math: true
use_code: true
---

Water scarcity problem is highly prevalent in western India. Studies estimate that 20-35% of the total water flow is wasted due to leakages in the network, which if timely rectified can reduce wastage by more than 90%. This necessities the need to monitor the water flow using sensing infrastructure. Water flow sensors are typically placed in between water piper by physically cutting them. Some of these flow sensors are even connected to a flow meter. Flow sensors output data as a current. Data in the form of current does not attenuate over a long distance, unlike voltage. The output current typically ranges from 4mA to 20mA.

![A flow meter](/images/flow-meter.jpg)

We have to make the flow sensor data available to a microprocessor/microcontroller so that we can further store the data in a database and process it. We used Raspberry Pi for this purpose. But devices such as Raspberry Pi takes voltage as an input signal and not current. Thus, we need a current to voltage converter. We used an off the shelf module (XY-IT0V) that converts 4-20mA current to 0-5V/3.3V signal.

![Current to voltage converter](/images/c2v.jpg)

**Current to Voltage Converter:**
The current to voltage converter module had minimal documentation online. According to the documentation, the output voltage never exceeds the input supply voltage. Also, at 0mA current, the circuit should ideally show 0V. At 40mA current, the circuit should ideally show the external voltage value. We powered this circuit with 5V and tested with current source generated in our lab. We observed that  at 0mA current, the the output voltage fluctuates between 0.20-0.28V. At 40mA, the voltage value fluctuates between 4.8-5.5V. There are two potentiometers on the module, namely ZERO and SPAN potentiometers. When the current input is the minimum (0mA or 4mA), we are suppose to adjust the ZERO potentiometer so that the output voltage  is the minimum (0.0V or other voltage). When the current input is at maximum (40mA or other), we need to adjust the SPAN potentiometer so that the output voltage is the maximum (3.3V or 5V or 10V).

Once we have the voltage signal (in 0V to 5V range), the next immediate step was to convert this Analog signal Digital value. Since the Raspberry Pi does not have a on-board ADC, we used the classic ADS1115 ADC for this purpose. It has a very good documentation online and we explain it in brief here. 

![Current to voltage converter](/images/ads1115.jpg)

**Analog to Digital Conver (ADS1115)**
The ADS1115 is a 15 bit resolution ADC. It works on the I2C protocol and hence we can connect upto 4 analog input device to this sensor with each having a different address. For our experiment, we connected the output voltage to the ADC pin A0. We wire up the ADC with the Raspberry Pi Model B+ as shown in the figure below. The A0 pin of ADC is connected to the voltage output from the current to voltage converter module.

On running the file, we should see the ADC value and the voltage value on the screen. We later created a MySQL database on the Raspberry Pi to store the ADC data periodically after every 5 minutes. We can execute the Python Script every 5 minutes using the cron job scheduler of the OS in the Raspberry Pi.



