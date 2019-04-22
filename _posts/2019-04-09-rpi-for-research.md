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


1.  **Run a script after a specefied interval.** We often require that a script executes, say after every 5 minutes in the Raspberry Pi. Or to say, our script receives data from the sensor in every 5 minutes.
    * We use the cron software utility in Linux for scripts that require execution after fixed interval.
    * Access cron window using the command ```crontab -e```
    * Write: ``` */5 * * * * python3 /home/pi/test.py > home/pi/test.log 2>&1```
    * The above command will execute the test.py script every 5 minutes. The Standard Output (stdout) and Standard Error (stderr) both will be redirected to the file test.log



2. **Restart a script automatically after Pi reboots.** A raspberry Pi may reboot, most dominantly due to a power outage and in that case, we would want our script to start automatically after the boot. This too can be achieved using the following command in crontab.
    * Open the cron job scheduler window as before
    * Write, ```@reboot  python3 /home/pi/test.py```
    * Note that, you can use ```@reboot``` and ```*****``` simultaneously for a single script. In that case, the script will execute automatically after boot and re-execute after every interval. For example, with ```*/5 ****``` the script will execute after every 5 minutes interval
    * You can learn more about cronjob from the simple documentation at the official [Raspberry Pi page](https://www.raspberrypi.org/documentation/linux/usage/cron.md)



3. **Getting the right time in Raspberry Pi without an RTC or Internet but with Local Network.** Our Raspberry Pi collects data from sensors and hence keeping a tab of the right time is important. But we do not unnecessarily want our Pi to access the internet due to obvious security concerns and the Pi does not have an onboard RTC. We could manage to get the time of Raspberry Pi right by setting up one of our desktop computers as an NTP server from which the Raspberry Pi updates its time. We followed the following procedure:
    * First, set up a desktop or a server as a NTP server in your lab. Your Raspberry pi will ping this server to update its time. To set up, type ```sudo apt install ntp```
    *  Check is NTP is running successfully. Type ```sudo service ntp status```. You should see the ```active``` status on screen. 
    *  Open UDP port 123 so that your Raspberry Pi can connect to this NTP server. Type ```sudo ufw allow from any to any port 123 proto udp```
    *  Now, do the following on your Raspberry Pi. Access the file timesyncd.conf by typing ```sudo nano /etc/systemd/timesyncd.conf ```. Replace the line ```NTP=``` with ```NTP = x.x.x.x``` where ```x.x.x.x``` is your NTP server's IP address.
    
4. **Setting a static IP for the Raspberry Pi**. We always prefer if our Raspberry Pi always gets the same IP address from the DHCP pool.  We followed the following procedure to set a static IP.

    *  We can see the IP assigned to our Pi and the network size by typing ```ip -4 addr show | grep global```
    * The second address visible on typing the above command is the  brd (broadcast) address of the network.
    * We can find the address of our router (or gateway) by typing the command ```ip route | grep default | awk '{print $3}'```
    * Lastly, we need the DNS which we get by typing cat ```/etc/resolv.conf```
    * Now we edit the file  ```/etc/dhcpcd.conf```  with all the information found from above steps.
    * <div class="alert alert-danger" role="alert">HEADS UP! Your Raspberry Pi won't be assigned the IP you listed in the ```dhcpcd.conf``` file if that IP is already assigned to some other device.</div> 
    
---

Developing article.


