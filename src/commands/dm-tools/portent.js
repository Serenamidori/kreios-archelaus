const { SlashCommandBuilder } = require("discord.js");
const constants = require("../../data/constants.json");
const utils = require("../../utils");
const api = require("../../api");

function joinWords(arr) {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return arr.join(' and ');
  
  return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("portent")
    .setDescription("Ask Kreios for some words for inspiration")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("How many portents would you like? (default: 2)")
        .setRequired(false)

    ),
  async execute(interaction) {
    const number = interaction.options.getInteger("number") || 2;
    const words = await api.randomWord.getWords(number);
    const response = constants.portents[utils.random.rand(constants.portents.length) - 1];
    const wordsStr = joinWords(words);
    await interaction.reply(`-# ${response}:\n${wordsStr}`);
  },
};
