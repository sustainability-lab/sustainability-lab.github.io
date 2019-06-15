---
title: Making Raspberry Pi Ready For Research Applications
layout: post
author: rishi
signature_img: /images/rpi-for-research.png
use_math: true
use_code: true
use_google_fonts: true
comments: true
---

In research, collected data are often subjected to actionable insights. Raspberry Pi (one of the cheapest computer) plays a very crucial role in data acquisition and processing. In this blog post, we explain the changes we made on our Pi to aid it in our research work.

---

**Run a script after a specefied interval.** We often require that a script executes, say after every 5 minutes in the Raspberry Pi. Or to say, our script receives data from the sensor in every 5 minutes.
* We use the cron software utility in Linux for scripts that require execution after fixed interval.
* Access cron window using the command ```crontab -e```
* Write: ``` */5 * * * * python3 /home/pi/test.py > home/pi/test.log 2>&1```
* The above command will execute the test.py script every 5 minutes. The Standard Output (stdout) and Standard Error (stderr) both will be redirected to the file test.log

---

**Restart a script automatically after Pi reboots.** A raspberry Pi may reboot, most dominantly due to a power outage and in that case, we would want our script to start automatically after the boot. This too can be achieved using the following command in crontab.
* Open the cron job scheduler window as before
* Write, ```@reboot  python3 /home/pi/test.py```
* Note that, you can use ```@reboot``` and ```*****``` simultaneously for a single script. In that case, the script will execute automatically after boot and re-execute after every interval. For example, with ```*/5 ****``` the script will execute after every 5 minutes interval
* You can learn more about cronjob from the simple documentation at the official [Raspberry Pi page](https://www.raspberrypi.org/documentation/linux/usage/cron.md)

---

**Getting the right time in Raspberry Pi without an RTC or Internet but with Local Network.** Our Raspberry Pi collects data from sensors and hence keeping a tab of the right time is important. But we do not unnecessarily want our Pi to access the internet due to obvious security concerns and the Pi does not have an onboard RTC. We could manage to get the time of Raspberry Pi right by setting up one of our desktop computers as an NTP server from which the Raspberry Pi updates its time. We followed the following procedure:
* First, set up a desktop or a server as a NTP server in your lab. Your Raspberry pi will ping this server to update its time. To set up, type ```sudo apt install ntp```
*  Check is NTP is running successfully. Type ```sudo service ntp status```. You should see the ```active``` status on screen. 
*  Open UDP port 123 so that your Raspberry Pi can connect to this NTP server. Type ```sudo ufw allow from any to any port 123 proto udp```
*  Now, do the following on your Raspberry Pi. Access the file timesyncd.conf by typing ```sudo nano /etc/systemd/timesyncd.conf ```. Replace the line ```NTP=``` with ```NTP = x.x.x.x``` where ```x.x.x.x``` is your NTP server's IP address.
    
---

**Setting a static IP for the Raspberry Pi**. We always prefer if our Raspberry Pi always gets the same IP address from the DHCP pool.  We followed the following procedure to set a static IP.

*  We can see the IP assigned to our Pi and the network size by typing ```ip -4 addr show | grep global```
* The second address visible on typing the above command is the  brd (broadcast) address of the network.
* We can find the address of our router (or gateway) by typing the command ```ip route | grep default | awk '{print $3}'```
* Lastly, we need the DNS which we get by typing cat ```/etc/resolv.conf```
* Now we edit the file  ```/etc/dhcpcd.conf```  with all the information found from above steps.
* <small><div class="alert alert-danger" role="alert">HEADS UP! Your Raspberry Pi won't be assigned the IP you listed in the dhcpcd.conf file if that IP is already assigned to some other device.</div> </small>
    
 ---
 
**Sending terminal outputs as POST data using curl.**

We wanted our Pi's IP address to be sent as a POST data to a remote server.  The command ```hostname -I``` give the IP address of a Linux machine. We thus used the following command in a shell script file to send Pi's IP address and MAC address as a POST data.


```echo “ip=`hostname -I`&emac=`ifconfig | grep ether`” | curl -d @- http://10.0.76.58:5000 > /tmp/rc.local.log 2>&1```

 ---
 
**Sending POST data to a remote server and storing it in MySQL server**

Often time, we require to send data from the Raspberry Pi to a remote server. The Python scripts below will help you get started in very less time when it comes to working with POST data. 
Note that, we are receiving post data on a Linux machine which runs a Flask application. Also, we have all the necessary packages installed like PyMySQL and MySQL Core.

```python
#Code to send POST data to a remote server
import sys
import requests
import time
from datetime import *

#get your data from sensors
#assuming data variables are a1,a2 and date

try:
	#send data via POST to remove server. Remote server IP = X.X.X.X
    #get the current time
	today = datetime.now() 
    #by deafult flask app runs at port 5000, but you can change it
    r = requests.post("http://X.X.X.X:5001", data={'a1':a1, 'a2':a2, 'date':today.strftime('%a %d-%m-%Y @ %H:%M:%S')})
except Exception as e:
	print(e)
    sys.exit(1)


````

Code to Run a Flask Web Server on port 5001, receive and store the POST data as sent by the above code

```python
#Code to receive and store POST data
from flask import Flask, request
import pymysql
import sys

try:
	app = Flask(__name__)
    @app.route('/',methods=['POST'])
    def result():
    	a1 = request.form['a1']
        a2 = request.form['a2']
        date = request.form['date'] 
        
        #db config code
        db = pymysql.connect("hostname", "username", "passsword", "dbname")
        cursor = db.cursor()
        sql = ("""INSERT INTO tablename(var1,var2,var3) VALUES (%s,%s,%s)""",(a1,a1,date))
        cursor.execute(*sql)
        db.commit()
        db.close()
        print("SUCCESS")
        return "Received Successfully"
 except Exception as e:
 	print(e)
    sys.exit(1)
    
 if __name__ == '__main__':
 	app.run(host='0.0.0.0',port=5001)

```
---

**Running a Flask App in the background**

Ideally we would want our flask app to run even after we close the terminal. For this we use the POSIX command called ```nohup```. The following commands will help. 
 * ```chmod +x your-flask-app.py```
 * ```nohup python3 your-flask-app.py &```. Note the ```&``` at the last.
 * To check the process again: ```ps ax | grep your-flask-app.py```
---

**Automating file transfer from one linux machine to another.** 
Raspberry Pis deployed across our campus collects a lot of data from various sensors. It makes sense to send this data to a remote server on a periodic interval. To automate this process of file transfer, we followed the following procedure.

* Now, access your remote machine. Create a ```.ssh``` directory. Inside that directory create a file named ```authorized_keys.```
* Next, copy the file ```id_rsa.pub``` from Raspberry Pi to your remote machine using command like ```scp id_rsa.pub username:hostname```
* Now, append the content of ```id_rsa.pub``` to the ```authorized_keys``` file. You can do this using the command ```cat id_rsa.pub >> .ssh/authorized_file``` (assuming that you copied ```id_rsa.pub``` file in the home directory of remote machine)
* Go to the Raspberry Pi and try to access the remote server using SSH. If everything worked successfully, your Pi wont ask for password. You are now almost done!
* To automate the file copying process in your Pi, use ```crontab``` with the scp command. Since the ```scp``` command no longer requires password, the cronjob will be successful.
* For example: I use this command ```0 16 * * * scp /home/pi/water_meter/flow_meter_id_1.csv HOST_USERNAME:HOSTNAME:/path/to/dest``` to copy the ```flow_meter_id_1.csv``` file every 4 pm to my remote server.
    
---