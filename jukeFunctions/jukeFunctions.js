const ytdl = require('ytdl-core');

const play = (guild, song, queue) => {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.textChannel.send(
      'JukeBot out',
    );
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection.play(ytdl.downloadFromInfo(song.songInfo, { filter: 'audioonly', begin: song.timeStamp })).on('finish', () => {
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0], queue);
  });
  dispatcher.setVolume(1);
  serverQueue.textChannel.send(
    `Now playing **${serverQueue.songs[0].songInfo.videoDetails.title}**`,
  );
};

const skip = (message, serverQueue) => {
  if (!message.member.voice.channel) {
    return message.channel.send(
      'You gotta be in a voice channel to skip the song, dude',
    );
  }
  if (!serverQueue.connection.dispatcher.paused) {
    serverQueue.connection.dispatcher.end();
  } else {
    return message.channel.send(
      'We can\'t skip a song while the bot\'s paused or the bot breaks :(',
    );
  }
};

const stop = (message, serverQueue) => {
  if (!message.member.voice.channel) {
    return message.channel.send(
      'You gotta be in a voice channel to stop the song, bro',
    );
  }
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};

const pause = (message, serverQueue) => {
  if (!message.member.voice.channel) {
    return message.channel.send(
      'You gotta be in a voice channel to pause the song, pal',
    );
  }
  serverQueue.connection.dispatcher.pause();
};

const resume = (message, serverQueue) => {
  if (!message.member.voice.channel) {
    return message.channel.send(
      'You gotta be in a voice channel to resume the song, fella',
    );
  }
  serverQueue.connection.dispatcher.resume();
};

const commands = (message) => message.channel.send(
  'Welcome to JukeBot, bitches. \n To add a song to the queue, type: !juke {Youtube URL} \n Other commands include: \n !jukeskip: skip to the next song in the queue \n !jukestop: delete the queue and disconnect JukeBot \n !jukepause: pause JukeBot \n !jukeresume: resume JukeBot \n !jukesong: displays song info \n !jukequeue: displays the list of queued songs \n JukeBot\'s volume can be adjusted by right-clicking on JukeBot \n (The adjustment will only effect volume for you) \n If you find any errors or something doesn\'t work as expected, let Colin know',
);

const songInfo = (serverQueue) => serverQueue.textChannel.send(`**${serverQueue.songs[0].videoDetails.title}** is currently playing, and it's ${serverQueue.songs[0].videoDetails.lengthSeconds} seconds long`);

const queue = (serverQueue, message) => {
  const songTitleArray = serverQueue.songs.map((song, idx) => `${`${idx + 1}.` + ' '}${song.songInfo.videoDetails.title}`);
  const firstSong = songTitleArray.shift();
  const firstSongM = `${firstSong} (currently playing)`;
  songTitleArray.unshift(firstSongM);
  return message.channel.send(
    songTitleArray,
  );
};

module.exports = {
  play, skip, stop, pause, resume, commands, songInfo, queue,
};
