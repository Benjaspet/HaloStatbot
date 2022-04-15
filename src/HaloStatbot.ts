/*
 * Copyright © 2022 Ben Petrillo. All rights reserved.
 *
 * Project licensed under the MIT License: https://www.mit.edu/~amini/LICENSE.md
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * All portions of this software are available for public use, provided that
 * credit is given to the original author(s).
 */

import {Client, Intents, MessageEmbed} from "discord.js";
import {REST} from "@discordjs/rest";
import {config} from "dotenv";
import {ApplicationCommandOptionType, Routes} from "discord-api-types/v9";
import axios from "axios";

config();

const client: Client = new Client({
    allowedMentions: {
        parse: ["users", "roles", "everyone"],
        repliedUser: false,
    },
    partials: ["CHANNEL", "MESSAGE", "REACTION"],
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
});

client.on("ready", async () => {
    client.user.setActivity("Halo Infinite", {type: "PLAYING"});
    setInterval(() => {
        client.user.setActivity("Halo Infinite", {type: "PLAYING"});
    }, 1000 * 60 * 6);
})

client.on("interactionCreate", async interaction => {
   if (interaction.isCommand()) {
       await interaction.deferReply();
       switch (interaction.commandName) {
           case "halostats":
               const player: string = interaction.options.getString("player");
               axios.get("https://haloinfinite.benpetrillo.dev/v3/stats/" + player)
                   .then(async response => {
                       const generalStats = response.data.data.general;
                       const shotStats = response.data.data.general.shots;
                       const embed: MessageEmbed = new MessageEmbed()
                           .setTitle("Statistics | " + player)
                           .setColor("GREY")
                           .addFields([
                               {
                                   name: "General Statistics",
                                   value: `• Username: **${generalStats.username}**` + `\n`
                                   + `• Kill-Death Ratio: **${generalStats.kdRatio}**` + `\n`
                                   + `• Win Percentage: **${generalStats.winPercentage}**` + `\n`
                                   + `• Average KDA: **${generalStats.averageKDA}**` + `\n`
                                   + `• Average Damage: **${generalStats.averageDamage}**`,
                                   inline: false
                               },
                               {
                                   name: "Specifics",
                                   value: `• Kills: **${generalStats.specifics.kills}**` + `\n`
                                   + `• Assists: **${generalStats.specifics.assists}**` + `\n`
                                   + `• Deaths: **${generalStats.specifics.deaths}**` + `\n`
                                   + `• Headshots: **${generalStats.specifics.headshots}**` + `\n`
                                   + `• Damage Dealt: **${generalStats.specifics.damageDealt}**` + `\n`
                                   + `• Damage Taken: **${generalStats.specifics.damageTaken}**` + `\n`
                                   + `• Betrayals: **${generalStats.specifics.betrayals}**` + `\n`
                                   + `• Suicides: **${generalStats.specifics.suicides}**` + `\n`
                                   + `• Score: **${generalStats.specifics.score}**` + `\n`,
                                   inline: false
                               },
                               {
                                   name: "Matches",
                                   value: `• Matches Won: **${generalStats.specifics.matchesWon}**` + `\n`
                                   + `• Matches Lost: **${generalStats.specifics.matchesLost}**` + `\n`
                                   + `• Matches Unfinished: **${generalStats.specifics.matchesNotFinished}**` + `\n`,
                                   inline: false
                               },
                               {
                                   name: "Shots",
                                   value: `• Shot Accuracy: **${shotStats.shotAccuracy}**` + `\n`
                                   + `• Shots Fired: **${shotStats.shotsFired}**` + `\n`
                                   + `• Shots Hit: **${shotStats.shotsHit}**` + `\n`
                                   + `• Headshot Accuracy: **${shotStats.headshotAccuracy}**` + `\n`
                                   + `• Headshot Hits: **${shotStats.headshotHits}**` + `\n`
                               }
                           ])
                       return void await interaction.editReply({embeds: [embed]});
                   })
                   .catch(error => {
                       console.log(error)
                       return void interaction.editReply("Unable to fetch statistics for " + player + ".");
                   })
               break;
       }
   }
});

if (JSON.parse(process.env["DEPLOY-COMMANDS"])) {
    const rest: REST = new REST({ version: '9' }).setToken(process.env["TOKEN"]);
    try {
        rest.put(
            Routes.applicationCommands(process.env["CLIENT-ID"]), {
                body: [
                    {
                        name: "halostats",
                        description: "Obtain Halo Infinite statistics for a player.",
                        options: [
                            {
                                name: "player",
                                description: "The player to search for.",
                                type: ApplicationCommandOptionType.String,
                                required: true,
                                autocomplete: false
                            }
                        ]
                    }
                ]
             }).then(() => {});
    } catch (err: any) {
        console.log("Failed to deploy slash commands.")
    }
}

client.login(process.env["TOKEN"]).then(() => console.log("HaloStatbot logged in."));