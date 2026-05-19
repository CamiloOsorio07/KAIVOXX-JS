const { spawn, spawnSync } = require('child_process');

function isYtDlpAvailable() {
  const res = spawnSync('yt-dlp', ['--version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return res.status === 0;
}

function createAudioStreamFromQuery(query, { cookiesFile = null } = {}) {
  if (!isYtDlpAvailable()) {
    const err = new Error(
      'yt-dlp no está disponible en el contenedor (no está en PATH). Asegura que Railway instale yt-dlp.'
    );
    err.code = 'YT_DLP_NOT_FOUND';
    throw err;
  }

  const args = [
    '--no-playlist',
    '--quiet',
    '--no-warnings',
    '-f', 'bestaudio',
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

  return { process: cmd, stream: cmd.stdout, stderr: cmd.stderr };
}

module.exports = {
  createAudioStreamFromQuery
};


