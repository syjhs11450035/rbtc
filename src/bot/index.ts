import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export async function startDiscordBot(getDb: () => any) {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) {
    console.log('Discord Bot Token or Client ID not set. Skipping bot startup.');
    return;
  }

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
  }

  client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'points') {
      const robloxId = interaction.options.getString('roblox_id');
      
      try {
        const usersRef = getDb().collection('users');
        const querySnapshot = await usersRef.where('robloxId', '==', robloxId).limit(1).get();

        if (querySnapshot.empty) {
          await interaction.reply({ content: `❌ 找不到與 Roblox ID \`${robloxId}\` 綁定的 Nexus 帳號。`, ephemeral: true });
          return;
        }

        const userData = querySnapshot.docs[0].data();
        const embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Nexus 帳戶點數查詢')
          .addFields(
            { name: '玩家名稱', value: userData.username || '未知', inline: true },
            { name: '目前餘額', value: `${userData.points || 0} PX`, inline: true },
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: '抱歉，查詢時發生伺服器錯誤。', ephemeral: true });
      }
    }

    if (interaction.commandName === 'vehicle') {
      const plate = interaction.options.getString('plate');
      
      try {
        const vehiclesRef = getDb().collection('vehicles');
        const vehicleDoc = await vehiclesRef.doc(plate).get();

        if (!vehicleDoc.exists) {
          await interaction.reply({ content: `❌ 找不到車牌為 \`${plate}\` 的登記紀錄。`, ephemeral: true });
          return;
        }

        const vehicle = vehicleDoc.data();
        const embed = new EmbedBuilder()
          .setColor(0x00FF99)
          .setTitle(`車輛監理日誌: ${vehicle.plate}`)
          .setDescription(`車型: **${vehicle.model}**`)
          .addFields(
            { name: '馬力係數', value: `${vehicle.tuning.hpFactor}x`, inline: true },
            { name: '懸吊硬度', value: `${vehicle.tuning.suspensionFactor}x`, inline: true },
            { name: '烤漆 HEX', value: vehicle.tuning.hexColor, inline: true },
          )
          .setFooter({ text: 'Nexus Cloud-Bound System' })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: '查詢車輛時發生錯誤。', ephemeral: true });
      }
    }

    if (interaction.commandName === 'status') {
      const embed = new EmbedBuilder()
        .setColor(0x00D9FF)
        .setTitle('Nexus 系統狀態報告')
        .addFields(
          { name: '核心狀態', value: '🟢 正常 (STABLE)', inline: true },
          { name: 'API 端點', value: '🟢 在線', inline: true },
          { name: '機器人延遲', value: `${client.ws.ping}ms`, inline: true },
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    }
  });

  client.login(token);
}
