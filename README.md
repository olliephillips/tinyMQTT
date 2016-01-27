# tinyMQTT

Stripped out JavaScript MQTT module that does basic PUB/SUB. Minifies to 1.4KB, intended for devices running Espruino, particularly the ESP8266. Supports authentication


Add back whatever features you can get away with!!
The [auth](https://github.com/olliephillips/tinyMQTT/tree/auth) branch of this repo offers a slightly larger module that supports authentication and custom port selection.

## Credits
Thanks to Gordon Williams (@gfwilliams) for several code optimization tips, that freed a further 36 jsvars and reduced file size a further 46 bytes.

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
