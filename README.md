# tinyMQTT

Stripped out JavaScript MQTT module that does basic PUB/SUB. Minifies to 1.58KB, intended for devices running Espruino, particularly the ESP8266.

- Supports QoS 0 only.
- Supports authentication on username and password.

Some considerable effort has gone into ensuring safe reconnection in event of MQTT broker disconnecting us and or loss of network, minimising leaked memory and ensuring no duplicated event listeners, and subsequent processes.

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

var wifi = require("Wifi");
wifi.connect("username", {password:"mypassword"},function(){
	mqtt.connect();
});
```

## Reconnection
If you want to reconnect in event of broker disconnection or wifi outage add ```mqtt.connect();``` to the disconnected event listener. Reconnection will be attempted indefinitely at 5 second intervals. Once reconnected publishing should restart, and subscriptions will be honoured.

```
mqtt.on("disconnected", function(){
	console.log("disconnected");
	mqtt.connect();
});

```