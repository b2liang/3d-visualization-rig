#!/usr/bin/env python

"""QX1 interfacing code for python"""

import json
import requests
import threading
import time

from gevent import monkey
monkey.patch_all()
from flask import Flask, render_template, Response, jsonify, flash
from gevent import wsgi

from socket import *
import sys

#cam_url = 'http://10.0.0.1:10000/sony/camera'
cam_url = "http://192.168.122.1:8080/sony/camera"

# Threads that create the scream
class LiveviewThread(threading.Thread):
    running = True
    def __init__(self):
        threading.Thread.__init__(self)
        self.running = True
        self.jpg = None
    def run(self):
        s = start_liveview()
        data = open_stream(s)
        while self.running:

            self.jpg = decode_frame(data)
    def stop_running(self):
        self.running = False
    def get_jpg(self):
        time.sleep(0.05)
        return self.jpg

# Functions that communicate with minnowboard by using sony API
def get_payload(method, params):
    return {
	"method": method,
	"params": params,
	"id": 1,
	"version": "1.0"
    }

def sony_api_call(action, params):
    
    payload = get_payload(action, params)
    headers = {'Content-Type': 'application/json'}
    response = requests.post(cam_url, data=json.dumps(payload), headers=headers)
    a = response.json()
    return a['result']

def get_mode():
    return sony_api_call("getExposureMode", [])

def set_mode(mode):
    print "set mode myself and sending request to slave"
    cs.sendto(CONST_SET_EXPOSURE_MODE, (slaveIP, slavePort))
    sony_api_call("setExposureMode", [mode])

def get_aperture():
    return sony_api_call("getFNumber", [])[0]

def get_avail_aperture():
    return sony_api_call("getAvailableFNumber", [])

def set_aperture(aperture):
    print "set aperture myself and sending request to slave"
    cs.sendto(CONST_SET_APERATURE, (slaveIP, slavePort))
    sony_api_call("setFNumber", [aperture])

def get_shutter():
    return sony_api_call("getShutterSpeed", [])[0]

def get_avail_shutter():
    return sony_api_call("getAvailableShutterSpeed", [])

def set_shutter(shutter):
    print "set shutter myself and sending request to slave"
    cs.sendto(CONST_SET_SHUTTER, (slaveIP, slavePort))
    sony_api_call("setShutterSpeed", [shutter])

def get_iso():
    return sony_api_call("getIsoSpeedRate", [])

def get_avail_iso():
    return sony_api_call("getAvailableIsoSpeedRate", [])

def set_iso(iso):
    print "set ISO myself myself and sending request to slave"
    cs.sendto(CONST_SET_ISO, (slaveIP, slavePort))
    sony_api_call("setIsoSpeedRate", [iso])

def take_picture():
    print "taking picture and sending request to slave"
    cs.sendto(CONST_TAKE_PICTURE, (slaveIP, slavePort))
    return str(sony_api_call("actTakePicture", [])[0][0])

#New Stuff
#

def get_video_mode():
    return sony_api_call("getShootMode", [])

def take_video():
    print "starting video and sending request to slave"
    cs.sendto(CONST_START_VIDEO, (slaveIP, slavePort))
    sony_api_call("startMovieRec", [])

def stop_video():
    print "stopping video and sending request to slave"
    cs.sendto(CONST_STOP_VIDEO, (slaveIP, slavePort))
    sony_api_call("stopMovieRec", [])

def videoMode():
    print "setting to video mode and sending request to slave"
    cs.sendto(CONST_SET_VIDEO, (slaveIP, slavePort))
    r = sony_api_call("setShootMode", ["movie"])
    print r[0]
    if r[0] == 0:
        s = "set video mode sucessfully"
    else:
        s = "set video mode failed" 
    return s

def pictureMode():
    print "setting to picture mode and sending request to slave"
    cs.sendto(CONST_SET_PICTURE, (slaveIP, slavePort))
    sony_api_call("setShootMode", ["still"])


def setCameraOn():
    print "setting camera on and sending request to slave"
    cs.sendto(CONST_SET_ON, (slaveIP, slavePort))

def setCameraOff():
    print "seting camera off and sending request to slave"
    cs.sendto(CONST_SET_OFF, (slaveIP, slavePort))


#
#

def get_event():
    return sony_api_call("getEvent", [False])

def get_picture(url, filename):
    response = requests.get(url)
    chunk_size = 1024
    with open(filename, 'wb') as fd:
	for chunk in response.iter_content(chunk_size):
	    fd.write(chunk)

### LIVEVIEW STUFF
def start_liveview():
    response = sony_api_call("startLiveview", [])
    url = str(response[0])
    print url
    return url

