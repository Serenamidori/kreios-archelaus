const { SlashCommandBuilder } = require("discord.js");
const constants = require("../../data/constants.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("experience")
    .setDescription("Ask Kreios for XP amount for your latest encounter")
    .addIntegerOption((option) =>
      option.setName("level")
        .setDescription("What level is your character?")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)
    )
    .addIntegerOption((option) =>
      option.setName("difficulty")
        .setDescription("What is the difficulty of your encounter?")
        .setRequired(true)
        .addChoices(
          { name: "Very Easy", value: 0 },
          { name: "Easy", value: 1 },
          { name: "Medium", value: 2 },
          { name: "Hard", value: 3 },
          { name: "Very Hard", value: 4 },
          { name: "Nearly Impossible", value: 5 }
        )
    ),
  async execute(interaction) {
    const xpTable = constants.xpTable;
    const difficulty = interaction.options.getInteger("difficulty");
    const level = interaction.options.getInteger("level");
    const xp = xpTable[level - 1][difficulty];

    await interaction.reply(`Your level ${level} character would receive ${xp} XP for this encounter.`);
  },
};
