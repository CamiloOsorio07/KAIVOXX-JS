const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, getVoiceConnection } = require('@discordjs/voice');

// Por ahora, esta capa solo gestiona conexiones por guild y creación del player.
// La reproducción real se implementa con createAudioResource desde un stream/ffmpeg en playback.

const guildState = new Map();

function getOrInitState(guildId) {
  if (!guildState.has(guildId)) {
    guildState.set(guildId, {
      connection: null,
      player: null
    });
  }
  return guildState.get(guildId);
}

async function ensureVoiceConnection({ guild, channel, adapterCreator }) {
  const state = getOrInitState(guild.id);

  // si ya existe conexión activa, reutilizamos
  const existing = getVoiceConnection(guild.id);
  if (existing && existing.joinConfig.channelId === channel.id) {
    state.connection = existing;
    return existing;
  }

  const connection = joinVoiceChannel({
    guildId: guild.id,
    channelId: channel.id,
    adapterCreator,
    selfDeaf: false,
    selfMute: false
  });

  state.connection = connection;

  if (!state.player) {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play
      }
    });
    state.player = player;

    connection.subscribe(player);
  }

  return connection;
}

function getPlayer(guildId) {
  const state = getOrInitState(guildId);
  return state.player;
}

function clearGuild(guildId) {
  const state = getOrInitState(guildId);
  if (state.player) {
    try {
      state.player.stop(true);
    } catch {}
  }
  const vc = getVoiceConnection(guildId);
  if (vc) {
    try {
      vc.destroy();
    } catch {}
  }
  guildState.delete(guildId);
}

module.exports = {
  ensureVoiceConnection,
  getPlayer,
  clearGuild
};

