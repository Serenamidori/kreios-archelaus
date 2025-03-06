// Formats the messages for the dice roller
function diceMessage (index, bonus, symbol, count, numbers, sides, total) {
	const constants = require('../messages/constants.json');
	var responses = constants.diceRoller;
	var response = responses[index];
	var punctuation = index == 4 ? "!" : ".";

	var bonusMessage = bonus && symbol ? symbol + bonus : "";
	var bonusRoll = bonus && symbol ? " (" + symbol + " " + bonus + ")" : "";

	var rolls = "";
	for (i = 0; i < count; i++) {
		rolls += numbers[i];
		if (i != count - 1) {
			rolls += " + "
		}
	}
	var diceMessage = " `[" + count + "d" + sides + bonusMessage + "] = (" + rolls + bonusRoll + ")`"
	return response[rand(response.length)-1] + total + punctuation + "\n" + diceMessage;
}

module.exports = {
	diceMessage
}