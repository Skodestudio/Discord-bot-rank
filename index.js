const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');

// تحميل إعدادات التكوين من config.json
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const rolesData = JSON.parse(fs.readFileSync('./roles.json', 'utf8'));

// استخدام التوكن من config.json
const TOKEN = config.TOKEN;

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Skode® Studio');
    console.log('discord.gg/YhkyGV4Qd7');
});

client.on('messageCreate', async message => {
    if (message.content === '!roles') {
        const member = message.member;
        const hasRole = member.roles.cache.has(config.allowedRoleId);

        if (!hasRole) {
            return message.reply('You do not have permission to use this command.');
        }

        await message.delete();

        const serverName = message.guild.name;
        const guildIcon = message.guild.iconURL({ dynamic: true, size: 128 });
        const bannerImageURL = config.bannerImageURL;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(serverName)
            .setDescription('قم باختيار الرتب الأنسب إليك.\nChoose the ranks that suit you best.')
            .setThumbnail(guildIcon)
            .setImage(bannerImageURL)
            .setFooter({ 
                text: `Requested on ${new Date().toLocaleDateString()}`,
                iconURL: guildIcon
            })
            .setTimestamp();

        const sentMessage = await message.channel.send({ embeds: [embed] });

        const rows = [];
        for (const [section, roles] of Object.entries(rolesData)) {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`roles_${section}`)
                .setPlaceholder(section)
                .addOptions(roles.map(role => ({
                    label: role.roleName,
                    value: role.roleId
                })));

            const row = new ActionRowBuilder()
                .addComponents(selectMenu);

            rows.push(row);
        }

        await sentMessage.edit({ components: rows });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    const selectedRoleId = interaction.values[0];
    const member = interaction.member;
    const hasRole = member.roles.cache.has(selectedRoleId);

    try {
        if (hasRole) {
            await member.roles.remove(selectedRoleId);
            await interaction.reply({ content: 'تم إزالة الرتبة بنجاح.\nRank removed successfully', ephemeral: true });
        } else {
            await member.roles.add(selectedRoleId);
            await interaction.reply({ content: 'تم إضافة الرتبة بنجاح.\nRank added successfully', ephemeral: true });
        }
    } catch (error) {
        console.error('خطأ في معالجة التفاعل:', error);
        await interaction.reply({ content: 'حدث خطأ أثناء معالجة طلبك.\nAn error occurred while processing your request.', ephemeral: true });
    }
});

client.login(TOKEN);
