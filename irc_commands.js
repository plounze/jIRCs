jIRCs.prototype.irc_PING = function(prefix, args) {
    this.send('PONG',args);
};

jIRCs.prototype.irc_NICK = function(prefix, args) {
    var oldNick = this.getNick(prefix),
        newNick = args.pop().substr(1);
    if(oldNick == this.nickname) {
        this.nickname = newNick;
    }
    // TODO: Make this show up in all channels where relevant (needs userlists)
    this.renderLine('','',oldNick + ' is now known as ' + newNick);
};

jIRCs.prototype.irc_JOIN = function(prefix, args) { 
    var channel = args.pop().substr(1);
    this.renderLine(channel, '', prefix + " joined " + channel);
};

jIRCs.prototype.irc_PART = function(prefix, args) { 
    var channel = args.pop();
    this.renderLine(channel, '', prefix + " left " + channel);
    if(this.getNick(prefix) == this.nickname) {
        this.destroyChan(channel);
    }
};

jIRCs.prototype.irc_PRIVMSG = function(prefix, args) { 
    var channel = args.shift();
    var message = args.pop().substr(1);
    //account for private messages
    if (channel == this.nickname)
        channel = prefix;
    if(message.charAt(0) == '\u0001') {
        message = message.split('\u0001')[1];
        if(message.substr(0,6).toUpperCase() == 'ACTION') {
            message = prefix + message.substr(6);
            prefix = '';
        }
    }
    this.renderLine(channel, prefix, message);
};

jIRCs.prototype.irc_005 = function(prefix, args) {
	for (var i = 1; i < args.length - 1; i++) { // skip the nickname and the "is supported by this server" message
		if (args.substr(0,7) == "PREFIX=") {
			this.statuses = {}
			var modes = args.substr(8).split(')'); // exclude the open paren, split close paren
			for (var j = 0; j < modes[0].length; j++)
				this.statuses[modes[1][j]] = modes[0][j]; // mapping of symbols to modes
		}
	}
}

jIRCs.prototype.irc_353 = function(prefix, args) {
	if (!this.channels[args[2]].moreNames) {
		this.channels[args[2]].names = []
		this.channels[args[2]].moreNames = true;
	}
	var names = args[3].substr(1).split(' '); // Strip the colon and split the names out
	for (var name in names) {
		var statusList = '';
		while (name.charAt(0) in this.statuses) {
			statusList = name.charAt(0);
			name = name.substr(1);
		}
		this.channels[args[2]].names[name] = statusList;
	}
};

jIRCs.prototype.irc_366 = function(prefix, args) {
	this.channels[args[1]].moreNames = false;
};