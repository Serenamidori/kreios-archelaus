const random = require('./random');

const difficulties = { 
  very_easy: {
    humanize: 'very easy',
    abbreviate: 've',
    base: 0
  },
  easy: {
    humanize: 'easy',
    abbreviate: 'e',
    base: 5
  },
  medium: {
    humanize: 'medium',
    abbreviate: 'm',
    base: 10
  },
  hard: {
    humanize: 'hard',
    abbreviate: 'h',
    base: 15
  },
  very_hard: {
    humanize: 'very hard',
    abbreviate: 'vh',
    base: 20
  },
  nearly_impossible: {
    humanize: 'nearly impossible',
    abbreviate: 'ni',
    base: 25
  }
}

function calcDC(difficulty){
  key = validateDifficulty(difficulty);

  if (key != null) {
    return difficulties[key].base + random.rand(5);		
  } else {
    return -1;
  }
}

function validateDifficulty(input) {
  let result = null;

  Object.entries(difficulties).forEach(function([key, value]) {
    if (input == value.abbreviate || input == value.humanize) {
      result = key;
    }
  });
  return result;
}

module.exports = {
	calcDC,
  validateDifficulty
}