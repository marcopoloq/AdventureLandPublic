/*
 * @author	Mark
 * @source	https://github.com/marcopoloq/AdventureLandPublic/blob/master/dps_meter.js
 */
class meters{
	constructor(args){
		// Variables for the dps meter
		this.dps_values = 5; // Amount of characters to show in the dps meter.
		this.dps = [];
		this.dps_h = $('<tr/>').append($('<th/>').text('Name'), $('<th/>').text('Damage'), $('<th/>').text('Dps'));
		this.hit_listener = parent.socket._callbacks.$hit.length;
		parent.socket.on('hit', this.hit_update.bind(this));
		// Variables for the gold meter.
		this.log_listener = parent.socket._callbacks.$game_log.length;
		parent.socket.on('game_log', this.log_update.bind(this));
		this.gold = 0;
		// Variables for the xp meter.
		this.start_xp = character.xp;
		this.start_level = character.level;
		// Variables for the kills table.
		this.kills = [];
		this.kills_h = $('<tr/>').append($('<th/>').text('Name'), $('<th/>').text('Kills'), $('<th/>').text('Total Xp'));
		//
		this.start_time = new Date();
		this.show_dps = true;
		this.init();
		setInterval(this.tick.bind(this), 100);
	}
	init(){
		parent.$('#bottomrightcorner').prepend(
			$('<div id ="meters"></div>').css({
				width: 'auto',
				height: 'auto',
				background: 'black',
				fontSize: '26px',
				border: '1px solid white',
				padding: '5px',
			}).append(
				$('<div id="timer"></div>').css({
					textAlign: 'right'
				}),
				$('<div id="table"></div>'),
				$('<div id="goldmeter"></div>').css({
					color: 'gold',
					borderTop: '1px solid white'
				}),
				$('<div id="xpmeter"></div>').css({
					color: 'green',
					borderTop: '1px solid white'
				}))
		);
	}
	hit_update(message){
		if(message.damage){ // A player hit has been registered.
			let id = this.find_id(this.dps, message.hid);
			id >= 0 ? this.dps[id][1] += message.damage : this.dps.push([message.hid, message.damage, new Date()]);
			this.dps.sort((a, b) => b[1] - a[1]);
		}
	}
	log_update(message){
		if(message.color === 'gold'){ // Gold has been looted.
			this.gold += parseInt(message.message.replace(/ \w+$/, ''));
		}else if(typeof(message) === 'string'){ // Monster has been killed.
			let kill = message.replace(/^\w+ killed a |.*/, '');
			if(kill.length){
				let id = this.find_id(this.kills, kill);
				id >= 0 ? this.kills[id][1]++ : this.kills.push([kill, 1, parent.G.monsters[kill.toLowerCase()].xp]);
				this.kills.sort((a, b) => b[1] - a[1]);
			}
		}
	}
	tick(){
		let passeds = Math.round((new Date() - this.start_time) / 1000) % 60;
		let passedm = Math.round((new Date() - this.start_time) / 60000) % 60;
		let passedh = (new Date() - this.start_time) / 3600000;
		let gained_xp = this.gained_xp();
		parent.$('#meters').find('#timer').html(Math.round(passedh) + (passedm < 10 ? ':0' : ':') + passedm + (passeds < 10 ? ':0' : ':') + passeds);
		parent.$('#meters').find('#table').html(this.show_dps ? this.dps_table() : this.kills_table());
		parent.$('#meters').find('#goldmeter').html('Gold looted: ' + this.gold + ' (' + (Math.round(this.gold / passedh) || 0) + '/hr)');
		parent.$('#meters').find('#xpmeter').html('Xp gained: ' + gained_xp + ' (' + (Math.round(gained_xp / passedh) || 0) + '/hr)');
	}
	dps_table(){
		let table = $('<table/>').append(this.dps_h);
		$.each(this.dps.slice(0, this.dps_values), (rowIndex, r) => table.append($('<tr/>').append($('<td/>').text(r[0]), $('<td/>').text(r[1]), $('<td/>').text(Math.round(r[1] / (new Date() - r[2]) * 1000)))));
		return table;
	}
	kills_table(){
		let table = $('<table/>').append(this.kills_h);
		$.each(this.kills, (rowIndex, r) => table.append($('<tr/>').append($('<td/>').text(r[0]), $('<td/>').text(r[1]), $('<td/>').text(r[1] * r[2]))));
		return table;
	}
	gained_xp(){
		if(character.level === this.start_level)
			return character.xp - this.start_xp;
		else{
			let xp = parent.G.levels[this.start_level] - character.start_xp;
			for(let i = this.start_level + 1; i < character.level; i++)
				xp += parent.G.levels[i];
			return xp + character.xp;
		}
	}
	find_id(array, id){
		for(let i = 0; i < array.length; i++)
			if(array[i][0] === id)
				return i;
		return -1;
	}
	on_destroy(){
		parent.$('#bottomrightcorner').find('#meters').remove();
		parent.socket.removeListener('hit', parent.socket._callbacks.$hit[this.hit_listener]);
		parent.socket.removeListener('game_log', parent.socket._callbacks.$game_log[this.log_listener]);
	}
}
var m = new meters({});
function on_destroy(){
	clear_drawings();
	m.on_destroy();
}