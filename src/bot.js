require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits, MessageFlags } = require("discord.js");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

bot.commands = new Collection();

const loadCommands = () => {
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);

      if ("data" in command && "execute" in command) {
        bot.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
      } else {
        console.warn(`Command ${filePath} is missing a "data" or "execute"`);
      }
    }
  }
};

loadCommands();

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
    console.error(`Error executing '${commandName}' by ${interaction.user.tag}:`, error);

    const errorContent = {
      content: `I'm not able to execute "${commandName}", try again later.`,
      flags: MessageFlags.Ephemeral
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorContent);
      } else {
        await interaction.reply(errorContent);
      }
    } catch (followUpError) {
      console.error("Failed to send error message to user:", followUpError.message);
    }
  }
});


bot.on("error", (error) => {
  console.error("[discord.js error]", error);
});

bot.on("warn", (warning) => {
  console.warn("[discord.js warning]", warning);
});

const startBot = async () => {
  try {
    if (!process.env.TOKEN) {
      console.error("ERROR: Missing TOKEN");
      process.exit(1);
    }
    
    console.info("Logging in...");
    await bot.login(process.env.TOKEN);
    
  } catch (error) {
    console.error("Log in failed", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  console.log("\nShutting down Kreios...");
  bot.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM, shutting down Kreios...");
  bot.destroy();
  process.exit(0);
});

startBot();
