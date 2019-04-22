---
title: Making Raspberry Pi Ready For Research Applications
layout: post
author: rishi
signature_img:
use_math: true
use_code: true
use_google_fonts: true
time: 5 min
---

In Research, we often require actionable insights that we get from the data we collect. Raspberry Pi (the cheapest computer) plays a very crucial role in data acquisition and processing. In this blog post, you will learn how we make the Raspberry Pi ready for research application.

1.  We often require that a script restarts automatically after the Raspberry Pi reboots. We also have scripts that require execution after every 5 minutes and some script require that they keep running continuously (like a web server). Depending on the kind of script, we take different actions as explained below.
    * For scripts that require execution after every fixed interval. We use the cron software utility in Linux for scripts that require execution after fixed interval. **Eg. A script that needs to be executed every 5 minutes**.
    * Access cron window using the command ```crontab -e```
    * Write: ``` */5 * * * * python3 /home/pi/test.py > home/pi/test.log 2>&1```
    * The above command will execute the test.py script every 5 minutes. The Standard Output (stdout) and Standard Error (stderr) both will be redirected to the file test.log

2. A raspberry Pi may reboot, most dominantly due to a power outage and in that case, **we would want our script to start automatically after the boot**. This too can be achieved using the following command in crontab.
    * Open the cron job scheduler window as before
    * Write, ```@reboot  python3 /home/pi/test.py```
    * Note that, you can use ```@reboot``` and ```*****``` simultaneously for a single script. In that case, the script will execute automatically after boot and re-execute after every interval. For example, with ```*/5 ****``` the script will execute after every 5 minutes interval
    * You can learn more about cronjob from the simple documentation at the official [Raspberry Pi page](https://www.raspberrypi.org/documentation/linux/usage/cron.md)

3. **Getting the right time in Raspberry Pi without an RTC or Internet but with Local Network.** Our Raspberry Pi collects data from sensors and hence keeping a tab of the right time is important. But we do not unnecessarily want our Pi to access the internet due to obvious security concerns and the Pi does not have an onboard RTC. We could manage to get the time of Raspberry Pi right by setting up one of our desktop computers as an NTP server from which the Raspberry Pi updates its time. We followed the following procedure:
    * First, set up a desktop or a server as a NTP server in your lab. Your Raspberry pi will ping this server to update its time. To set up, type ```sudo apt install ntp```
    *  Check is NTP is running successfully. Type ```sudo service ntp status```. You should see the ```active``` status on screen. 
    *  Open UDP port 123 so that your Raspberry Pi can connect to this NTP server. Type ```sudo ufw allow from any to any port 123 proto udp```
    *  Now, do the following on your Raspberry Pi. Access the file timesyncd.conf by typing ```sudo nano /etc/systemd/timesyncd.conf ```. Replace the line ```NTP=``` with ```NTP = x.x.x.x``` where ```x.x.x.x``` is your NTP server's IP address.




