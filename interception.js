/*
 * @author	Mark
 * @source	https://github.com/marcopoloq/AdventureLandPublic/blob/master/interception.js
 *
 * 2D collision between two moving targets, a next target can be given to move towards a secondary target while remaining in range of the first.
 */
 
function move_character(target, nextTarget){
	// Move only if you have a target.
	if(!target){
		if(!nextTarget)
			return;
		else{
			target = nextTarget;
			nextTarget = undefined;
		}
	}
	// If you are not in attack range of the current target, get there.
	if(!in_attack_range(target)){
		// If the target isn't moving go to the target.
		if(!target.moving){
			let rangeVec = get_vectorlen([target.real_x - character.real_x, target.real_y - character.real_y], character.range);
			move(target.real_x - rangeVec[0], target.real_y - rangeVec[1]);
		}
		else{
			let [[t1, t2],targetVelocity, rangeVec] = get_intersection(character, target);
			// No valid intersection, go to the target's going location, should only happen then the target has equal or quicker speed.
			if(t1 < 0 && t2 < 0)
				move(target.going_x - rangeVec[0], target.going_y - rangeVec[1]);
			else{
				let timeToI;
				// Both options are valid solutions
				if(t1 > 0 && t2 > 0)
					timeToI = Math.min(t1, t2);
				// One of the two is a valid solution.
				else
					timeToI = Math.max(t1, t2);
				let dest = [target.real_x + targetVelocity[0] * timeToI, target.real_y + targetVelocity[1] * timeToI];
				// Can't reach target before it reaches going position, go to going position.
				if((dest[0] > target.real_x && dest[0] > target.going_x) || (dest[0] < target.real_x && dest[0] < target.going_x))
					move(target.going_x - rangeVec[0], target.going_y - rangeVec[1]);
				// Can reach the target before it reaches going position, go to intersection.
				else
					move(dest[0], dest[1]);
			}
		}
	}
	// Get ready to go to the next target, could actually calculate precisely, but not worth it.
	else if(nextTarget && nextTarget.going_x && nextTarget.going_y && !in_attack_range(nextTarget)){
		// Get the vector from current target to next target with length characterrange and go there.
		let TTNTvec = get_vectorlen([nextTarget.real_x - target.real_x, nextTarget.real_y - target.real_y], character.range);
		move(target.real_x + TTNTvec[0], target.real_y + TTNTvec[1]);
	}
}
//Returns the intersect time needed to calculate the new character position.
function get_intersection(chaser, runner){
	// Calculate the rangevector.
	let rangeVec = get_vectorlen([runner.real_x - chaser.real_x, runner.real_y - chaser.real_y], character.range);
	//Transpose runner with chaser and with the rangeVector.
	let runnerRX = runner.real_x - chaser.real_x - rangeVec[0];
	let runnerGX = runner.going_x - chaser.real_x - rangeVec[0];
	let runnerRY = runner.real_y - chaser.real_y - rangeVec[1];
	let runnerGY = runner.going_y - chaser.real_y - rangeVec[1];
	// Velocity vector of the runner.
	let runnerVelocity = get_vectorlen([runnerGX - runnerRX, runnerGY - runnerRY], runner.speed);
	let a = runnerVelocity[0] * runnerVelocity[0] + runnerVelocity[1] * runnerVelocity[1] - chaser.speed * chaser.speed;
	let b = 2 * runnerRX * runnerVelocity[0] + 2 * runnerRY * runnerVelocity[1];
	let c = runnerRX * runnerRX + runnerRY * runnerRY;
	return [quadratic(a, b, c), runnerVelocity, rangeVec];
}
// Standard quadratic formula.
function quadratic(a, b, c){
	let sqrt = b * b - 4 * a * c;
	// No real answer possible.
	if(sqrt < 0)
		return [-1, -1];
	else{
		sqrt = Math.sqrt(sqrt);
		return [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)];
	}
}
// Returns the given vector with length newLength.
function get_vectorlen(v, newLength){
	let length = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
	return [(v[0] / length) * newLength, (v[1] / length) * newLength];
}