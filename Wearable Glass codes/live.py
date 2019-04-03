from __future__ import print_function
from ibm_watson import TextToSpeechV1
from ibm_watson.websocket import SynthesizeCallback
import pyaudio
import subprocess

import RPi.GPIO as GPIO

import time


service = TextToSpeechV1(
    url='https://gateway-syd.watsonplatform.net/text-to-speech/api',
    iam_apikey='ajb7FyJdt_ToWIUxHGW6QywV7Bx_rp9GEh1-tqnPsDHZ')
class Play(object):
    """
    Wrapper to play the audio in a blocking mode
    """
    def __init__(self):
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 22050
        self.chunk = 1024
        self.pyaudio = None
        self.stream = None

    def start_streaming(self):
        self.pyaudio = pyaudio.PyAudio()
        self.stream = self._open_stream()
        self._start_stream()

    def _open_stream(self):
        stream = self.pyaudio.open(
            format=self.format,
            channels=self.channels,
            rate=self.rate,
            output=True,
            frames_per_buffer=self.chunk,
            start=False
        )
        return stream

    def _start_stream(self):
        self.stream.start_stream()

    def write_stream(self, audio_stream):
        self.stream.write(audio_stream)

    def complete_playing(self):
        self.stream.stop_stream()
        self.stream.close()
        self.pyaudio.terminate()

class MySynthesizeCallback(SynthesizeCallback):
    def __init__(self):
        SynthesizeCallback.__init__(self)
        self.play = Play()

    def on_connected(self):
        print('Opening stream to play')
        self.play.start_streaming()

    def on_error(self, error):
        print('Error received: {}'.format(error))

    def on_timing_information(self, timing_information):
        print(timing_information)

    def on_audio_stream(self, audio_stream):
        self.play.write_stream(audio_stream)

    def on_close(self):
        print('Completed synthesizing')
        self.play.complete_playing()

test_callback = MySynthesizeCallback()

SSML_text = """
   <speak>
        Starting Live Streaming on server..
   </speak>
   """

SSML_textt = """
   <speak>
        Live stream has started.
   </speak>
   """

GPIO.setmode(GPIO.BOARD)

GPIO.setup(16, GPIO.IN, pull_up_down=GPIO.PUD_UP)

i=0

try:
    while True:
        input_state = GPIO.input(16)
        
        if input_state == 0:
            subprocess.call("sudo docker start restreamer",shell=True)
            print('Live Stream on')
            service.synthesize_using_websocket(SSML_text,
                                   test_callback,
                                   accept='audio/wav',
                                   voice="en-US_AllisonVoice"
                                  )
            #time.sleep(1)
            service.synthesize_using_websocket(SSML_textt,
                                   test_callback,
                                   accept='audio/wav',
                                   voice="en-US_AllisonVoice"
                                  )
            i=i+1
            time.sleep(0.2)
except KeyboardInterrupt:
    GPIO.cleanup()
