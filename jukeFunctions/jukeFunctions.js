
const ytdl = require('ytdl-core');

const play = (guild, song, queue) => {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection.play(ytdl.downloadFromInfo(song, { filter: 'audioonly' })).on("finish", () => {
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0], queue);
  });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

const skip = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You gotta be in a voice channel to skip the song, dude"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

const stop = (message, serverQueue) => {
  if (!message.member.voice.channel) {
    return message.channel.send(
      "You gotta be in a voice channel to stop the song, bro"
    );
  }
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

const pause = (message, serverQueue) => {
  if (!message.member.voice.channel) {
    return message.channel.send(
      "You gotta be in a voice channel to skip the song, pal"
    );
  }
  serverQueue.connection.dispatcher.pause();
}

const resume = (message, serverQueue) => {
  if (!message.member.voice.channel) {
    return message.channel.send(
      "You gotta be in a voice channel to skip the song, fella"
    );
  }
  serverQueue.connection.dispatcher.resume();
}

const commands = (message, serverQueue) => {
  return message.channel.send(
    'Welcome to JukeBot, bitches. \n To add a song to the queue, type: !juke {Youtube URL} \n Other commands include: \n !jukeskip: skip to the next song in the queue \n !jukestop: delete the queue and disconnect JukeBot \n !jukepause: pause JukeBot \n !jukeresume: resume JukeBot \n !jukesong: displays song info \n JukeBox\'s volume can be adjusted by right-clicking on JukeBot \n (The adjustment will only effect output for you; others will still hear JukeBot)'  
  )
}

const songInfo = (serverQueue) => {
  return serverQueue.textChannel.send(`**${serverQueue.songs[0].videoDetails.title}** is currently playing, and it's ${serverQueue.songs[0].videoDetails.lengthSeconds} seconds long`);
}

module.exports = { play, skip, stop, pause, resume, commands, songInfo }