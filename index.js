require('dotenv').config();
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

const queue = new Map();

bot.on('message', async message => {

  const play = (guild, song) => {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    const dispatcher = serverQueue.connection.play(ytdl.downloadFromInfo(song, { filter: 'audioonly' })).on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }

  const args = message.content.split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'play') {

    const serverQueue = queue.get(message.guild.id);
    const voiceChannel = message.member.voice.channel

    const song = await ytdl.getInfo(args[0]);
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
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
});
