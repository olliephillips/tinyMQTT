/*
 * tinyMQTT.js 
 * Stripped out MQTT module that does basic PUB/SUB
 * Minifies to 1363 bytes, intended for devices running Espruino, particularly the ESP8266
 * Ollie Phillips 2015, 
 * MIT License
*/

var MQTT = function(server){
	this.server = server;
};

MQTT.prototype.connect = function(){
	var mq = this;
	var onConnected = function() {
		client.write(mq.mqttConnect(getSerial()));
		mq.emit("connected");
		client.on('data', function(data) {
			var type = data.charCodeAt(0) >> 4;
			if(type === 3) {
				var msg;
				var cmd = data.charCodeAt(0);
				var rem_len = data.charCodeAt(1);
				var var_len = data.charCodeAt(2) << 8 | data.charCodeAt(3);
				msg = {
					topic: data.substr(4, var_len),
					message: data.substr(4+var_len, rem_len-var_len),
					dup: (cmd & 0b00001000) >> 3,
					qos: (cmd & 0b00000110) >> 1,
					retain: cmd & 0b00000001
				};
				mq.emit('message', msg);
			}
		});
		client.on('end', function() {
 			mq.emit("disconnected");
		});
	};
	client = require("net").connect({host : mq.server, port: 1883}, onConnected);
	mq.client = client;
};

MQTT.prototype.mqttStr = function(str) {
	return String.fromCharCode(str.length >> 8, str.length&255) + str;
};

MQTT.prototype.mqttPacket = function(cmd, variable, payload) {
	return String.fromCharCode(cmd, variable.length+payload.length)+variable+payload;
};	
	
MQTT.prototype.mqttConnect = function(id){
	var mq = this;
	return mq.mqttPacket(0b00010000, 
		mq.mqttStr("MQTT")/*protocol name*/+
		"\x04"/*protocol level*/+
		"\x00"/*connect flag*/+
		"\xFF\xFF"/*Keepalive*/, mq.mqttStr(id));
};

MQTT.prototype.subscribe = function(topic) {
	var mq = this;
	var cmd = 8 << 4 | 2;
	var pid = String.fromCharCode(1<<8, 1&255);
	mq.client.write(mq.mqttPacket(cmd, pid, this.mqttStr(topic)+String.fromCharCode(1)));
};	

MQTT.prototype.publish = function(topic, data) {
	var mq = this;	
	mq.client.write(mq.mqttPacket(0b00110001, mq.mqttStr(topic), data));
	mq.emit("published");
};

MQTT.prototype.disconnect = function(){
	this.client.write(String.fromCharCode(14<<4)+"\x00");	
};

// Exports
exports.create = function (server) {
	return new MQTT(server);
};
exports.connect = function() {
	var mqtt = new MQTT();
	mqtt.connect();
	return mqtt;
};