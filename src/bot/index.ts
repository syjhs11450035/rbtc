import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

let botStatus = {
  online: false,
  tag: null as string | null,
  latency: 0,
  error: null as string | null
};

export function getBotStatus() {
  return botStatus;
}

export async function startDiscordBot(getDb: () => any) {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId || token === 'DISCORD_TOKEN' || token.includes('YOUR_TOKEN')) {
    console.log('Discord Bot Token or Client ID not set or contains placeholder. Skipping bot startup.');
    botStatus.error = 'Missing credentials';
    return;
  }

  try {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    const commands = [
      new SlashCommandBuilder()
        .setName('points')
        .setDescription('查詢指定玩家的 PX 點數餘額')
        .addStringOption(option => 
          option.setName('roblox_id')
            .setDescription('Roblox 數字 ID')
            .setRequired(true)
        ),
      new SlashCommandBuilder()
        .setName('vehicle')
        .setDescription('查詢指定車牌的改裝狀態')
        .addStringOption(option => 
          option.setName('plate')
            .setDescription('車牌 ID')
            .setRequired(true)
        ),
      new SlashCommandBuilder()
        .setName('status')
        .setDescription('檢查 Nexus 監理系統運行的狀態'),
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      console.log('Started refreshing application (/) commands.');
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error refreshing commands:', error);
      // Don't return here, let the bot try to login anyway if it can
    }

    client.once('ready', () => {
      console.log(`Logged in as ${client.user?.tag}!`);
      botStatus.online = true;
      botStatus.tag = client.user?.tag || 'Unknown';
      botStatus.latency = client.ws.ping;
      botStatus.error = null;
    });

    client.on('error', (error) => {
      console.error('Discord Client Error:', error);
      botStatus.online = false;
      botStatus.error = error.message;
    });

    client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;

      const { commandName } = interaction;

      try {
        if (commandName === 'points') {
          const robloxId = interaction.options.getString('roblox_id', true);
          const usersRef = getDb().collection('users');
          const querySnapshot = await usersRef.where('robloxId', '==', robloxId).limit(1).get();

          if (querySnapshot.empty) {
            return await interaction.reply({ 
              content: `❌ **找不到連結紀錄**\nRoblox ID \`${robloxId}\` 尚未綁定至 Nexus 帳號系統。`, 
              ephemeral: true 
            });
          }

          const userData = querySnapshot.docs[0].data();
          const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📡 Nexus Identity Query')
            .setDescription(`帳戶身份驗證成功：**${userData.username || 'Citizen'}**`)
            .addFields(
              { name: '目前 PX 餘額', value: `\`${userData.points || 0} PX\``, inline: true },
              { name: '帳戶狀態', value: '🟢 ACTIVE', inline: true },
            )
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/1042/1042459.png')
            .setFooter({ text: 'Nexus Auth System v2.4' })
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'vehicle') {
          const plate = interaction.options.getString('plate', true).toUpperCase();
          const vehiclesRef = getDb().collection('vehicles');
          const vehicleDoc = await vehiclesRef.doc(plate).get();

          if (!vehicleDoc.exists) {
            return await interaction.reply({ 
              content: `❌ **車牌識別失敗**\n找不到車牌號碼為 \`${plate}\` 的資產登記記錄。`, 
              ephemeral: true 
            });
          }

          const vehicle = vehicleDoc.data();
          const embed = new EmbedBuilder()
            .setColor(0x00FF99)
            .setTitle(`📑 車輛資產檔案: ${vehicle.plate}`)
            .setDescription(`型號標識: **${vehicle.model}**`)
            .addFields(
              { name: '馬力係數 (HP)', value: `\`${vehicle.tuning.hpScale || 1.0}x\``, inline: true },
              { name: '懸吊硬度', value: `\`${vehicle.tuning.suspension || 1.0}x\``, inline: true },
              { name: '烤漆識別 (HEX)', value: `\`${vehicle.tuning.hexColor}\``, inline: true },
            )
            .setImage(`https://ais-dev-wdnzorsxd24tflk5c7ojxv-487175973493.asia-northeast1.run.app/api/render-preview?plate=${plate}`)
            .setFooter({ text: 'Nexus Registry System • Remote Query' })
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'status') {
          const embed = new EmbedBuilder()
            .setColor(0x00D9FF)
            .setTitle('⚡ Nexus Core Status')
            .setDescription('監管系統主機運行狀態良好，所有子系統皆已連接。')
            .addFields(
              { name: '主機狀態', value: '🟢 STABLE', inline: true },
              { name: 'API Latency', value: `\`${client.ws.ping}ms\``, inline: true },
              { name: 'Uptime', value: '🟢 100%', inline: true },
            )
            .setFooter({ text: 'Nexus Infrastructure Monitoring' })
            .setTimestamp();
          
          await interaction.reply({ embeds: [embed] });
        }
      } catch (error) {
        console.error(`Interaction Error (${commandName}):`, error);
        const errorMsg = '⚠️ **系統異常**\n在執行命令時發生了預料之外的錯誤，請聯繫管理員。';
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: errorMsg, ephemeral: true });
        } else {
          await interaction.reply({ content: errorMsg, ephemeral: true });
        }
      }
    });

    await client.login(token);
  } catch (error) {
    console.error('Failed to initialize or login Discord Bot:', error);
  }
}
