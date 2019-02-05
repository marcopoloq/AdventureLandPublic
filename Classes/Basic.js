/*
 * @author	Mark
 * @source	https://github.com/marcopoloq/AdventureLandPublic/blob/master/Classes/Basic.js
 */
var member = (function(){
	class Member{
		/*
		 * drink potions.
		 */
		constructor(args){
			this.missing_hp = args.missing_hp || 400; // The amount of missing hp needed before using a potion (default
													  // 400).
			this.missing_mp = args.missing_mp || 500; // The amount of missing mp needed before using a potion (default
													  // 500).
			// Variables for cooldowns
			this.last_potion = 0;
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
		}
	}
	/*
	 * Each ingame class is reprisented with it's own javascript class.
	 * Each javascript class inherits from Member and can access all of its methods.
	 * This means you can inherit everything leaving the class almost empty if you want.
	 */
	class Mage extends Member{
		constructor(args){
			super(args);
		}
	}
	class Priest extends Member{
		constructor(args){
			super(args);
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
	}
	let args = {};
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