/*
 * tinyMQTT.js
 * Stripped out MQTT module that does basic PUBSUB
 * Ollie Phillips 2015
 * improved by HyGy
 * MIT License
*/

var MQTT = function(server, opts){
	var opts = opts || {};
	this.server = server;
	this.port = opts.port || 1883;
	this.username = opts.username;
	this.password = opts.password;
	this.connected = false;
	this.emitter = true;
	this.reconnectHandlerFunction = null;
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
		this.emit('message', msg);
	}
};

MQTT.prototype.mqttStr =function(str) {
	return String.fromCharCode(str.length >> 8, str.length&255) + str;
};

MQTT.prototype.mqttPacket = function(cmd, variable, payload) {
	return String.fromCharCode(cmd, variable.length+payload.length)+variable+payload;
};

MQTT.prototype.mqttConnect = function(id){

	// Authentication?
	var flags = 0;
	var payload = this.mqttStr(id);

	if(this.username && this.password) {
		flags |= ( this.username )? 0x80 : 0;
		flags |= ( this.username && this.password )? 0x40 : 0;
		payload += this.mqttStr(this.username) + this.mqttStr(this.password);
	}
	flags = String.fromCharCode(parseInt(flags.toString(16), 16));
	return this.mqttPacket(0b00010000,
		this.mqttStr("MQTT")/*protocol name*/+
		"\x04"/*protocol level*/+
		flags/*flags*/+
		"\xFF\xFF"/*Keepalive*/, payload);
};

MQTT.prototype.connect = function(){
	var me=this;
	console.log('mqttConnect called');
	var onConnected = function() {
		console.log('onConnected callback ->')

		clearInterval(me.reconnectHandlerFunction);
		me.reconnectHandlerFunction=null;

		me.client.write(me.mqttConnect(getSerial()));
		if(me.emitter){ me.emit("connected");}
		me.connected = true;
		me.client.on('data', onData.bind(me));
		me.client.on('end', function() {
			me.removeAllListeners("connected"); // 1) Assuming implemented, valid in node
			delete me.client;
			me.connected = false;
 			me.emit("disconnected");
		});
	};

//	if(me.client){me.emitter = false;}
	console.log('connected function->');
	console.log(me.connected);
	console.log(me.reconnectHandlerFunction);

	if(!me.connected && me.reconnectHandlerFunction===null) { // if it is not connected, and we dont started the reconnection Handler, then we start it first

		me.client = require("net").connect({host : me.server, port: me.port}, onConnected);

		me.reconnectHandlerFunction = setInterval(function(){
			console.log('trying to reconnect to mqtt');
			me.client = require("net").connect({host : me.server, port: me.port}, onConnected);
		}, 5000);
	}
};

MQTT.prototype.subscribe = function(topic) {
	this.client.write(this.mqttPacket((8 << 4 | 2), String.fromCharCode(1<<8, 1&255), this.mqttStr(topic)+String.fromCharCode(1)));
};

MQTT.prototype.publish = function(topic, data) {
	if(this.connected) {
		this.client.write(this.mqttPacket(0b00110001, this.mqttStr(topic), data));
		this.emit("published");
	}
};

MQTT.prototype.disconnect = function() {
	this.client.write(String.fromCharCode(14<<4)+"\x00");
};

// Exports
exports.create = function (server, options) {
	return new MQTT(server, options);
};
