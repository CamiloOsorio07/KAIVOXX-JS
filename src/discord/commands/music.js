const { musicCommandsVoice } = require('./music_voice');

// Mantengo el archivo como “shim” para no tocar el registry ni el resto del bot.
module.exports = { musicCommands: musicCommandsVoice };

