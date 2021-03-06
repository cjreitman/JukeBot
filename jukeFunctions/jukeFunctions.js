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
  serverQueue.connection.dispatcher.end();
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

const commands = (message) => message.channel.send(
  'Welcome to JukeBot, bitches. \n To add a song to the queue, type: !juke {Youtube URL} \n Other commands include: \n !jukeskip: skip to the next song in the queue \n !jukestop: delete the queue and disconnect JukeBot \n !jukesong: displays song info \n !jukequeue: displays the list of queued songs \n JukeBot\'s volume can be adjusted by right-clicking on JukeBot \n (The adjustment will only effect volume for you) \n !jukereset will do a soft reset of the bot in case it starts misbehaving \n !jukebreak is a hard reset if the bot is *really* misbehaving \n If you find any errors or something doesn\'t work as expected, let Colin know',
);

const songInfo = (serverQueue) => {
  serverQueue.textChannel.send(`**${serverQueue.songs[0].videoDetails.title}** is currently playing, and it's ${serverQueue.songs[0].videoDetails.lengthSeconds} seconds long`)
};

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
  play, skip, stop, commands, songInfo, queue,
};
