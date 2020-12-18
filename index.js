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

  const isJuke = command.substring(0, 5)

  if (isJuke === '!juke') {
    const serverQueue = queue.get(message.guild.id);
    let voiceChannel;
    if (message.member) {
      voiceChannel = message.member.voice.channel;
    }

    if (command === '!jukecommands') {
      try {
        jukeFunctions.commands(message)
      } catch (err) {
        console.log(err)
      }
    }
  
    if (command === '!jukezack') {
      return message.channel.send(`Get juked, Zack.  Colin is the master`);
    }
  
    if (command === '!jukecolin') {
      return message.channel.send(`Colin is a jukebaby fuckboi lol`);
    }
  
    if (command === '!jukeshawn') {
      return message.channel.send(`**-FART SOUND-**`);
    }
  
    if (command === '!jukenick') {
      return message.channel.send(`#CelebratedPooper`);
    }

    if (args[0]) {
      if (command === '!juke') {
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
              'Yeah, something broke.  I dunno.  Ask Colin to restart me if it keeps happening'
            );
          }
        } else {
          serverQueue.songs.push(song);
          return message.channel.send(`**${song.videoDetails.title}** has been added to the queue (currently ${serverQueue.songs.length - 1} in line)`);
        }
      }
    } else if (!args[0]) {
      if (serverQueue && serverQueue.connection) {
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
            jukeFunctions.queue(serverQueue, message)
          } catch (err) {
            console.log(err)
          }
        }
      } else if (!serverQueue) {
        console.log(command)
        if (command !== '!jukecommands') {
          return message.channel.send(
            `I can't ${command} right now.  If it's a song-specific command, make sure a song is playing.`
          );
        }
      }
    }
  }
});
