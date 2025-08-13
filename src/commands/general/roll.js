const { SlashCommandBuilder } = require("discord.js");
const constants = require("../../data/constants.json");
const utils = require("../../utils");

function isValid(str) {
  return /^(\d+[dD]\d+|[+-]?\d+)(\s*[+-]\s*(\d+[dD]\d+|\d+))*$/.test(str);
}

function getComponents(str) {
  const cleanedStr = str.replace(/\s/g, "");
  const components = cleanedStr.match(/[+-]?(?:\d+[dD]\d+|\d+)/g); 
  return components || [];
}

function isDiceRoll(str) {
  return /[dD]/.test(str);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll some dice")
    .addStringOption((option) =>
      option.setName("dice")
        .setDescription("Know what dice you want to roll? (ex. 1d20)")
        .setRequired(false)
    ),
  async execute(interaction) {
    const diceToRoll = interaction.options.getString("dice") || "1d20";
    
    if (!isValid(diceToRoll)) {
      await interaction.reply("I didn't quite understand, make sure you're sending me a valid dice roll.");
      return;
    }

    const diceToRollArr = getComponents(diceToRoll);
    let total = 0;
    let calculation = "";
    let critSuccess = false;
    let critFail = false;

    diceToRollArr.forEach(function(d) {
      let details = "";
      let label;

      const isNegative = d.startsWith("-");
      const isPositive = d.startsWith("+");
      const diceStr = (isNegative || isPositive) ? d.slice(1) : d;

      if (isNegative) label = ` - ${diceStr}`;
      else if (isPositive) label = ` + ${diceStr}`;
      else label = diceStr;

      if (isDiceRoll(diceStr)) {
        const diceComps = diceStr.split(/[dD]/);
        const num = parseInt(diceComps[0], 10);
        const type = parseInt(diceComps[1], 10);
        
        for (let i = 0; i < num; i++) {
          const roll = utils.random.rand(type);
          const rollStr = (roll === type || roll === 1) ? `**${roll}**` : `${roll}`;

          if (roll === type) critSuccess = true;
          else if (roll === 1) critFail = true;
  
          details += i === 0 ?  `${rollStr}` : `, ${rollStr}`;
          total += isNegative ? -roll : roll;
        }
        calculation += `${label} (${details})`
      } else {
        let value = parseInt(diceStr, 10);
        total += isNegative ? -value : value;
        calculation += `${label}`;
      }
    });

    let response = `> ${calculation}\n**Total: ${total}**`;
    let line;
    const drd = constants.diceRollerDialogue
    if (!/[dD]/.test(diceToRoll)) {
      line = drd.noDice[utils.random.rand(drd.noDice.length) - 1];
    } else if (critFail && critSuccess) {
      line = drd.critBoth[utils.random.rand(drd.critBoth.length) - 1];
    } else if (critFail) {
      line = drd.critFail[utils.random.rand(drd.critFail.length) - 1];
    } else if (critSuccess) {
      line = drd.critSuccess[utils.random.rand(drd.critSuccess.length) - 1];
    }
    if (line) response += `\n-# ${line}`
    await interaction.reply(response);
  },
};
