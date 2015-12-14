# tinyMQTT

Stripped out JavaScript MQTT module that does basic PUB/SUB. Minifies to 1254 bytes, intended for devices running Espruino, particularly the ESP8266.

Add back whatever features you can get away with!!

## Credits
Thanks to Gordon Williams (@gfwilliams) for several code optimization tips, that freed a further 36 jsvars and reduced file size a further 46 bytes.

## Example

```
var mqtt = require("tinyMQTT").create("test.mosquitto.org");

mqtt.on("connected", function(){
	mqtt.subscribe("espruino/test");
});

mqtt.on("message", function(msg){
	console.log(msg.topic);
	console.log(msg.message);
});

mqtt.on("published", function(){
	console.log("message sent");
});

mqtt.on("disconnected", function(){
	console.log("disconnected");
});

// This is ESP8266 specific, and may be subject to change
var wifi = require("Wifi");
wifi.connect("username", {password:"mypassword"},function(){
	mqtt.connect();
});
```