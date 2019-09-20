# tinyMQTT

Stripped out JavaScript MQTT module that does basic PUB/SUB. Minifies to 1.65KB, intended for devices running Espruino, particularly the ESP8266.

- Supports QoS 0 only.
- Supports authentication on username and password.
- 127 byte publishing length limit (the sum of the length of the topic + the length of the data must not be more than 127 characters).
- Retain flag is set on published messages.

## How to use

tinyMQTT is now hosted on Espruino.com, so using the Espruino Web IDE it can be required as follows:

```
var mqtt = require("tinyMQTT").create("<your mqtt broker>");
```

The version of tinyMQTT on Espruino.com will always be a recent version, but may not always be the latest version, which is contained in this Github repository. 

To get the latest version of tinyMQTT, you can require the file directly from this respository. For example, this works:

```
var mqtt = require("https://github.com/olliephillips/tinyMQTT/blob/master/tinyMQTT.min.js").create("<your mqtt broker>");
```

You can also download the file and use as a local module, which is ideal if you wish to modify the code or contribute to tinyMQTT development.

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

If you want to reconnect in event of broker disconnection or wifi outage add ```mqtt.connect();``` to the disconnected event listener. Reconnection will be attempted indefinitely, by default at 2 second intervals (though this can be configured). Once reconnected publishing should restart, and subscriptions will be honoured.

```
mqtt.on("disconnected", function(){
	console.log("disconnected");
	mqtt.connect();
});

```

## Too long message

tinyMQTT only supports short messages. The length of the topic plus the length of the payload must be less than 128 characters. If it's longer, the library throws a `tMQTT-TL` exception.

## Save & load from Storage

Espruino supports saving and loading modules directly to/from storage. tinyMQTT can be used in this way, which provides for further memory optimisation should it be needed.

```
// Save to Storage 

var s = require('Storage');
s.write('tinyMQTS' , '......put tinyMQTT.min.js code here.........');

// Load directly from Storage

var mqtt = require('tinyMQTS');    
```

## Credits

@gfwilliams, @tve, @HyGy, @MaBecker, @gulfaraz, @The-Futur1st, @wanglingsong, @AkosLukacs, @jejdacz, @cooltyn and @atmosuwiryo. Thanks for the advice, tips, testing and pull requests!
