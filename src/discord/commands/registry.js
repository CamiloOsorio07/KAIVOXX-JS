const { helpCommand } = require('./help');
const { musicCommandsVoice } = require('./music_voice');
const { aiCommands } = require('./ai');

function registerCommands() {
  const map = new Map();

  // help
  map.set('help', helpCommand);
  map.set('ayuda', helpCommand);
  map.set('commands', helpCommand);
  map.set('comandos', helpCommand);

  // music/voice (usa implementación real)
  for (const [k, v] of Object.entries(musicCommandsVoice)) map.set(k, v);

  // ai
  for (const [k, v] of Object.entries(aiCommands)) map.set(k, v);

  return map;
}

module.exports = { registerCommands };


