---
title: Getting Data From Multiple EM6400NG Smart Electric Meters
layout: post
author: sajal,rishi
signature_img: /images/testing-em-lab.jpg
use_math: true
use_code: true
use_google_fonts: true
comments: true
---

As technology advances every day, the traditional electric meters are being replaced by smart electric meters. These smart electric meters are more accurate, follows industrial communication protocol for seamless integration with different intelligent devices which can work in harmony together, to provide more sustainable solutions to existing problems.

The smart meter here we use is EM6400NG from Schneider electric. These meters are suitable for any kind of Industry/ Building or Infrastructure application and newest and most advanced of their kind at the time of writing this blog. These meters are of very high accuracy and are consistent with a range of operating frequency making them global smart electric meters in true sense.

In the Water Servicing Center 2 (WSC-2) building of IIT Gandhinagar campus, we have 4 smart electric meters incorporated with 4 pumps. These pumps are responsible for providing water to the various parts of the campus. We aim to gather electric meter data of these pumps using Raspberry Pi and store the data generated to understand the relation between the power consumption of pumps and the amount of water consumed/pumped by these pumps.

EM6400NG supports Modbus protocol over RS-485. The data registers of the smart meter can be accessed using a python script which implements Modbus protocol using pymodbus library. This requires parameters like baud rate, stop bits, parity (even/odd/none) which should match with meter settings ( these parameters can be customized in the meter, see meter manual for information on how to set these parameters ), base_register and block_size which are set by the user according to their needs as described in the following steps.

**Step 1: Installation and  preconfiguration of meters:**
We installed 4 meters each with a unique device Id (1 through 4) and the following common parameters.
- Baud Rate: 19200 kbps
- Parity: Even
- Stop Bits: 1 


![](/images/installing-em-site.jpg)
Fig1: Installation of 4 smart meters on site.


**Step 2: Daisy chaining the 4 meters:**
Since we wanted data from all the 4 meters, we followed the standard daisy chaining practice as shown below.


![](/images/daisy-chaining-em.png)
Fig2: Daisy Chaining of Smart Meters (Image Credit: EM6400NG Manual)


**Step 3: Determining the parameters to be measured.**
We decided to measure the following parameters as shown in the image below. After recognizing the parameters, we have to see what are the register numbers and data type of the desired parameters to be recorded. This information is available in the manual of EM6400NG meter. After determining the register values, we need to determine the block size. Block size is the number of registers, that you want to read in a continuous manner. For example, if we want to read registers from 3001 - 3004, in this case, the base register will be 3000, and the block size will be 4, as we need to read four continuous registers.

For example, to read the operating frequency value of the meter, we need to read the register 3110 and register 3111, combine them, and then decode the combined data to get the result. In Fig 2, the data type column is followed by block_size column.


![](/images/paramToRecord-em.png)
Fig3: Google Sheet snapshot showing the parameters that we are recording


**Step 4: Sanity checking if register values are responding correctly.**
We used [ModScan32](https://www.win-tech.com/html/demos.htm) software to verify if the meter is responding correctly to the desired register values.

**Step 5: Converting RS 232 to USB TTL.**
For this step we used an Over the shelf [converter module](https://amzn.to/2WuIn0N). We connected one end of the daisy chain cable to the converter. The converter module was connected to our Raspberry Pi.

**Step 6: Writing a Python script to read register values and store it in CSV file.**
We wanted the output of each of the meter data to be stored in a CSV file. For this, we wrote a [Python script](https://github.com/rishi-a/DataCollection/tree/master/meterDataCollection). Pymodbus library is a Modbus protocol stack which can be used to communicate with Modbus devices. Pymodbus is used to read register values from the smart meters by passing the method type (RTU in our case), communication port, stop bits, bytesize, parity bits and the baud rate as arguments. We use the round robin method to read the 4 meters as reading 4 meters at once is not possible. We can read one register at a time only i.e. 16 bits and the data type is of 32 bits or spread over 2 registers. The script reads all the register values and then combine the consecutive registers to make one reading. For example, data from the register 3110 and 3111 are combined together, 3112 and 3113 are combined together.  The values returned by the registers of the meters were in IEEE 754 format. We wrote a decoding function that would convert these IEEE 754 values to a simple floating point value. After reading from a meter, for example from meter id /slave address 2, we decode the data by using the decoding script, and after decoding the data we check if there is file already present for the respective meter. If there is, it will simply add the newly acquired data as a new row in that CSV file, else it will create a new CSV file for the meter id. 

**Step 7: Failsafe operation and sending the meter data to the server**
We used our experience from a [previous blog post](https://sustainability-lab.github.io/2019/04/15/rpi-for-research.html) to make the script restart if the Rpi reboots. Also, we made sure that the respective CSV files generated by the script get sent to our central server every day at 1400 hours.


The Python [script](https://github.com/rishi-a/DataCollection/tree/master/meterDataCollection) for EM6400NG was motivated from the [script](https://github.com/nipunbatra/smart_meter) written by [Prof. Nipun Batra](https://nipunbatra.github.io/) for EM6400.
