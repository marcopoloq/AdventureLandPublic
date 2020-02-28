/*
 * @author	Mark
 * @source	https://github.com/marcopoloq/AdventureLandPublic/blob/master/upgrade_compound.js
 *
 * Will upgrade and compound all of your items according to a whitelist you can provide.
 */
function upgrade_compound(upgrade_white_list){
	/*
	 * upgrade white list, the number is the level to upgrade to
	 * this means that {helmet: 8} will try and upgrade all items with the name helmet to level 8
	 */
	console.log("test");
	let uwl = upgrade_white_list || {
		helmet: 8,
		hpamulet: 3,
	};
	// Time at which the next upgrade should take place, 0 initially to trigger as soon as possible.
	let next_upgrade = 0;
	return () => {
		// Check if the character is outside of the bank and enough time has passed since the last upgrade.
		if(character.map !== 'bank' && new Date() >= next_upgrade && (!character.q.upgrade || new Date() >= next_upgrade + character.q.upgrade.len)){
			// Loop over all of the inventory slots.
			for(let slot = 0; slot < character.items.length; slot++){
				// Set the next upgrade attempt to 5 seconds from now.
				next_upgrade = new Date(Date.now() + 5000);
				// Store current slot for convenience.
				let c = character.items[slot];
				/* c						check if the slot actually contains an item
				 * uwl[c.name]				check if the name of the item is included in uwl
				 * c.level < uwl[c.name]	check if the level of the item is lower than the level to upgrade to
				 */
				if(c && uwl[c.name] && c.level < uwl[c.name]){
					// Fetch all of the info to search for the correct scroll.
					let info = parent.G.items[c.name];
					let scroll_name = get_scroll(c.level, info);
					let scroll = find_item(i => i.name === scroll_name);
					// check for the upgrade property, this will only be there if you can upgrade the item
					if(info.upgrade)
						// check for the scroll, if unavailable it needs to be bought
						if(scroll < 0){
							// check if you have enough gold to buy the scroll
							if(character.gold >= parent.G.items[scroll_name].g)
								// buy the scroll, then upgrade the item, then try and upgrade the item again
								parent.buy(scroll_name, 1).then(c =>
									parent.upgrade(slot, find_item(i => i.name === scroll_name), null, c.level, false)
									.then(reset)
								);
						}else // the scroll is already available, upgrade the item, then try and upgrade the item again
							parent.upgrade(slot, scroll, null, c.level, false).then(reset);
					// check for the compound property, this will only be there if you can compound the item
					else if(info.compound){
						/* search for 2 more items with the same name and the same level
						 * start at one higher than the current slot to make sure find_item finds a different item.
						 */
						let slot2 = find_item((item) => c.name === item.name && c.level === item.level, slot + 1);
						let slot3 = find_item((item) => c.name === item.name && c.level === item.level, slot2 + 1);
						// if two more items have been found, do the compound
						if(slot2 > 0 && slot3 > 0)
							if(scroll < 0){ // check for the scroll (like in upgrade)
								if(character.gold >= parent.G.items[scroll_name].g) // check for enough gold (like in upgrade)
									// buy the scroll, then compound the item, then try and compound the item again
									parent.buy(scroll_name, 1).then(c =>
										parent.compound(slot, slot2, slot3, find_item(i => i.name === scroll_name), null, c.level, false).then(reset)
									);
							}else // the scroll is already available, compound the item, then try and compound the item again
								parent.compound(slot, slot2, slot3, scroll, null, c.level, false).then(reset);
					}
				}
			}
		}
	};
	// Find an item that satisfies the given filter, starting from the given slot or the first slot.
	function find_item(filter, slot){
		// if the slot argument has been given, start searching from there, otherwise start at the first slot.
		for(let i = slot || 0; i < character.items.length; i++){
			let current = character.items[i];
			// check if the item matches the given filter.
			if(current && filter(current))
				return i;
		}
		return -1;
	}
	// Get the name of the scroll to use according to the grade parameter of the item (found in parent.G.items.item_name.grades).
	function get_scroll(level, info){ // Returns the scroll needed to upgrade the given item.
		if(level < info.grades[0])
			return info.compound ? 'cscroll0' : 'scroll0';
		else if(level < info.grades[1])
			return info.compound ? 'cscroll1' : 'scroll1';
		else
			return info.compound ? 'cscroll2' : 'scroll2';
	}
	// Reset the next upgrade date to make it try again as soon as possible.
	function reset(){
		next_upgrade = 0
	}
}
let u_c = upgrade_compound(null);
setInterval(u_c, 1);