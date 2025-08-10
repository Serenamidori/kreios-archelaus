require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

bot.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      bot.commands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name}`);
    } else {
      console.log(`Command ${filePath} is missing a "data" or "execute"`);
    }
  }
}

bot.on("ready", () => {
  console.info(`Logged in as ${bot.user.tag}`);
  console.info(`Loaded ${bot.commands.size} slash commands`);
});

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const commandName = interaction.commandName;
  const command = bot.commands.get(commandName);

  if (!command) {
    console.error(`No command matching '${commandName}' was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing '${commandName}':`);
    console.error(error);

    const errorContent = {
      content: `Encountered an error attempting to execute "${commandName}".`,
      ephemeral: true
    }

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorContent);
    } else {
      await interaction.reply(errorContent);
    }
  }
});

//  TODO: remove and create more commands
// bot.on("message", async (message) => {
//   // Prevents Kreios from responding to his own messages
//   if (message.author.id == bot.user.id) return;

//   if (message.content.startsWith("!")) {
//     const args = message.content.substring(1).split(/ +/);
//     const cmd = args.shift().toLowerCase();

// 		// TODO: executeCommand(command, message, args);

//     switch (cmd) {
//       case "":
//         if (args.length != 0) {
//           message.reply(constants.general.noCommand);
//         }
//         break;
//       case "dc":
//         if (args.length == 0) {
//           message.reply(
//             "tell me the difficulty rating of your situation, and I'll give you a DC for this check.\nOptions: **ve** (very easy), **e** (easy), **m** (medium), **h** (hard), **vh** (very hard), **ni** (nearly impossible)\nex. `!dc m` or `!dc ni`"
//           );
//         } else {
//           // TODO: make this reusable
//           const length = args[0].length;
//           if (length === 2 || length === 1) {
//             difficulty = args[0];
//           } else {
//             // TODO: This needs to handle both one word and two word entries
//             difficulty = args.slice(0, 2).join(" ");
//           }
//           // TODO: eventually allow the rest of the message to be included in the successful response
//           dc = utils.calculations.calcDC(difficulty);

//           if (dc < 0) {
//             message.reply(
//               "didn't quite understand what your __difficulty rating__ is. Try one of the following options:\n**ve** (very easy), **e** (easy), **m** (medium), **h** (hard), **vh** (very hard), **ni** (nearly impossible)"
//             );
//           } else {
//             message.reply(
//               "you must succeed on a DC " + dc + " for this check."
//             );
//           }
//         }
//         break;
//       case "difficulty":
//       case "diff":
//       case "d":
//         if (args.length == 0) {
//           message.reply(
//             "be sure to tell me how difficult _you_ think the situation is,\n**trivial (t)** - Not a challenge at all.\n**average (a)** - Some amount of challenge.\n**uncommon (u)** - More challenging than normal.\n**dire (d)** - Possibly more of a challenge than you can handle."
//           );
//         } else {
//           var guess = "";
//           var rollTable = [];

//           switch (args[0]) {
//             case "t":
//             case "trivial":
//               guess = "trivial";
//               rollTable = ["0", "0", "1", "1", "1", "2"];
//               break;
//             case "a":
//             case "average":
//               guess = "average";
//               rollTable = ["1", "1", "2", "2", "3", "3"];
//               break;
//             case "u":
//             case "uncommon":
//               guess = "uncommon";
//               rollTable = ["1", "2", "2", "3", "3", "3"];
//               break;
//             case "d":
//             case "dire":
//               guess = "dire";
//               rollTable = ["3", "3", "3", "4", "4", "5"];
//               break;
//           }

//           var roll = rollTable[utils.random.rand(6) - 1];
//           message.reply(
//             "for this " +
//               guess +
//               " situation the difficulty is **" +
//               difficultiesNames[roll] +
//               "** (DC " +
//               utils.calculations.calcDC(difficultiesCodes[roll], true) +
//               ")."
//           );
//         }
//         break;
//       case "npc":
//         if (args.length == 0) {
//           message.reply(
//             "be sure to specify what you'd like to know about this NPC.\n**attitude** - Gives the demeanor of the NPC towards you.\n**build [uncommon/rare/monster] [class]** - Creates a random NPC description to work with."
//           );
//         }
//         // build
//         if (args[0] == "build" || args[0] == "b") {
//           const npcBuild = constants.npcBuild;
//           var npc =
//             "**New NPC**\n(if you need a name, ask Avrae with `!randname` or `!randname [race]`)";

//           var raceArray = npcBuild[0];
//           if (contains(args, "uncommon") || contains(args, "u")) {
//             raceArray = raceArray.concat(npcBuild[1]);
//           }
//           if (contains(args, "rare") || contains(args, "r")) {
//             raceArray = raceArray.concat(npcBuild[2]);
//           }
//           if (contains(args, "monster") || contains(args, "m")) {
//             raceArray = npcBuild[2];
//           }
//           npc +=
//             "```\n Race: " + raceArray[utils.random.rand(raceArray.length) - 1];

