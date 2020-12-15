require('dotenv').config();
const request = require(`request`);
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const bot = new Discord.Client();
const validator = require('validator');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");

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
  let voiceChannel;
  if (message.member) {
    voiceChannel = message.member.voice.channel;
  }

  if (!args[0] && command === '!juke') {
    return jukeFunctions.commands(message)
  }

  if (command === '!juke' && args[0]) {

    if (!validator.isURL(args[0])) {
      return message.channel.send(
        'It doesn\'t look like that\'s a valid URL.  You suck at copying URLs'
      );
    }

    let song;
    try {
      song = await ytdl.getInfo(args[0]);
     } catch (e) {
      return message.channel.send(
        `I tried to grab the audio, but I got an error back: ${e}`
      );
     }

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
        return message.channel.send(
          'Hold your horses, partner.  Gimme a sec to boot up'
        );
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`**${song.videoDetails.title}** has been added to the queue (currently ${serverQueue.songs.length - 1} in line)`);
    }
  }

  if (!serverQueue && !args[0]) {
    return message.channel.send(
      `No songs are playing.  How am I supposed to ${command} nothing`
    );
  }

  if (serverQueue) {
    if (command === '!jukeskip') {
      try {
        return jukeFunctions.skip(message, serverQueue)
      } catch (err) {
        console.log(err)
      }
    }
  
    if (command === '!jukestop') {
      try {
        return jukeFunctions.stop(message, serverQueue)
      } catch (err) {
        console.log(err)
      }
    }
  
    if (command === '!jukepause') {
      try {
        return jukeFunctions.pause(message, serverQueue)
      } catch (err) {
        console.log(err)
      }
    }
  
    if (command === '!jukeresume') {
      try {
        return jukeFunctions.resume(message, serverQueue)
      } catch (err) {
        console.log(err)
      }
    }
  
    if (command === '!jukesong') {
      try {
        return jukeFunctions.songInfo(serverQueue)
      } catch (err) {
        console.log(err)
      }
    }
  
    if (command === '!jukequeue') {
      try {
        return jukeFunctions.queue(serverQueue, message)
      } catch (err) {
        console.log(err)
      }
    }
  }

  // if (command === '!jukesave') {
  //   try {
  //     if (serverQueue) {
        // const mp3 = './audio.mp3'
        // const proc = new ffmpeg(dl);
        // proc.setFfmpegPath('/usr/local/bin/ffmpeg');
        // return ytdl.downloadFromInfo(serverQueue.songs[0], { format: 'mp3', filter: 'audioonly' })
        // const download = (url) => {
        //   // return request.get(url).pipe(fs.createWriteStream('meme.png'));
        //   return ytdl(url, {filter: 'audioonly', format: 'mp3'}).pipe(fs.createWriteStream('audio.mp3')).on('end', () => {
        //     message.sendFile('./audio.mp3');
        // });
        // }

        // download(serverQueue.songs[0].videoDetails.video_url);

        // return ytdl.downloadFromInfo(serverQueue.songs[0], { filter: 'audioonly' }).pipe(fs.createWriteStream('song.mp3'));
        // const mp3 = ytdl(dl, {format: 'mp3'})
        // window.open(mp3, '_blank');
        // const YD = new YoutubeMp3Downloader({
        //   "ffmpegPath": '/usr/local/bin/ffmpeg',   // FFmpeg binary location  // Output file location (default: the home directory)
        //   "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
        //   "queueParallelism": 2,                  // Download parallelism (default: 1)
        //   "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)                  // Enable download from WebM sources (default: false)
        // });
        // YD.download(serverQueue.songs[0].videoDetails.videoId, serverQueue.songs[0].videoDetails.videoId + '.mp3');
      // }
    // } catch (err) {
    //   console.log(err)
    // }
  // }
});
