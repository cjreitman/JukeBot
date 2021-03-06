require('dotenv').config();
const ytdl = require('ytdl-core');
const Discord = require('discord.js');

const bot = new Discord.Client();
const validator = require('validator');
const search = require('yt-search');
const cluster = require('cluster');

const jukeFunctions = require('./jukeFunctions/jukeFunctions');

const { TOKEN } = process.env;

if (cluster.isMaster) {
  cluster.fork();

  cluster.on('exit', () => {
    cluster.fork();
  });
}

if (cluster.isWorker) {
  bot.login(TOKEN);

  bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
  });

  let queue = new Map();

  bot.on('message', async (message) => {
    const args = message.content.split(/ +/);
    const command = args.shift().toLowerCase();

    const isJuke = command.substring(0, 5);

    if (isJuke === '!juke') {
      const serverQueue = queue.get(message.guild.id);
      let voiceChannel;
      if (message.member.voice.channel) {
        voiceChannel = message.member.voice.channel;
      } else {
        const defaultChannel = message.guild.channels.cache.find(
          (channel) => channel.name === 'Phantasy Star Online' || channel.name === 'Monstrotown',
        );
        if (defaultChannel) {
          voiceChannel = defaultChannel;
        }
      }

      if (command === '!jukereset') {
        if (!message.member.voice.channel) {
          return message.channel.send(
            'You gotta be in a voice channel to stop the song, bro',
          );
        }
        queue = new Map();
        voiceChannel = undefined;
        bot.off();
      }

      if (command === '!jukebreak') {
        const nul2 = null;
        nul2.length();
      }

      if (!voiceChannel) {
        return message.channel.send('You gotta be in a voice channel.  Otherwise the bot breaks lol');
      }

      if (command === '!jukecommands') {
        try {
          jukeFunctions.commands(message);
        } catch (err) {
          console.log(err);
        }
      }

      if (command === '!jukezack') {
        return message.channel.send('Get juked, Zack.  Colin is the master');
      }

      if (command === '!jukecolin') {
        return message.channel.send('Colin is a jukebaby fuckboi lol');
      }

      if (command === '!jukeshawn') {
        return message.channel.send('**-FART SOUND-**');
      }

      if (args[0]) {
        if (command === '!juke') {
          let youtubeUrl;
          if (!validator.isURL(args[0])) {
            const searchString = args.join(' ');
            youtubeUrl = await search(searchString);
            console.log(youtubeUrl);
          } else {
            youtubeUrl = args[0];
          }
          const song = {};
          try {
            if (typeof youtubeUrl === 'string') {
              song.songInfo = await ytdl.getInfo(youtubeUrl);
            } else {
              let finalUrl;
              for (let i = 0; i < youtubeUrl.all.length; i += 1) {
                if (youtubeUrl.all[i].type === 'video') {
                  finalUrl = youtubeUrl.all[i];
                  break;
                }
              }
              song.songInfo = await ytdl.getInfo(finalUrl.url);
            }
          } catch (e) {
            return message.channel.send(
              `I tried to grab the audio, but I got an error: ${e}`,
            );
          }

          const timeStampSplit = args[0].split('t=');
          const timeStamp = timeStampSplit[1];

          if (timeStamp) {
            song.timeStamp = `${timeStamp}s`;
          } else {
            song.timeStamp = '0';
          }

          if (!serverQueue) {
            const queueContruct = {
              textChannel: message.channel,
              voiceChannel,
              connection: null,
              songs: [],
              volume: 5,
              playing: true,
            };

            queue.set(message.guild.id, queueContruct);

            queueContruct.songs.push(song);

            try {
              const connection = await voiceChannel.join();
              queueContruct.connection = connection;
              jukeFunctions.play(message.guild, queueContruct.songs[0], queue);
            } catch (err) {
              return message.channel.send(
                'Yeah, something broke.  I dunno.  Ask Colin to restart me if it keeps happening',
              );
            }
          } else {
            serverQueue.songs.push(song);
            return message.channel.send(`**${song.songInfo.videoDetails.title}** has been added to the queue (currently ${serverQueue.songs.length - 1} in line)`);
          }
        }
      } else if (!args[0]) {
        if (serverQueue && serverQueue.connection) {
          if (command === '!jukeskip') {
            try {
              return jukeFunctions.skip(message, serverQueue);
            } catch (err) {
              console.log(err);
            }
          }

          if (command === '!jukestop') {
            try {
              return jukeFunctions.stop(message, serverQueue);
            } catch (err) {
              console.log(err);
            }
          }

          if (command === '!jukesong') {
            try {
              return jukeFunctions.songInfo(serverQueue);
            } catch (err) {
              console.log(err);
            }
          }

          if (command === '!jukequeue') {
            try {
              jukeFunctions.queue(serverQueue, message);
            } catch (err) {
              console.log(err);
            }
          }
        } else if (!serverQueue) {
          console.log(command);
          if (command !== '!jukecommands') {
            return message.channel.send(
              `I can't ${command} right now.  If it's a song-specific command, make sure a song is playing.`,
            );
          }
        }
      }
    }
  });
}
