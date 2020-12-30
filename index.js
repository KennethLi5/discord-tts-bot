const Discord = require('discord.js');
const Stream = require('stream');
const AWS = require('aws-sdk');
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;

const {
	prefix,
    discToken,
    awsKey,
    awsSecretKey,
    awsVoice,
    scClientID,
    scLink
} = require('./config.json');

const client = new Discord.Client();
const queue = new Map();
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1',
    accessKeyId: awsKey,
    secretAccessKey: awsSecretKey
})

var botID = 1; //leaving discord call sets user voice ID to null. setting botID to null will cause error when leaving voice channel because of newUserChannel == botID and channel.join

client.login(discToken);

client.once('ready', () => {
    console.log('Ready!');
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

function synthesizeSpeech(params, connection, broadcast) { // retrieve Amazon Polly audio 
    Polly.synthesizeSpeech(params, function(err, data) {        
        var bufferStream = new Stream.PassThrough()
        bufferStream.end(data.AudioStream)                
        broadcast.play(bufferStream)
        connection.play(broadcast);
    })
}

function youtubeAudio(link, connection) { //retrieve YouTube audio 
    var bufferStream = ytdl(link, {
        filter: 'audioonly'
    })

    connection.play(bufferStream);
}

client.on('message', async message => {    // WIP for direct bot dm commands
    if (message.channel.type == "dm") {
        return;
    }
})

client.on('message', async message => { // join and leave commands
    if (message.channel.type == "text") {                  
        if (message.content === prefix + 'join') {
            try{ 
                var channelID=message.member.voice.channelID;            
                var channel=client.channels.cache.get(channelID);
                channel.join();
                botID = channelID; // update botID for playing sound. to-do: check if bot is in voice channel without global botID
                console.log("Joined voice channel: " + message.member.voice.channel.name);
                return;
            }catch(error){
                console.error(error);
            }
        }
        if (message.content === prefix + 'leave') {
            try{ 
                if (message.guild.voice.connection) {
                    message.guild.me.voice.channel.leave();
                    console.log("Left voice channel: " + message.guild.me.voice.channel.name);                            
                    return;
                }
            }catch(error){
                console.error(error);
            }
        }
    }
})

client.on('message', async message => { // Text to Speech
    if (message.channel.type == "text") {        
        if (message.content === prefix + 'tts') { 
            await message.reply('please enter a message.');
            return;
        }    
        if (!message.content.startsWith(prefix + 'tts '))       
            return;            

        const msg = message.content.slice((prefix+'tts').length).trim();

        try{ 
            const broadcast = client.voice.createBroadcast();
            var channelID=message.member.voice.channelID;
            var channel=client.channels.cache.get(channelID);
            
            var params = {
                OutputFormat: 'mp3',
                Text: msg,
                VoiceId: awsVoice,            
            }
            
            channel.join().then(connection => {                
                console.log("TTS in voice channel: " + message.member.voice.channel.name + ". Message: " + msg);
                synthesizeSpeech(params, connection, broadcast)                
            });
        }catch(error){
            console.error(error);
        }
    }
})

client.on('voiceStateUpdate', (oldMember, newMember) => { // Play sound when someone joins 
    let newUserChannel = newMember.channelID;
    let oldUserChannel = oldMember.channelID;    
    var channel = client.channels.cache.get(botID);
            
        if (newUserChannel != oldUserChannel) {
            if (newUserChannel == botID) {      
                try{  
                    channel.join().then(connection => {
                        scdl.download(scLink, scClientID).then(stream => {
                            connection.play(stream);
                        })       
                    })
                }catch(error){
                    console.error(error);
                }
            }
        }  
})
