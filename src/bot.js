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
//       case "twene":
//         message.reply(
//           "Ah, so things are not as expected? " +
//             constants.twene[utils.random.rand(constants.twene.length - 1)]
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
