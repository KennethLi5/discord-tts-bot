const Discord = require('discord.js');
const Stream = require('stream');
const https = require('https');
const googleTTS = require('google-tts-api');

const {
	command,
	token,
} = require('./config.json');

const client = new Discord.Client();
const queue = new Map();

client.once('ready', () => {
    console.log('Ready!');
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

function getVoiceStream(text, lang="en-GB", speed=1){
    const stream=new Stream.Transform();
    downloadFromInfoCallback(text,lang,speed,stream);
    return stream;
}

function downloadFromInfoCallback(text, lang, speed, stream){
    console.log(text);
    const url = googleTTS.getAudioUrl(text, {lang: lang})
    
    const request = https.get(url, function(response,err) {
        response.pipe(stream);
    });

}

function play(serverId, serverQ){
    if(serverQ.messages.length == 0){
        serverQ.voiceChannel.leave();
        queue.delete(serverId);
        return;
    }
    const broadcast = serverQ.broadcast.play(
        getVoiceStream(serverQ.messages.shift())
    );

    const dispatcher = serverQ.connection
    .play(broadcast)
    .on("error", error => console.log(error))
    .on("finish", () => play(serverId, serverQ))

};

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(command)) return;

    const args = message.content.slice(command.length).trim();
    const serverId = message.guild.id;
    let serverQ = queue.get(serverId);

    try{ 
        const broadcast = client.voice.createBroadcast();
        var channelId=message.member.voice.channelID;
        var channel=client.channels.cache.get(channelId);
        channel.join().then(connection => {
            broadcast.play(getVoiceStream(args));
            const dispatcher=connection.play(broadcast);
        });
    }catch(error){
        console.error(error);
    }

    

    // try {
    //     const vc = message.member.voice.channel;
    //     // console.log(channelId, message.guild.id);
    //     if(!vc) {message.reply('you must be in a voice channel'); return;}
    //     if(!serverQ) {
    //         let newQ = {
    //             textChannel: message.channel, 
    //             voiceChannel: vc,
    //             connection: null,
    //             broadcast: null,
    //             messages: [],
    //             volume: 5, 
    //             playing: true
    //         };
    //         queue.set(serverId, newQ);
    //         newQ.connection = await vc.join();
    //         newQ.broadcast = client.voice.createBroadcast();
    //         newQ.messages.push(args);
            
    //         play(serverId, newQ);
        
        
    //     }else{
    //         serverQ.messages.push(args);
    //         console.log(serverQ.messages);
    //         return;
    //     };
        
        
        

        
    // }catch(error){
    //     console.error(error);
    //     message.reply('error executing command. sorry about that king. ')
    // }

})

client.login(token);