def open_stream(url):
    return requests.get(url, stream=True)

def decode_frame(data):

    # decode packet header
    start = ord(data.raw.read(1))
    if(start != 0xFF):
	print 'bad start byte\nexpected 0xFF got %x'%start
	return
    pkt_type = ord(data.raw.read(1))
    if(pkt_type != 0x01):
	print 'not a liveview packet'
	return
    frameno = int(data.raw.read(2).encode('hex'), 16)
    timestamp = int(data.raw.read(4).encode('hex'), 16)

    # decode liveview header
    start = int(data.raw.read(4).encode('hex'), 16)
    if(start != 0x24356879):
	print 'expected 0x24356879 got %x'%start
	return
    jpg_size = int(data.raw.read(3).encode('hex'), 16)
    pad_size = ord(data.raw.read(1))
    # read out the reserved header
    data.raw.read(4)
    fixed_byte = ord(data.raw.read(1))
    if(fixed_byte is not 0x00):
	print 'expected 0x00 got %x'%fixed_byte
	return
    data.raw.read(115)

    # read out the jpg
    jpg_data = data.raw.read(jpg_size)
    data.raw.read(pad_size)

    return jpg_data

# initialization    
app = Flask(__name__)
app.secret_key = "super secret key"
LVthread = LiveviewThread()
LVthread.start()

@app.route('/')
def index():
    return render_template('index.html')

def gen():
    while True:
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + LVthread.get_jpg() + b'\r\n')

@app.route('/feed')
def feed():
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/takePicture')
def take_picture_cb():
    # FIXME do something with the url
    print take_picture()
    return "take pic"

@app.route('/setMode/<mode>')
def set_mode_cb(mode=None):
    set_mode(mode)
    return "cool"

@app.route('/setAperture/<aperture>')
def set_aperture_cb(aperture=None):
    set_aperture(aperture)
    return "oh yea"
@app.route('/setShutter/<shutter>')
def set_shutter_cb(shutter=None):
    shutter = shutter.replace('.', '/')
    set_shutter(shutter)
    return "dope"
@app.route('/setISO/<iso>')
def set_iso_cb(iso=None):
    set_iso(iso)
    return "ok"

@app.route('/_data', methods=['GET', 'POST'])
def data_cb(): 
    #print "result is: "
    #event = get_event()
    #ifReady = event[1]['cameraStatus']
    event = get_event()
    curExposureMode = event[18]['currentExposureMode']
    print curExposureMode
    availMode= event[18]['exposureModeCandidates']
    curShootMode = event[21]['currentShootMode']
    curAperture = event[27]['currentFNumber']
    availAperture = event[27]['fNumberCandidates']
    curISO = event[29]['currentIsoSpeedRate']
    avaiLISO = event[29]['isoSpeedRateCandidates']
    curShutter = event[32]['currentShutterSpeed']
    availShutter = event[32]['shutterSpeedCandidates']



    return jsonify(mode=curExposureMode, videoMode=curShootMode, aperture=curAperture, shutter=curShutter, iso=curISO, avail_aperture=availAperture, avail_shutter=availShutter, avail_iso=avaiLISO)
#NEW STUFF that communicate with javascrit file
#
@app.route('/takeVideo')
def take_video_cb():
    take_video();
    return "take video"

@app.route('/stopVideo')
def stop_video_cb():
    stop_video();
    return "stop"

@app.route('/setVideoMode')
def set_video_mode():
    result = videoMode();
    return result


@app.route('/setPictureMode')
def set_picture_mode():
    pictureMode();
    return "pic mode"

@app.route('/setCameraOn')
def set_camera_on():
    setCameraOn()

@app.route('/setCameraOff')
def set_camera_off():
    setCameraOff()
#
#

# run
#server = wsgi.WSGIServer(('192.168.122.250', 5000), app)

CONST_TAKE_PICTURE = "0"
CONST_SET_EXPOSURE_MODE = "1"
CONST_SET_APERATURE = "2"
CONST_SET_SHUTTER = "3"
CONST_SET_ISO = "4"
CONST_START_VIDEO = "5"
CONST_STOP_VIDEO = "6"
CONST_SET_VIDEO = "7"
CONST_SET_PICTURE = "8"
CONST_SET_ON = "9"
CONST_SET_OFF = "10"

slavePort = 4005;
slaveIP = '';
cs = socket(AF_INET, SOCK_DGRAM)
cs.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
cs.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)
#videoMode()

server = wsgi.WSGIServer(('localhost', 3000), app)
server.serve_forever()
