var express = require('express');
var app = express();

var config = require('./config.js')
const player = require('play-sound')();


const accountSid = 'ACe024845db21e3829b6299c28febf0257';
const authToken = 'babf2940e2c7b3ad8816caa19010a73a';
const client = require('twilio')(accountSid, authToken);





var sleep = require('system-sleep');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });
var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.region = config.region;
var s;
var uuid = require('node-uuid');
var path = require('path');
var flip = require('flip-text')

var textToSpeech = new TextToSpeechV1({
  iam_apikey: 'ajb7FyJdt_ToWIUxHGW6QywV7Bx_rp9GEh1-tqnPsDHZ',
  url: 'https://gateway-syd.watsonplatform.net/text-to-speech/api'
});
var i2c = require('i2c-bus'),
  i2cBus = i2c.openSync(1),
  oled = require('oled-i2c-bus');
 
var opts = {
  width: 128,
  height: 32,
  address: 0x3C
};
 
var oled = new oled(i2cBus, opts);
oled.turnOnDisplay();
oled.clearDisplay();
//oled.writeString(font,2 ,'I am Awake', 1, true);
//oled.invertDisplay(true);
var font = require('oled-font-5x7');

oled.writeString(font, 2,'Searching...', 1, true);

app.use(express.static('public'));

var rekognition = new AWS.Rekognition({region: config.region});

function identify(req, res, next) {   /*, upload.single("image")*/
	var bitmap = fs.readFileSync('/home/pi/Desktop/test/faces/mohit.jpg');                   /*req.file.path*/

	rekognition.searchFacesByImage({
	 	"CollectionId": config.collectionName,
	 	"FaceMatchThreshold": 70,
	 	"Image": { 
	 		"Bytes": bitmap,
	 	},
	 	"MaxFaces": 1
	}, function(err, data) {
	 	if (err) {
	 		console.log(err);
	 	} else {
			if(data.FaceMatches && data.FaceMatches.length > 0 && data.FaceMatches[0].Face)
			{	
				
				console.log(data.FaceMatches[0].Face.ExternalImageId);
				oled.setCursor(1, 1);
				var ttt=data.FaceMatches[0].Face.ExternalImageId;
				var buf = Buffer.from(data.FaceMatches[0].Face.ExternalImageId);
				var t=buf.indexOf('_');
				var tt=ttt.substr(0,t);
				s=tt;
				console.log(buf.indexOf('_'));
				//var t = data.FaceMatches[0].Face.ExternalImageId;
				//oled.writeString(font, 1,data.FaceMatches[0].Face.ExternalImageId, 1, true);
                                
				
					//res.send(data.FaceMatches[0].Face);
					var synthesizeParams = {
  						text: "The person's name is" + tt + ". We can get the approximate age also.",
  						accept: 'audio/wav',
  						voice: 'en-US_AllisonVoice'
					};

					// Pipe the synthesized text to a file.
					

					textToSpeech.synthesize(synthesizeParams, (err, res) => {
  					if (err) {
    					console.log(err);
  					} else {
    					res.pipe(fs.createWriteStream(tt+".wav")); // or whatever you want to do with the stream
								
					}
					});
					/*client.messages
						.create({
     							body: "Hi! " + s + ",Have a nice day. We are here to take care of you.",
     							from: '+17047416442',
     							to: '+917550250062'
   							})
  						.then(message => console.log(message.sid));*/
					playy();
					


	
			} else {
				//res.send("Not recognized");
				console.log("UnKown Person");
				oled.clearDisplay();
				oled.setCursor(1, 1);
				//oled.writeString(font, 1,'Unknown Person', 1, true);
				var synthesizeParams = {
  						text: "Unknown person detected. Sending Notifications. We can get the approximate age also. Press live video button to connect live feeds to server.",
  						accept: 'audio/wav',
  						voice: 'en-US_AllisonVoice'
					};

					// Pipe the synthesized text to a file.
					tt="Unknown Person";
					s=tt;
					

					textToSpeech.synthesize(synthesizeParams, (err, res) => {
  					if (err) {
    					console.log(err);
  					} else {
    					res.pipe(fs.createWriteStream(tt+".wav")); // or whatever you want to do with the stream
								
					}
					});
					client.messages
						.create({
     							body: 'Alert !! Unknown person detected. Visit url for live feeds.',
     							from: '+17047416442',
     							to: '+917550250062'
   							})
  						.then(message => console.log(message.sid));
					playy();
				//res.send(data.FaceMatches[0].Face);
			}
		}
		  		
	});

}
function playy(){
sleep(5000);
  // This will execute 10 seconds from now
	oled.clearDisplay();
	oled.writeString(font,1 ,s, 1, true);
	player.play(s+".wav", (err) => {
						
    					  	if (err) console.log(err);
						//oled.clearDisplay();
						//oled.writeString(font,2 ,'Jai Hind !', 1, true);
						oled.turnOffDisplay();
						
					});
	

}

app.listen(5555, function () {
	console.log('Listening on port 5555!');
})

identify();