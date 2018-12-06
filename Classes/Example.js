/*
 * @author	Mark
 * @source	https://github.com/marcopoloq/AdventureLandPublic/blob/master/Classes/Example.js
 */
var member = (function(){
	class Member{
		/*
		 * The member javascript class, this class is the superclass for all of the Adventure Land class specific javascript classes.
		 * This will automatically sort parent.entities in more manageable lists,
		 * make sure to execute pve or pvp code at the proper moments,
		 * drink potions and loot.
		 */
		constructor(args){
			// Extra classes for clean code.
			this.party_logic = new PartyLogic(args);
			// Arguments to use while running the code.
			this.whitelist = args.whitelist || []; // PvP whitelist for healing (default empty list).
			this.blacklist = args.blacklist || []; // PvP blacklist for attacking (default empty list).
			this.monster_list = args.monster_list || ['goo']; // List of monsters to kill (default only goos).
			this.missing_hp = args.missing_hp || 400; // The amount of missing hp needed before using a potion (default 400).
			this.missing_mp = args.missing_mp || 500; // The amount of missing mp needed before using a potion (default 500).
			// Variables for cooldowns
			this.last_potion = 0;
			this.last_attack = 0;
			setInterval(this.tick.bind(this), 250);
		}
		tick(){
			// Use potions.
			if(new Date() - this.last_potion >= 2000){
				if(character.hp < character.max_hp - this.missing_hp){
					use('hp');
					this.last_potion = new Date();
				}else if(character.mp < character.max_mp - this.missing_mp){
					use('mp');
					this.last_potion = new Date();
				}
			}
			// Loot, from beginner code.
			loot();
			// Manage parent.entities.
			let entities = Object.values(parent.entities);
			// Fetching the other players.
			let players = entities.filter(c => !c.rip && c.type === 'character' && !c.npc);
			let blacklist_players = players.filter(c => this.blacklist.includes(c.name));
			let whitelist_players = players.filter(c => this.whitelist.includes(c.name));
			// Add yourself to whitelisted players, mainly for priests to heal themselves when needed.
			whitelist_players.push(character);
			// Fetching the monsters.
			let monsters = entities.filter(c => !c.dead && c.type === 'monster' && this.monster_list.includes(c.mtype));
			let my_chase = monsters.filter(c => c.target && c.target === character.name);
			let pty_chase = [];
			// Only fill pty_chase if you are in a party.
			if(character.party)
				pty_chase = monsters.filter(c => c.target && this.party_logic.party_list.includes(c.target));
			let no_chase = monsters.filter(c => !c.target);
			// Only use pvp code if you are on a pvp world and there is a blacklisted player nearby.
			if(parent.pvp && blacklist_players.length)
				this.pvp(blacklist_players, whitelist_players);
			// Execute pve code otherwise.
			else
				this.pve(whitelist_players, my_chase, pty_chase, no_chase);
		}
		pve(whitelist_players, my_chase, pty_chase, no_chase){
			// Prioritise monsters targeting yourself over the ones attacking party members.
			if(my_chase.length)
				this.goto_attack(my_chase[0]);
			else if(pty_chase.length)
				this.goto_attack(pty_chase[0]);
			else if(no_chase.length)
				this.goto_attack(no_chase[0]);
		}
		pvp(blacklist_players, whitelist_players){
			// Go to the enemy player and kill them.
			this.goto_attack(blacklist_players[0]);
		}
		/*
		 * If you are not in range of the target move to the target.
		 * If you are in range attack the target.
		 */
		goto_attack(target){
			if(!in_attack_range(target))
				move(target.real_x, target.real_y);
			else
			/*
			 * Check if the target is in attack range (from runner functions) &&
			 * Check if your character is stunned (based on can_attack from runner functions) &&
			 * See if your attack is off cooldown.
			 */
			if(!parent.is_disabled(character) && new Date() - this.last_attack >= 1000 / character.frequency){
				// Based on attack from runner functions.
				if(target.type === "character")
					parent.player_attack.call(target);
				else
					parent.monster_attack.call(target);
				this.last_attack = new Date();
			}
		}
	}
	/*
	 * Each ingame class is reprisented with it's own javascript class.
	 * Each javascript class inherits from Member and can access all of its methods.
	 * This means you can inherit everything leaving the class almost empty like Mage, Ranger and Rogue.
	 */
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
			console.log('pve priest');
			// Heal players (specific to priest).
			this.whitelist_heal(whitelist_players);
			// Member.pve().
			super.pve(whitelist_players, my_chase, pty_chase, no_chase);
		}
		pvp(blacklist_players, whitelist_players){
			// Heal players (specific to priest).
			this.whitelist_heal(whitelist_players);
			// Member.pvp().
			super.pvp(blacklist_players, whitelist_players);
		}
		/*
		 * Check all character in range, if they are whitelisted heal them.
		 * No movement is involved, so make sure you are in range of the characters you want to heal at all times.
		 */
		whitelist_heal(whitelist_players){
			for(let player in whitelist_players){
				console.log('healing ' + player);
				let c = whitelist_players[player];
				if(in_attack_range(c) && c.hp < c.max_hp) //- character.attack)
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
		/*
		 * Make full use of the warrior class by making them tank 3 mobs at the same time.
		 * Warning: there is no check for nearby priests or hp values so you might want to add smarter code.
		 */
		pve(whitelist_players, my_chase, pty_chase, no_chase){
			// Pull mobs if you don't have 3 mobs chasing you.
			if(my_chase.length < 3 && no_chase.length)
				this.goto_attack(no_chase[0]);
			// If you have 3 mobs chasing you do Member.pve().
			else
				super.pve(whitelist_players, my_chase, pty_chase, no_chase);
		}
	}
	/*
	 * Example of how a custom class can look.
	 * If you create the class you can create your own setInterval() functions inside it.
	 * Another possiblity is calling the functions inside the tick() function of member
	 * Calling the function from within tick() prevents the need of an extra setInterval().
	 */
	class PartyLogic{
		constructor(args){
			this.party_list = args.party_list || [character]; // List of members to invite to party with first value being the leader (default list with character).
			// The leader is the first member of this.party_list only that character needs to send invites.
			if(character.name === this.party_list[0])
				setInterval(this.send_invites, 1000, this.party_list);
			else
				setInterval(this.check_leader, 1000, this.party_list[0]);
		}
		send_invites(party_list){
			// Send invites to the characters who are not in the party and on this.party_list.
			for(let i = 1; i < party_list.length; i++)
				if(!parent.party_list.includes(party_list[i]))
					send_party_invite(party_list[i]);
		}
		check_leader(leader){
			// See if the leader of the party is this.party_list[0], leave if this isn't the case.
			if(character.party && character.party !== leader)
				parent.socket.emit("party", {event: "leave"});
		}
	}
	let args = {
		whitelist: ['Gensei', 'Haether', 'Morcorino'],
		blacklist: [], // Same format as whitelist.
		monster_list: ['goo', 'bee'], // Same format as whitelist.
		party_list: [], // Same format as whitelist.
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
})();
/*
 * Party functions from the runner functions.
 * Because of how javascript classes work you can't access non static functions outside of the class.
 * You can only access functions outside of the class from within the class.
 * You do however have access to variables inside of the classes and can use them.
 */
function on_party_request(name){
	if(member.party_logic.party_list.includes(name))
		accept_party_request(name);
}
function on_party_invite(name){
	if(member.party_logic.party_list.includes(name))
		accept_party_invite(name);
}
