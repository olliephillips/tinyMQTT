# tinyMQTT

Branch: safereconnect. How best to make reconnection if dropped by MQTT broker. This branch should allow us to call ```mqtt.connect()``` again from within a "disconnected" event listener, with no duplicate listeners or increase memory use or leaks. 

Also aim is make publishing safe and without memory leak by understanding connected/disconnected status of the broker publishing to.

Ok based on limited testing.

Stripped out JavaScript MQTT module that does basic PUB/SUB. Minifies to 1.4KB, intended for devices running Espruino, particularly the ESP8266. Supports authentication

## Credits
Thanks to Gordon Williams (@gfwilliams) for several code optimization tips, that freed a further 36 jsvars and reduced file size a further 46 bytes. Thanks to Thorsten von Eicken (@tve) for the notion of understanding "ready" status.

## How to use
### No config options

```
var mqtt = require("tinyMQTT").create(server);
mqtt.connect(); // Connects on default port of 1883
```
### With config options

```
var mqtt = require("tinyMQTT").create(server, {
	username: "username",
	password: "password",
	port: 8883
});
mqtt.connect();
```

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
