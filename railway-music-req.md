# Requisitos Railway para música/voz (JS)

Este documento resume lo que necesita el proyecto JS para poder entrar a voz y reproducir audio.

## 1) Paquetes del sistema
Para que `@discordjs/voice` + `ffmpeg` funcionen en contenedores (Railway/Nixpacks), requiere:
- `ffmpeg`
- `libopus`
- `libogg`

Para obtener audio desde URLs (YouTube, etc.) con `yt-dlp`:
- `yt-dlp`

Y para HTTPS:
- `ca-certificates`

## 2) Variables de entorno
- `DISCORD_TOKEN`
- `GROQ_API_KEY` (si usas #ia/#habla)

## 3) Nota importante
En el estado actual del repo JS, el bot **sí arranca**, pero los comandos de música/voz eran placeholders.
Para “entrar a voz” es necesario implementar `joinVoiceChannel()` y reproducción con `createAudioResource()`.

(Este punto requiere cambios en código, no solo en requisitos.)

