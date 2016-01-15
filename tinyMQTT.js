/*
 * tinyMQTT.js 
 * Stripped out MQTT module that does basic PUB/SUB
 * Intended for devices running Espruino, particularly the ESP8266
 * Ollie Phillips 2015
 * MIT License
*/

var MQTT = function(server){
	this.server = server;
	mq = this;
};

function onData(data) {
	if((data.charCodeAt(0) >> 4) === 3) {
		var cmd = data.charCodeAt(0);
		var var_len = data.charCodeAt(2) << 8 | data.charCodeAt(3);
		var msg = {
			topic: data.substr(4, var_len),
			message: data.substr(4+var_len, (data.charCodeAt(1))-var_len),
			dup: (cmd & 0b00001000) >> 3,
			qos: (cmd & 0b00000110) >> 1,
			retain: cmd & 0b00000001
		};
		mq.emit('message', msg);
	}
};

function mqttStr(str) {
	return String.fromCharCode(str.length >> 8, str.length&255) + str;
};

function mqttPacket(cmd, variable, payload) {
	return String.fromCharCode(cmd, variable.length+payload.length)+variable+payload;
};

function mqttConnect(id){
	return mqttPacket(0b00010000, 
		mqttStr("MQTT")/*protocol name*/+
		"\x04"/*protocol level*/+
		"\x00"/*connect flag*/+
		"\xFF\xFF"/*Keepalive*/, mqttStr(id));
};

MQTT.prototype.connect = function(){
	var onConnected = function() {
		client.write(mqttConnect(getSerial()));
		mq.emit("connected");
		client.on('data', onData.bind(mq));
		client.on('end', function() {
 			mq.emit("disconnected");
		});
	};
	client = require("net").connect({host : mq.server, port: 1883}, onConnected);
	mq.client = client;
};

MQTT.prototype.subscribe = function(topic) {
	mq.client.write(mqttPacket((8 << 4 | 2), String.fromCharCode(1<<8, 1&255), mqttStr(topic)+String.fromCharCode(1)));
};	

MQTT.prototype.publish = function(topic, data) {	
	mq.client.write(mqttPacket(0b00110001, mqttStr(topic), data));
	mq.emit("published");
};

MQTT.prototype.disconnect = function(){
	mq.client.write(String.fromCharCode(14<<4)+"\x00");	
};

// Exports
exports.create = function (server) {
	return new MQTT(server);
};