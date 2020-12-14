require('dotenv').config();
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const bot = new Discord.Client();
const jukeFunctions = require('./jukeFunctions/jukeFunctions');

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

const queue = new Map();

bot.on('message', async message => {
  const args = message.content.split(/ +/);
  const command = args.shift().toLowerCase();
  const serverQueue = queue.get(message.guild.id);
  const voiceChannel = message.member.voice.channel;

  if (command === '!juke') {

    if (!args[0]) {
      return message.channel.send(
        'You gotta link a youtube URL, buddy'
      );
    }

    const song = await ytdl.getInfo(args[0]);
    // const song = await ytdl.getInfo(args[0]);
    // const songTitle = song.videoDetails.title
    // const song = {
    //   title: songInfo.videoDetails.title,
    //   url: songInfo.videoDetails.video_url,
    // };

   if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };

      queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        const connection = await voiceChannel.join();
        queueContruct.connection = connection;
        jukeFunctions.play(message.guild, queueContruct.songs[0], queue);
      } catch (err) {
        console.log(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`**${song.videoDetails.title}** has been added to the queue (currently ${serverQueue.songs.length - 1} in line)`);
    }
  }

  if (command === '!jukeskip') {
    jukeFunctions.skip(message, serverQueue)
  }

  if (command === '!jukestop') {
    jukeFunctions.stop(message, serverQueue)
  }

  if (command === '!jukepause') {
    jukeFunctions.pause(message, serverQueue)
  }

  if (command === '!jukeresume') {
    jukeFunctions.resume(message, serverQueue)
  }

  if (command === '!jukecommands') {
    jukeFunctions.commands(message, serverQueue)
  }

  if (command === '!jukesong') {
    jukeFunctions.songInfo(serverQueue)
  }
});
