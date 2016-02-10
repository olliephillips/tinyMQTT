/*
 * tinyMQTT.js 
 * Stripped out MQTT module that does basic PUBSUB
 * Ollie Phillips 2015
 * MIT License
*/

var MQTT = function(server, opts){
	var opts = opts || {};
	this.server = server;
	this.port = opts.port || 1883;
	this.username = opts.username;
	this.password = opts.password;	
	this.connected = false;
	mq = this;
};

function onData(data) {
	var cmd = data.charCodeAt(0);
	if((cmd >> 4) === 3) {
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
	// Authentication?
	var flags = 0;
	var payload = mqttStr(id);
	if(mq.username && mq.password) { 
		flags |= ( mq.username )? 0x80 : 0; 
		flags |= ( mq.username && mq.password )? 0x40 : 0; 
		payload += mqttStr(mq.username) + mqttStr(mq.password);
	} 
	flags = String.fromCharCode(parseInt(flags.toString(16), 16));
	return mqttPacket(0b00010000, 
		mqttStr("MQTT")/*protocol name*/+
		"\x04"/*protocol level*/+
		flags/*flags*/+
		"\xFF\xFF"/*Keepalive*/, payload);
};

MQTT.prototype.connect = function(){
	var onConnected = function() {
		clearInterval(con);
		client.write(mqttConnect(getSerial()));
		mq.emit("connected");
		mq.connected = true;
		client.on('data', onData.bind(mq));
		client.on('end', function() {
 			mq.emit("disconnected");
			mq.removeAllListeners("connected");
			mq.connected = false;
		});
	};
	if(!mq.connected) {
		var con = setInterval(function(){
			client = require("net").connect({host : mq.server, port: mq.port}, onConnected);
			mq.client = client;
		}, 2000);
	}
};

MQTT.prototype.subscribe = function(topic) {
	mq.client.write(mqttPacket((8 << 4 | 2), String.fromCharCode(1<<8, 1&255), mqttStr(topic)+String.fromCharCode(1)));
};	

MQTT.prototype.publish = function(topic, data) {	
	if(mq.connected) {
		mq.client.write(mqttPacket(0b00110001, mqttStr(topic), data));
		mq.emit("published");
	}
};

MQTT.prototype.disconnect = function() {
	mq.client.write(String.fromCharCode(14<<4)+"\x00");	
};

// Exports
exports.create = function (server, options) {
	return new MQTT(server, options);
};