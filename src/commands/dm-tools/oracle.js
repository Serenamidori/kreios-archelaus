const { SlashCommandBuilder } = require("discord.js");
const constants = require("../../data/constants.json");
const utils = require("../../utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oracle")
    .setDescription("Ask Kreios a yes/no question")
    .addStringOption((option) =>
      option.setName("question")
        .setDescription("What is your yes/no question?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("likelihood")
        .setDescription("How likely is a positive outcome?")
        .setRequired(false)
        .addChoices(
          { name: "Likely", value: "likely" },
          { name: "Unlikely", value: "unlikely" }
        )
    ),
  async execute(interaction) {
    const oracle = constants.oracle;
    let roll = utils.random.rand(6);
    const question = interaction.options.getString("question");
    const likelihood = interaction.options.getString("likelihood");

    if (likelihood) {
      const rollAdv = utils.random.rand(6);
      if (likelihood === "likely") {
        roll = Math.max(roll, rollAdv);
      } else if (likelihood === "unlikely") {
        roll = Math.min(roll, rollAdv);
      }
    }

    const answer = oracle[roll];
    await interaction.reply(`> **${question}**\n${answer}`);
  },
};
