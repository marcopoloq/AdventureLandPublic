/*
 * @author	Mark
 * @source	https://github.com/marcopoloq/AdventureLandPublic/blob/master/Classes/Example.js
 */
var member = (function(){
	class Member{
		constructor(args){
			this.whitelist = args.whitelist;
			this.blacklist = args.blacklist;
			setInterval(this.tick.bind(this), 250);
		}
		tick(){
			let entities = Object.values(parent.entities);
			// Fetching the other players.
			let players = entities.filter(c => !c.rip && c.type === 'character' && !c.npc);
			let blacklist_players = players.filter(c => this.blacklist.includes(c.name));
			let whitelist_players = players.filter(c => this.whitelist.includes(c.name));
			// Fetching the monsters.
			let monsters = entities.filter(c => !c.dead && c.type === 'monster');
			let my_chase = monsters.filter(c => c.target && c.target === character.name);
			let pty_chase = [];
			if(character.party)
				pty_chase = monsters.filter(c => c.target && parent.party_list.includes(c.target));
			let no_chase = monsters.filter(c => !c.target);
			if(parent.pvp && blacklist_players.length)
				this.pvp(blacklist_players, whitelist_players);
			else
				this.pve(whitelist_players, my_chase, pty_chase, no_chase);
		}
		pve(whitelist_players, my_chase, pty_chase, no_chase){
			if(my_chase.length)
				this.goto_attack(my_chase[0]);
			else if(pty_chase.length)
				this.goto_attack(pty_chase[0]);
		}
		pvp(blacklist_players, whitelist_players){
			this.goto_attack(blacklist_players[0]);
		}
		goto_attack(target){
			if(!in_attack_range(target))
				move(target.real_x, target.real_y);
			attack(target);
		}
	}
	class Mage extends Member{
		constructor(args){
			super(args);
		}
	}
	class Priest extends Member{
		constructor(args){
			console.log('loaded priest');
			super(args);
		}
		pve(whitelist_players, my_chase, pty_chase, no_chase){
			console.log('priest pve');
			this.whitelist_heal(whitelist_players);
			super.pve(whitelist_players, my_chase, pty_chase, no_chase);
		}
		pvp(blacklist_players, whitelist_players){
			this.whitelist_heal(whitelist_players);
			super.pvp(blacklist_players, whitelist_players);
		}
		whitelist_heal(whitelist_players){
			for(let player in whitelist_players){
				let c = whitelist_players[player];
				if(in_attack_range(c) && c.hp < c.max_hp - character.attack)
					heal(c);
			}
		}
	}
	class Ranger extends Member{
		constructor(args){
			super(args);
		}
	}
	class Rogue extends Member{
		constructor(args){
			super(args);
		}
	}
	class Warrior extends Member{
		constructor(args){
			super(args);
		}
		pve(whitelist_players, my_chase, pty_chase, no_chase){
			if(my_chase.length < 3 && no_chase.length)
				this.goto_attack(no_chase[0]);
			else
				super.pve(whitelist_players, my_chase, pty_chase, no_chase);
		}
	}
	let args = {
		whitelist: 'test1 test2 test3',
		blacklist: 'test4 test5 test6'
	};
	switch(character.ctype){
		case 'mage':
			return new Mage(args);
		case 'priest':
			return new Priest(args);
		case 'ranger':
			return new Ranger(args);
		case 'rogue':
			return new Rogue(args);
		case 'warrior':
			return new Warrior(args);
		default:
			return new Member(args);
	}
});
member();