const Discord = require('discord.js');
const http = require('http');
const axios = require('axios');
const mysql = require('mysql');

const Settings = require('./settings.json');

asTable = require('as-table');

var chatEnabled = true;

var con = mysql.createConnection({
  host: Settings.MySQLHost,
  user: Settings.MySQLUser,
  password: Settings.MySQLPassword,
  database: Settings.MySQLDatabase
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

var presencetext = Settings.DefaultPresence;

const client = new Discord.Client();

client.login(Settings.DiscordToken);
client.on('ready', () => { 
    console.log(`Logged in as ${client.user.tag}!`); 

    setInterval(function() {
        client.user.setActivity(presencetext);
    }, 1000);
});

client.on('message', message => {
    const embed = new Discord.MessageEmbed();

    if(message.channel.id == 766359149549322241) {
        if(!message.content.includes("!gamergirl") && !message.content.includes("!player")) {
            message.delete();
        } 
    }

    var arrayOfEmojis = ["🙂", "😉", "🙃", "(:"];
    arrayOfEmojis.forEach(function(emoji) {
        if(message.content.includes(emoji)) {
            message.delete();
            message.reply("don't use that emoji...").then(msg => { msg.delete({ timeout: 3000 }) });
        }
    });

    if(message.channel.id == "766355480334696483") {
	    message.react('766349676319604778');
    }

	if(message.content.indexOf(Settings.CommandPrefix) == 0) {
		var msg = message.content;
		var commands = msg.substring(Settings.CommandPrefix.length);
        var args = commands.split(" ");
        
        switch(args['0']) {
			case 'stats':
                var url = Settings.BaseURL + "/Engine.svc/GetServerInformation";

                http.get(url, (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => { data += chunk; });
                    resp.on('end', () => {
                        message.channel.send("**[OK]** Ingame: " + JSON.parse(data).onlineNumber);
                    });
                }).on("error", (err) => {
                    message.channel.send("**[ERR]** Server is offline!");
                });

                break;
            case 'ban':
            case 'unban':
            case 'kick':
                if(message.author.bot) {
                    var pid = 208412; 
                    axios.post(Settings.BaseURL + '/Engine.svc/ofcmdhook?pid='+pid+'&cmd='+args['0']+'%20' + args['1'], null, {headers: { Authorization: Settings.AnotherAuth }}).then(res => {

                    }).catch(error => {
                        message.channel.send("**[ERR]** Failed to " + args['0'] + " "+ args['1'] +"!");
                    })
                } else {
                    if(message.member.roles.cache.some(r => r.id === Settings.RoleRequired)) {
                        var pid = 208412; 

                        if(message.member.id == 133384493493911552)  pid = 134;
                        if(message.member.id == 646223934655692801)  pid = 75116;
                        if(message.member.id == 722222150085246998)  pid = 100;
                        if(message.member.id == 310863894090481666)  pid = 89477;
                        if(message.member.id == 512713502415257612)  pid = 33351;
                        if(message.member.id ==  94933455258783744)  pid = 117803;
                        if(message.member.id == 229666306549481472)  pid = 5969;                        

                        axios.post(Settings.BaseURL + '/Engine.svc/ofcmdhook?pid='+pid+'&cmd='+args['0']+'%20' + args['1'], null, {headers: { Authorization: Settings.AnotherAuth }}).then(res => {

                        }).catch(error => {
                            message.channel.send("**[ERR]** Failed to " + args['0'] + " "+ args['1'] +"!");
                        })
                    } else {
                        message.channel.send("ERROR! Lack of privileges.");
                    }
                }
                break;
            case 'sql':
                if(message.member.roles.cache.some(r => r.id === Settings.RoleRequired)) {
                    sqlquery = msg.replace(Settings.CommandPrefix + args['0'] + " ", "");

                    var splittedquery = sqlquery.split(" ");

                    con.query(sqlquery, function (err, result) {
                        if (err) message.reply(err);
                        if(splittedquery['0'] == "UPDATE") {
                            message.channel.send("```" + JSON.stringify(result) + "```");
                        } else {
                            message.channel.send("```" + asTable(result) + "```");
                        }
                    });
                } else {
                    message.channel.send("ERROR! Lack of privileges.");
                }
                break;
            case 'setpresence':
                if(message.member.roles.cache.some(r => r.id === Settings.RoleRequired)) {
                    presencetext = msg.replace(Settings.CommandPrefix + args['0'] + " ", "");
                } else {
                    message.channel.send("ERROR! Lack of privileges.");
                }
                break;
            case 'alert':
                if(message.member.roles.cache.some(r => r.id === Settings.RoleRequired)) {
                    const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } };
                    const post = "message="+msg.replace(Settings.CommandPrefix + args['0'] + " ", "")+"&announcementAuth=" + Settings.AdminAuth;
                
                    axios.post(Settings.BaseURL + '/Engine.svc/Send/Announcement', post, config).then(res => {
                        message.reply("Sent an alert!");
                    }).catch(error => {
                        message.reply(error);
                    })
                } else {
                    message.channel.send("ERROR! Lack of privileges.");
                }
                break;
            case 'disablechat':
                sqlquery = msg.replace(Settings.CommandPrefix + args['0'] + " ", "");
                var splittedquery = sqlquery.split(" ");

                if(splittedquery['0'] == "true") {
                    chatEnabled = false;
                    message.reply("Chat bridge disabled");
                } else {
                    chatEnabled = true;
                    message.reply("Chat bridge enabled");
                }
            break;
            default:
				message.channel.send("**UNKNOWN COMMAND: **" + Settings.CommandPrefix + args['0'].replace("everyone", "...").replace("here", "..."));
				break;
        }
    }

    if(chatEnabled == true) {
        var ArrayOfChannels = [
            "pl=766370981643288598",
            "fr=766371019995742238",
            "de=766370989738426398",
            "en=766370970289832006",
            "es=766371056675323904",
            "it=766371001255723039",
            "br=772008022142091286",
            "ru=772008148550025217",
            "gn=766371067072610364"
        ];

        ArrayOfChannels.forEach(function(channel) {
            if(channel.includes(message.channel.id)) {
                var channelid = channel.split("=");
                if(message.author.bot) return;
                if(message.content.includes("#disablechat")) return;

                if(message.member.user.id == 133384493493911552)  pid = 134;
                if(message.member.user.id == 646223934655692801)  pid = 75116;
                if(message.member.user.id == 722222150085246998)  pid = 100;
                if(message.member.user.id == 310863894090481666)  pid = 89477;
                if(message.member.user.id == 512713502415257612)  pid = 33351;
                if(message.member.user.id ==  94933455258783744)  pid = 117803;
                if(message.member.user.id == 229666306549481472)  pid = 5969;     
                if(message.member.user.id == 202468146295209993)  pid = 32799;   

                http.get(Settings.BaseURL + "/Engine.svc/Send/Chat?announcementAuth=" + Settings.AdminAuth + "&from=" + pid + "&channel=channel." + channelid['0'] + "__1&message=" + encodeURIComponent(message.content), (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => { data += chunk; });
                    resp.on('end', () => { });
                }).on("error", (err) => { });
            }
        });
    }
});
