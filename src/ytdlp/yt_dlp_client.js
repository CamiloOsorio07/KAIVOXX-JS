const { spawn } = require('child_process');

function buildYtDlpArgs(query) {
  // Salida como opus en contenedor ogg.
  // Esto suele ser lo más compatible con @discordjs/voice.
  // Nota: `--no-playlist` limita a una sola canción.
  return [
    '--no-playlist',
    '--quiet',
    '--no-warnings',
    '-f', 'bestaudio[ext=webm]/bestaudio/best',
    '--extract-audio',
    '--audio-format', 'opus',
    '--audio-quality', '5',
    '--print', 'filename',
    '-o', '-',
    query
  ];
}

/**
 * Devuelve un stream stdout listo para alimentar a ffmpeg/discord.
 *
 * Si railway no tiene yt-dlp disponible, el spawn fallará.
 */
function createAudioStreamFromQuery(query, { cookiesFile = null } = {}) {
  const args = [
    '--no-playlist',
    '--quiet',
    '--no-warnings',
    '-f', 'bestaudio',
    // Descargar/pipear a stdout en opus/ogg:
    '--extract-audio',
    '--audio-format', 'opus',
    '--audio-quality', '5'
  ];

  if (cookiesFile) {
    args.push('--cookies', cookiesFile);
  }

  // stdout
  args.push('-o', '-', query);

  const cmd = spawn('yt-dlp', args, {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // yt-dlp en modo stdout puede enviar la información a stdout/err.
  // Usamos stdout como stream. Si falla, stderr lo mostramos arriba.
  cmd.on('error', () => {});

  return { process: cmd, stream: cmd.stdout, stderr: cmd.stderr };
}

module.exports = {
  createAudioStreamFromQuery
};

