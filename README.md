# Discord TTS Bot

Learning JavaScript and how to use AWS (Amazon Polly) through Node.js. Implemented in a Discord Bot. 

Originally done as a collab project with just the TTS function, however I wanted to expand on it and make it more of an actual Discord Bot.

## Features

- .join - Joins the voice channel of user
- .leave - Leave the voice channel of the server
- .tts - Translates user input text into speech through Amazon Polly. Plays in voice channel.
- Automatically playing an audio file when a user joins the voice channel.

Note: The current setting is to play a SoundCloud link when a user joins. However, this can be changed easily to play a TTS message or a YouTube link.

## Work in progress

- .yt - Fetches audio of a YouTube link for playback in voice channel.

## Requirements

- [Node.js](https://nodejs.org/en/)
- [Discord API](https://discordpy.readthedocs.io/en/latest/discord.html)
- [AWS Access Key](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html)
- SoundCloud Client ID 

```bash
To retrieve SoundCloud Client ID:

1. Go to any downloadable track on SoundCloud
2. In Google Chrome, open DevTools with F12 and look under Network tab
3. Click on any item that has client_id=[YOUR ID] in it and copy your ID.
```

Input Discord API key, AWS Acess Key, and SoundCloud Client ID into config.json

 