import subprocess

import RPi.GPIO as GPIO

import time

GPIO.setmode(GPIO.BOARD)

GPIO.setup(12, GPIO.IN, pull_up_down=GPIO.PUD_UP)
subprocess.call('python /home/pi/Desktop/test/serverrun.py &',shell=True)
print('Server Python run')
subprocess.call('python /home/pi/Desktop/test/live.py &',shell=True)
print('Live Streaming Server Python run')
i=0

try:
    while True:
        input_state = GPIO.input(12)
        
        if input_state == 0:
            print('On')
            subprocess.call("sudo docker stop restreamer",shell=True)
            subprocess.call("killall -s KILL node",shell=True)
            print('Node Killed')
            subprocess.call("raspistill -o "+"/home/pi/Desktop/test/faces/mohit.jpg",shell=True)
            print('PIC CAPTURED')
            
            
            
            i=i+1
            time.sleep(0.2)
except KeyboardInterrupt:
    GPIO.cleanup()