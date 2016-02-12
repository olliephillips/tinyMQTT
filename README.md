# tinyMQTT

Stripped out JavaScript MQTT module that does basic PUB/SUB. Minifies to 1.3KB, intended for devices running Espruino, particularly the ESP8266. 

- Supports QoS 0 only.
- Supports authentication on username and password.

Some considerable effort has gone into ensuring safe reconnection in event of MQTT broker disconnecting us and or loss of network, minimising leaked memory and ensuring no duplicated event listeners, and subsequent processes.

Please note. tinyMQTT library defines a single variable in the global namespace. In tests this has proven the best way to keep a compact code base (aka tiny). Variable is "_q".

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

## Credits
@gfwilliams, @tve, @HyGy, @MaBecker. Thanks for the advice, tips, testing and patience!