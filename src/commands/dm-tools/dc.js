const { SlashCommandBuilder } = require("discord.js");
const utils = require("../../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dc")
    .setDescription("Ask Kreios for the DC for a skill check")
    .addIntegerOption((option) =>
      option
        .setName("difficulty")
        .setDescription("What is the general difficulty of this action?")
        .setRequired(true)
        .addChoices(
          { name: "Very Easy", value: 0 },
          { name: "Easy", value: 5 },
          { name: "Medium", value: 10 },
          { name: "Hard", value: 15 },
          { name: "Very Hard", value: 20 },
          { name: "Nearly Impossible", value: 25 }
        )
    ),
  async execute(interaction) {
    const base = interaction.options.getInteger("difficulty");
    const dc = base + utils.random.rand(5);

    await interaction.reply(`This check is a **DC ${dc}**.`);
  },
};
