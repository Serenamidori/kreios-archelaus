// Generates a random number, default 1-20
function rand(sides) {
	if (sides) {
		return Math.ceil(Math.random() * sides);	
	} else {
		return Math.ceil(Math.random() * 20);
	}
};

module.exports = {
	rand
}