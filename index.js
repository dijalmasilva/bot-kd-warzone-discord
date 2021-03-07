const Discord = require('discord.js');
const client = new Discord.Client();
const codWarzoneService = require('./services/cod-warzone.service');
// codWarzoneService.battleRoyaleInformation('dss#11773', 'battle');

const platforms = [
    'psn',
    'steam',
    'xbl',
    'battle',
    'acti'
]

client.on('ready', () => {
    console.log(`Logged is as ${client.user.tag}`);
})

client.on('message', msg => {
    if (msg.author.bot) return false;

    if (msg.content.includes("@here") || msg.content.includes("@everyone")) return false;

    if (msg.content === 'id') {
        const guild = client.guilds.cache.find(g => g.name === 'Warzone KD')
        console.log('msg author id: ' + msg.author.id)
        const member = guild.members.cache.find(member => {
            console.log(member.id);
            return member.id === msg.author.id
        })

        console.log('\n Member found: ')
        console.log(member)
    }

    if (msg.mentions.has(client.user.id)) {
        const message = `Digite sua plataforma de acordo com as opcoes: \n ${platforms.map(p => `- ${p}`).join(`\n`)}`;

        msg.author.send(message).then(value => {
            const channel = value.channel;
            if (channel) {
                const collector = channel.createMessageCollector(m => !m.author.bot, { max: 2, time: 60000 });
                const dataConsult = {
                    count: 0,
                    hasError: false,
                }

                collector.on('collect', message => {
                    if (dataConsult.count === 0) {
                        const platform = message.content;
                        if (!platforms.includes(platform)) {
                            channel.send('Voce inseriu uma opcao invalida. Para tentar novamente digite @kd-warzone.');
                        } else {
                            dataConsult.hasError = true;
                            channel.send(`Insira agora seu username da plataforma ${platform}: (Por exemplo no Battle.net: user#1234) \n`)
                        }
                        dataConsult.count = 1;
                    }
                });

                collector.on('end', collected => {
                    if (!dataConsult.hasError && collected.size === 2) {
                        const answers = collected.array();
                        const platform = answers[0].content;
                        const userTag = answers[1].content;

                        if (userTag) {
                            codWarzoneService.battleRoyaleInformation(userTag, platform).then(res => {
                                const data = res.data;
                                const warzoneBr = data[Object.keys(data)[0]];
                                const kdRatio =  parseFloat(warzoneBr['kdRatio'].toFixed(2));
                                const embedWarzoneInfo = new Discord.MessageEmbed()
                                    .setColor('#e02a4a')
                                    .setTitle(`${userTag} - ${platform} - Warzone`)
                                    .setDescription('--------------------------------')
                                    .addField(`Vitorias: `, warzoneBr['wins'])
                                    .addField('K/D: ', kdRatio)
                                    .addField('Baixas: ', warzoneBr['kills'], true)
                                    .addField('Mortes: ', warzoneBr['downs'], true)
                                    .setTimestamp()
                                    .setFooter('Suas tags foram atualizadas com sucesso!');
                                channel.send(embedWarzoneInfo);
                                const roleName = `${kdRatio} KD`;
                                const guild = client.guilds.cache.find(g => g.name === 'Warzone KD')
                                const roleExist = guild.roles.cache.find(r => r.name === roleName)
                                const member = guild.members.cache.find(member => member.id === msg.author.id);
                                if (!roleExist) {
                                    const role = {
                                        name: roleName,
                                        color: '#00d4ff',
                                        mentionable: true,
                                        permissions: 'SEND_MESSAGES'
                                    }
                                    guild.roles.create({
                                        data: role,
                                        reason: `KD Warzone - ${kdRatio}`
                                    }).then(role => {
                                        if (member) {
                                            member.roles.add(role);
                                        }
                                    })
                                } else {
                                    if (member) {
                                        member.roles.add(roleExist);
                                    }
                                }
                                const rolesToRemove = member.roles.cache.filter(r => r.name !== roleName && r.name.includes(' KD'))
                                rolesToRemove.forEach(r => {
                                    member.roles.remove(r);
                                })
                            }).catch(err => {
                                console.error(err);
                                channel.send('Nao foi possivel processar seu dados. \n Siga as etapas seguintes para deixar seus dados publicos do Warzone: https://sbmmwarzone.com/help-profile \n Caso ja tenha feito, tente novamente mais tarde.')
                            })
                        }
                    }
                })
            }
        })
    }
})

client.login('ODE3MjU5OTI4MjM3ODk5Nzc2.YEG6ng.nJrrrtIbT-G3IK1DbUPKTnzjvPc').then(() => console.log('Bot online'));