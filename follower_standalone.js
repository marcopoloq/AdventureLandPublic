/*
 * @author	Mark
 * @source	https://github.com/marcopoloq/AdventureLandPublic/blob/master/follower_standalone.js
 */
setInterval(function(){
	loot();
	if(character.max_hp - character.hp > 200 || character.max_mp - character.mp > 300){
		use_hp_or_mp();
	}
	// Party leader
	let leader = get_player(character.party);
	if(!leader){ // Do nothing if your character is not close enough to the leader or not in a party.
		return;
	}
	// Target of leader.
	let target = get_target_of(leader);
	// Attack the target if the target isn't empty and attackable.
	if(target && can_attack(target)){
		attack(target);
	}
	//Move to leader (to limit calls only move when not moving already).
	if(!character.moving){
		move(leader.real_x + 25, leader.real_y);
	}
	set_message("Dpsing");
}, 1000 / 4);