//           if (contains(args, "class") || contains(args, "c")) {
//             npc +=
//               "\n Class: " +
//               npcBuild[3][utils.random.rand(npcBuild[3].length) - 1];
//           }
//           //check for other args, otherwise default to only Race, Gender, Eye Color, Hair Color and Length, Height, Weight, and 1 Misc.
//           npc +=
//             "\n Gender: " +
//             npcBuild[4][utils.random.rand(npcBuild[4].length) - 1] +
//             "\n Hair Color: " +
//             npcBuild[5][utils.random.rand(npcBuild[5].length) - 1] +
//             "\n Hair Length: " +
//             npcBuild[6][utils.random.rand(npcBuild[6].length) - 1] +
//             "\n Eye Color: " +
//             npcBuild[5][utils.random.rand(npcBuild[5].length) - 1] +
//             "\n Height: " +
//             npcBuild[7][utils.random.rand(npcBuild[7].length) - 1] +
//             "\n Weight: " +
//             npcBuild[8][utils.random.rand(npcBuild[8].length) - 1] +
//             "\n Misc. Trait: " +
//             npcBuild[9][utils.random.rand(npcBuild[9].length) - 1];

//           npc = npc + "```";
//           message.reply(npc);
//         }
//         // attitude
//         if (args[0] == "attitude" || args[0] == "a") {
//           message.reply(constants.npcAttitude[utils.random.rand(3) - 1]);
//         }
//         break;
//       case "intervention":
//         const interventions = constants.interventions;
//         var responses = [
//           "**Surprise!",
//           "**Time for an",
//           "**Look out!",
//           "**BOO!",
//         ];
//         message.reply(
//           responses[utils.random.rand(responses.length - 1)] +
//             " Intervention:** " +
//             interventions[utils.random.rand(6) - 1]
//         );
//         break;
//       case "p":
//       case "portent":
//         // TODO: Move this into message handling file
//         const words = await api.randomWord.getWords();
//         console.log(words);
//         message.reply(
//           constants.portents[utils.random.rand(constants.portents.length - 1)] +
//             ': "' +
//             words[0] +
//             '" and "' +
//             words[1] +
//             '"'
//         );
//         break;
//       case "twene":
//         message.reply(
//           "Ah, so things are not as expected? " +
//             constants.twene[utils.random.rand(constants.twene.length - 1)]
//         );
//         break;
//       case "flip":
//         var coin = utils.random.rand(2) == 2 ? "heads" : "tails";
//         message.reply("I flipped a coin for you, it was " + coin + ".");
//         break;
//       case "kroll":
//         // set defaults
//         var numbers = [];
//         var total = 0;
//         var count = 1;
//         var sides = 20;
//         var symbol;
//         var bonus;
//         var critSuccess = false;
//         var critFail = false;
//         // set up dice
//         var dice = message.content.match(
//           /(\d*)\s*[d|D]\s*(\d+)(\s*([\+|\-])\s*(\d+)+)*/
//         );
//         if (dice) {
//           count = dice[1] ? dice[1] : count;
//           sides = dice[2];
//           symbol = dice[4];
//           bonus = dice[5];
//         }
//         // handle d0 dice
//         if (sides == 0) {
//           message.reply("Look- it's fucking nothing!");
//           return;
//         }
//         // roll all dice
//         for (i = 0; i < count; i++) {
//           numbers[i] = utils.random.rand(sides);
//           total += numbers[i];
//           // account for crits
//           critSuccess = critSuccess || numbers[i] == sides;
//           critFail = critFail || numbers[i] == 1;
//         }
//         // apply bonuses
//         if (symbol) {
//           if (symbol == "+") {
//             total += parseInt(bonus);
//           } else {
//             total -= parseInt(bonus);
//           }
//         }
//         // calculate percentage of success
//         var max = sides * count;
//         var index = 2; // default, 26-74%
//         if (critSuccess && critFail) {
//           // both crit success and crit fail
//           index = 7;
//         } else if (critSuccess && sides == 20) {
//           // crit success
//           index = 6;
//         } else if (critFail && sides == 20) {
//           // crit fail
//           index = 5;
//         } else if (total >= max * 0.9) {
//           // 91-100%
//           index = 4;
//         } else if (total <= max * 0.1) {
//           // 0-9%
//           index = 0;
//         } else if (total >= max * 0.75) {
//           // 75-90%
//           index = 3;
//         } else if (total <= max * 0.25) {
//           // 10-25%
//           index = 1;
//         }
//         message.reply(
//           utils.messageHandler.diceMessage(
//             index,
//             bonus,
//             symbol,
//             count,
//             numbers,
//             sides,
//             total
//           )
//         );
//         break;
//       // TODO: Update the Commands and Intro, if needed
//       // case 'commands':
//       // 	message.channel.send('I will list the commands I understand. Be sure to use `!` or `/` before a command without spaces, unless otherwise stated:\n\n**roll (r)** - Dice roller in xdy format. [Be sure to only use `/` for this command, Avrae uses `!` for roll instead. Either dice is acceptable for gameplay]\n**flip (f)** - Coin flipper, I\'ll take a coin from my hoard and flip it for you.\n**oracle (o)** - The Oracle system. Ask a yes/no question with this command and I\'ll give you the answer.\n**npc (n)** - NPC options, attitude to see how NPCs react to you and build to create random descriptions.\n**portent (p)** - Portents, you receive two random words to help with inspiration.\n**twene (t)** - Table for When Everything is Not as Expected, you can use this when something in the scene isn\'t what you expected (obviously). I\'ll give you a twist and you can decipher what it means.\n**intro (i)** - A short description of myself and what I do.\n**credits (c)** - Credits to artists and systems that I use.\n**help (h)** - _This~_\n\nIf you address me by name, DM or Dungeon Master, Ill come to your beck and call. ~~Not that I have much of a choice.~~');
//       // 	break;
//       // case 'intro':
//       // 	message.channel.send('I am Kreios Archelaus, your new Dungeon Master. I may not be as talkative or descriptive as your _normal_ DM, but I will help to shape your world.\n\nMy purpose is to answer your questions as you play through campaigns by yourself or with a party. You will be the one(s) building your world, I\'m simply here to tell you \'yes\' or \'no\'. Out of the two of us, you\'ve got the most creativity here.\nI work on a system called MUNE (The Madey Upy Namey Emulator), where we work on Second Hand Creativity. If you need more information, you can read about it here: https://homebrewery.naturalcrit.com/share/rkmo0t9k4Q \nI have a few commands that start with `!` and `/`, you can read about them with `!help` or `/help`. But you may also talk to me normally, and I\'ll respond when I see something I can respond to.');
//       // 	break;
//       case "credits":
//         message.channel.send(
//           "Code by SerenaMidori [https://twitter.com/SerenaMidori]\nCharacter Design by Cassivel [https://www.deviantart.com/cassivel] \nMUNE System by /u/bionicle_fanatic [https://homebrewery.naturalcrit.com/share/rkmo0t9k4Q]"
//         );
//         break;
//     }
//   }
// });

bot.login(process.env.TOKEN);
