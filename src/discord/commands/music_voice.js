const { BOT_PREFIX } = require('../../config');
const { embedInfo, embedSuccess, embedWarning, embedError, embedMusic } = require('../views/embeds');
const { ensureVoiceConnection, getPlayer, clearGuild } = require('../../audio/voice_manager');
const { playFromStream } = require('../../audio/playback');
const { createAudioStreamFromQuery } = require('../../ytdlp/yt_dlp_client');
const { ensureQueueForGuild, musicQueues } = require('../../state/queues');

async function cmdJoin(message) {
  const memberVoice = message.member?.voice;
  if (!memberVoice?.channel) {
    await message.channel.send({ embeds: [embedWarning('No estás en un canal', 'Debes unirte primero a un canal de voz.')] });
    return;
  }

  if (!message.guild.members.me) {
    // a veces tarda en cachear
    await message.guild.members.fetch(message.client.user.id).catch(() => {});
  }

  const adapterCreator = message.guild.voiceAdapterCreator;
  if (!adapterCreator) {
    await message.channel.send({ embeds: [embedError('No puedo conectar', 'Falta voiceAdapterCreator en la guild.')] });
    return;
  }

  await ensureVoiceConnection({
    guild: message.guild,
    channel: memberVoice.channel,
    adapterCreator
  });

  await message.channel.send({ embeds: [embedSuccess('Conectada al canal', `Me uní a **${memberVoice.channel.name}** 🎧`)] });
}

async function cmdLeave(message) {
  clearGuild(message.guild.id);
  const q = musicQueues.get(message.guild.id);
  if (q) q.clear();
  await message.channel.send({ embeds: [embedSuccess('Desconectada', 'Me desconecté del canal y limpié la cola 🧹')] });
}

async function cmdPlay(message, search) {
  if (!message.member?.voice?.channel) {
    await message.channel.send({ embeds: [embedWarning('No estás en un canal de voz', 'Debes unirte a un canal de voz antes de usar #play.')] });
    return;
  }
  if (!search) {
    await message.channel.send({ embeds: [embedWarning('Falta el nombre', 'Debes escribir el nombre de la canción o el link.')] });
    return;
  }

  await message.channel.send({ embeds: [embedInfo('Buscando en YouTube…', `🔍 **${search}**`)] });

  // asegura conexión
  const adapterCreator = message.guild.voiceAdapterCreator;
  await ensureVoiceConnection({
    guild: message.guild,
    channel: message.member.voice.channel,
    adapterCreator
  });

  // cola (mínima)
  const queue = await ensureQueueForGuild(message.guild.id);
  queue.enqueue({
    url: search,
    title: search,
    requester_name: message.author.username,
    channel: message.channel
  });

  const player = getPlayer(message.guild.id);
  if (!player) {
    await message.channel.send({ embeds: [embedError('No hay player', 'No se pudo inicializar el reproductor de audio.')] });
    return;
  }

  // crea stream desde yt-dlp
  let yt;
  try {
    yt = createAudioStreamFromQuery(search);
  } catch (e) {
    await message.channel.send({ embeds: [embedError('yt-dlp falló', 'Revisa logs: yt-dlp no está instalado o no está en PATH.')] });
    return;
  }

  // Log del stderr de yt-dlp para diagnosticar por qué no suena.
  // (Railway a veces oculta el error del encoder si no hay salida.)
  try {
    let stderrBuf = '';
    yt.stderr?.on('data', (d) => {
      stderrBuf += d.toString('utf8');
      // Evita spamear demasiado
      if (stderrBuf.length > 4000) stderrBuf = stderrBuf.slice(-4000);
    });
  } catch {}

  // inputType: opus
  try {
    await playFromStream({ player, stream: yt.stream, inputType: 'opus' });
  } catch (e) {
    await message.channel.send({ embeds: [embedError('Error reproduciendo', String(e?.message || e))] });
    return;
  }


  await message.channel.send({ embeds: [embedMusic('Reproducción en curso', `🎧 Reproduciendo: **${search}**`)] });
}

async function cmdSkip(message) {
  const player = getPlayer(message.guild.id);
  if (player) {
    player.stop(true);
  }
  await message.channel.send({ embeds: [embedInfo('Saltado', '⏭ Se saltó (stop actual). Implementación de cola pendiente en este paso).')] });
}

async function cmdStop(message) {
  clearGuild(message.guild.id);
  const q = musicQueues.get(message.guild.id);
  if (q) q.clear();
  await message.channel.send({ embeds: [embedError('Reproducción detenida', '🛑 Cola eliminada y música detenida.')] });
}

async function cmdQueue(message) {
  const queue = musicQueues.get(message.guild.id);
  if (!queue || queue.length === 0) {
    await message.channel.send({ embeds: [embedInfo('Cola vacía', 'No hay canciones en la cola 🎵')] });
    return;
  }
  await message.channel.send({ embeds: [embedInfo('Cola', queue.listTitles().slice(0, 20).join('\n') || '(vacía)')] });
}

async function cmdNow(message) {
  await message.channel.send({ embeds: [embedInfo('Now', 'Reproduciendo (pendiente de trackear “actual”).')] });
}

const musicCommandsVoice = {
  join: { execute: cmdJoin },
  j: { execute: cmdJoin },
  leave: { execute: cmdLeave },
  l: { execute: cmdLeave },
  play: { execute: cmdPlay },
  p: { execute: cmdPlay },
  skip: { execute: cmdSkip },
  sk: { execute: cmdSkip },
  stop: { execute: cmdStop },
  s: { execute: cmdStop },
  queue: { execute: cmdQueue },
  q: { execute: cmdQueue },
  now: { execute: cmdNow },
  np: { execute: cmdNow }
};

module.exports = { musicCommandsVoice };

