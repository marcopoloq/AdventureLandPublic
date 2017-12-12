/*	
 * @author	Mark
 * @source	
 */
// If a character is below this percent of hp he will be healed.
var percent = 0.8;
setInterval(function(){
	loot();
	if(character.max_hp - character.hp > 400 || character.max_mp - character.mp > 500){
		use_hp_or_mp();
	}
	// Party leader
	let leader = get_player(character.party);
	if(!leader){ // Do nothing if your character is not close enough to the leader or not in a party.
		return;
	}
	let target = get_target_of(leader)
	// Get the injured members of your party
	let injured = Object.values(parent.entities).filter(c =>
		c.type === 'character' && !c.rip && // The entity is a player and not dead.
		c.party && c.party === character.party && // The player is in a party and inside your party.
		parent.distance(c, character) <= character.range && // The player is in range.
		c.hp < c.max_hp * percent // The player is actually injured enough.
	);
	// Since your character is not in parent.entities you need to add if if the character is injured.
	if(character.hp < character.max_hp * percent){
		injured.push(character);
	}
	// Sort by percentage missing hp
	injured.sort((a, b) => a.hp / a.max_hp - b.hp / b.max_hp);
	// Heal if needed
	if(injured.length){
		heal(injured[0]);
	}
	// Otherwise attack the target if the target isn't empty and attackable.
	else if(target && can_attack(target)){
		curse(target);
		attack(target);
	}
	//Move to leader (to limit calls only move when not moving already).
	if(!character.moving){
		move(leader.real_x - 25, leader.real_y);
	}
	set_message("Healing");
}, 1000 / 4);
var lastcurse;
function curse(target){
	// Curse only if target hasn't been cursed and if curse is from cd (cd is 5sec).
	if((!lastcurse || new Date() - lastcurse > 5000) && !target.cursed){
		lastcurse = new Date();
		parent.socket.emit("ability", {name: "curse", id: target.id});
	}
}