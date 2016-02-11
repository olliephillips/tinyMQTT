/*
 * tinyMQTT.js
 * Stripped out MQTT module that does basic PUBSUB
 * Ollie Phillips 2015
 * improved by HyGy
 * MIT License
*/

var MQTT = function(server, opts){
	var opts = opts || {};
	this.srv = server;
	this.prt = opts.port || 1883;
	this.usr = opts.username;
	this.pwd = opts.password;
	this.conn = false; // connected
	this.rHF = null; // rHF
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

MQTT.prototype.mqttPkt = function(cmd, variable, payload) {
	return String.fromCharCode(cmd, variable.length+payload.length)+variable+payload;
};

MQTT.prototype.mqttConn = function(id){

	// Authentication?
	var flg = 0; // flags
	var payload = this.mqttStr(id);

	if(this.usr && this.pwd) {
		flg |= ( this.usr )? 0x80 : 0;
		flg |= ( this.usr && this.pwd )? 0x40 : 0;
		payload += this.mqttStr(this.usr) + this.mqttStr(this.pwd);
	}
	flg = String.fromCharCode(parseInt(flg.toString(16), 16));
	return this.mqttPkt(0b00010000,
		this.mqttStr("MQTT")/*protocol name*/+
		"\x04"/*protocol level*/+
		flg/*flags*/+
		"\xFF\xFF"/*Keepalive*/, payload);
};

MQTT.prototype.connect = function(){
	var me=this;

	var onConn = function() { // on connected

		clearInterval(me.rHF);
		me.rHF=null;

		me.cli.write(me.mqttConn(getSerial()));
		me.emit("connected");
		me.conn = true;
		me.cli.on('data', onData.bind(me));
		me.cli.on('end', function() {
			me.removeAllListeners("connected"); // 1) Assuming implemented, valid in node
			delete me.cli;
			me.conn = false;
 			me.emit("disconnected");
		});
	};

	if(!me.conn && me.rHF===null) { // if it is not connected, and we dont started the reconnection Handler, then we start it first

//		me.cli = require("net").connect({host : me.srv, port: me.prt}, onConn);

		me.rHF = setInterval(function(){
			me.cli = require("net").connect({host : me.srv, port: me.prt}, onConn);
		}, 1000);
	}
};

MQTT.prototype.subscribe = function(topic) {
	this.cli.write(this.mqttPkt((8 << 4 | 2), String.fromCharCode(1<<8, 1&255), this.mqttStr(topic)+String.fromCharCode(1)));
};

MQTT.prototype.publish = function(topic, data) {
	if(this.conn) {
		this.cli.write(this.mqttPkt(0b00110001, this.mqttStr(topic), data));
		this.emit("published");
	}
};

MQTT.prototype.disconnect = function() {
	this.cli.write(String.fromCharCode(14<<4)+"\x00");
};

// Exports
exports.create = function (server, options) {
	return new MQTT(server, options);
};
