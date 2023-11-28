import { config } from "dotenv";
import { request } from "./request.mjs";
import cheerio from "cheerio";
import wait from "./wait.mjs";
import {
  REST,
  Routes,
  ApplicationCommandOptionType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
} from "discord.js";

config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.on("ready", () => {
  console.log('Bot Online!');
});

async function bypass(userhwid) {
  const start_url =
    "https://fluxteam.net/android/checkpoint/start.php?HWID=" + userhwid;
  const commonheader = {
    Referer: "https://linkvertise.com/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
  };
  await request(start_url, {
    Referer: "https://fluxteam.net/",
  });
  await request(
    "https://fluxteam.net/android/checkpoint/check1.php",
    commonheader
  );
  await request(
    "https://fluxteam.net/android/checkpoint/check2.php",
    commonheader
  );
  await request(
    "https://fluxteam.net/android/checkpoint/check3.php",
    commonheader
  );
  const response = await request(
    "https://fluxteam.net/android/checkpoint/main.php",
    commonheader
  );
  const parsed = cheerio.load(response["data"]);
  const key = parsed("body > main > code").text();

  return key;
}

function extractHWIDFromURL(url) {
  const regex = /HWID=([\w\d]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "fluxus") {
    const link = interaction.options.get("link").value;

    await interaction.deferReply();

    try {
      const userhwid = extractHWIDFromURL(link);
      const key = await bypass(userhwid);
      const keyWithoutSpaces = key.replace(/\s+/g, "");
      const embed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle("*Copy Key Fluxus*")
        .setDescription("```" + keyWithoutSpaces + "```")
        .addFields(
          {
            name: "**Create By HN Gaming ❤**",
            value: "**Subscribe My Channel.**\n [HN Gaming](https://www.youtube.com/channel/UCVzNxeEWfSbnf_IK3YMhW3w)",
          },
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply(
        "An error occurred while generating your key."
      );
    }
  }
});

async function main() {
  const commands = [
    {
      name: "fluxus",
      description: "Enter your link",
      options: [
        {
          name: "link",
          description: "enter your link",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    }
  ];

  try {
    console.log("Successfully added application (/) commands.");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    client.login(TOKEN);
  } catch (error) {
    console.log(error);
  }
}

main();