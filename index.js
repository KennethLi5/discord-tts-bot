const Discord = require('discord.js');
const Stream = require('stream');
const AWS = require('aws-sdk');

const {
	command,
    token,
    key,
    secretkey,
} = require('./config.json');

const client = new Discord.Client();
const queue = new Map();
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1',
    accessKeyId: key,
    secretAccessKey: secretkey
})

client.login(token);

client.once('ready', () => {
    console.log('Ready!');
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});

function synthesizeSpeech(params, con, broadcast) {
    Polly.synthesizeSpeech(params, function(err, data) {
        var bufferStream = new Stream.PassThrough()
        bufferStream.end(data.AudioStream)                
        broadcast.play(bufferStream)
        const dispatcher=con.play(broadcast);
    })
}

client.on('message', async message => {
    if (message.author.bot) 
        return;

    if (!message.content.startsWith(command))
        return;

    const args = message.content.slice(command.length).trim();

    try{ 
        const broadcast = client.voice.createBroadcast();
        var channelId=message.member.voice.channelID;
        var channel=client.channels.cache.get(channelId);

        var params = {
            OutputFormat: 'mp3',
            Text: args,
            VoiceId: 'Brian',            
        }
        console.log(channelId);

        channel.join().then(connection => {
            synthesizeSpeech(params, connection, broadcast)
        });
    }catch(error){
        console.error(error);
    }
})

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.channelID;
    let oldUserChannel = oldMember.channelID;
    var channelId= '761963539950469121';
    var channel=client.channels.cache.get(channelId);
    const broadcast = client.voice.createBroadcast();



    channel.join().then(connection => { 

        if (newUserChannel != oldUserChannel) {
            if (newUserChannel == channelId) {

                if (newMember.member  == '154315825229201409') {
                    console.log("master");
                } 
            
                var params = {
                    OutputFormat: 'mp3',
                    Text: 'This is Chad 1 to Chad 3. Can we have some YEP Cock please?',
                    VoiceId: 'Brian',        
                }

                Polly.synthesizeSpeech(params, function(err, data) {            
                    var bufferStream = new Stream.PassThrough()
                    bufferStream.end(data.AudioStream)                
                    broadcast.play(bufferStream)
                    const dispatcher=connection.play(broadcast);
                })                
            } 
        }
    })
})