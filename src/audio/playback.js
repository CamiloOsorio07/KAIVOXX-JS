const { createAudioResource } = require('@discordjs/voice');

/**
 * resourceFactory: () => Promise<{stream: Readable, metadata?: any}> o { stream }
 *
 * Para integrarlo con yt-dlp/ffmpeg necesitaremos un wrapper que devuelva un stream válido.
 * Aquí solo se ocupa de poner el resource en el player.
 */

async function playFromStream({ player, stream, inputType = 'ogg/opus' }) {
  const resource = createAudioResource(stream, {
    inputType
  });

  player.play(resource);
  return resource;
}

module.exports = {
  playFromStream
};

