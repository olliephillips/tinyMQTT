/*
 * tinyMQTT.js 
 * Stripped out MQTT module that does basic PUBSUB
 * Ollie Phillips 2015
 * MIT License
*/

var MQTT = function(server, optns){
	var opts = optns || {};
	this.server = server;
	this.port = opts.port || 1883;
	this.usr = opts.username;
	this.pwd = opts.password;	
	mq = this;
};

var sFCC = String.fromCharCode;

function onData(data) {
	var cmd = data.charCodeAt(0);
	if((cmd >> 4) === 3) {
		var var_len = data.charCodeAt(2) << 8 | data.charCodeAt(3);
		var msg = {
			topic: data.substr(4, var_len),
			message: data.substr(4+var_len, (data.charCodeAt(1))-var_len)
		};
		mq.emit('message', msg);
	}
};

function mqttStr(str) {
	return sFCC(str.length >> 8, str.length&255) + str;
};

function mqttPacket(cmd, variable, payload) {
	return sFCC(cmd, variable.length+payload.length)+variable+payload;
};

function mqttConnect(id){
	// Authentication?
	var flags = 0;
	var payload = mqttStr(id);
	if(mq.usr && mq.pwd) { 
		flags |= ( mq.usr )? 0x80 : 0; 
		flags |= ( mq.usr && mq.pwd )? 0x40 : 0; 
		payload += mqttStr(mq.usr) + mqttStr(mq.pwd);
	} 
	flags = sFCC(parseInt(flags.toString(16), 16));
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
		mq.con = true;
		client.on('data', onData.bind(mq));
		client.on('end', function() {
 			mq.emit("disconnected");
			mq.removeAllListeners("connected");
			client = mq.client = null;
			mq.con = false;
		});
	};
	if(!mq.con) {
		var con = setInterval(function(){
			client = require("net").connect({host : mq.server, port: mq.port}, onConnected);
			mq.client = client;
		}, 2000);
	}
};

MQTT.prototype.subscribe = function(topic) {
	mq.client.write(mqttPacket((8 << 4 | 2), sFCC(1<<8, 1&255), mqttStr(topic)+sFCC(1)));
};	

MQTT.prototype.publish = function(topic, data) {	
	if(mq.con) {
		mq.client.write(mqttPacket(0b00110001, mqttStr(topic), data));
		mq.emit("published");
	}
};

MQTT.prototype.disconnect = function() {
	mq.client.write(sFCC(14<<4)+"\x00");	
};

// Exports
exports.create = function (server, options) {
	return new MQTT(server, options);
};