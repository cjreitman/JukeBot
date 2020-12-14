
const ytdl = require('ytdl-core');

const play = (guild, song, songTitle, queue) => {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection.play(ytdl.downloadFromInfo(song, { filter: 'audioonly' })).on("finish", () => {
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0], songTitle, queue);
  });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`**${songTitle}** is now playing`);
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

module.exports = { play, skip, stop, pause, resume }