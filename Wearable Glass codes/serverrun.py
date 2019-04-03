import subprocess

import RPi.GPIO as GPIO

import time

GPIO.setmode(GPIO.BOARD)

GPIO.setup(13, GPIO.IN, pull_up_down=GPIO.PUD_UP)

i=0

try:
    while True:
        input_state = GPIO.input(13)
        
        if input_state == 0:
            subprocess.call("sudo docker stop restreamer",shell=True)
            print('Server On')
            subprocess.call("node index.js",shell=True)
            i=i+1
            time.sleep(0.2)
except KeyboardInterrupt:
    GPIO.cleanup()