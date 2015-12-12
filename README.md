# tinyMQTT

Stripped out JavaScript MQTT module that does basic PUB/SUB. Minifies to 1308 bytes, intended for devices running Espruino, particularly the ESP8266.

Add back whatever features you can get away with!

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