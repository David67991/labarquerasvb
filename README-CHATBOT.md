# Chatbot Inteligente (Modo Gratuito + IA Opcional)

Este proyecto usa un backend inteligente para el chatbot:

- Matematicas y fecha/hora con logica local.
- Preguntas del colegio con contexto de la web local (RAG).
- Preguntas generales con fuentes gratuitas.
- Clima/pronostico (ejemplo: "manana llovera?") con Open-Meteo gratis.
- OpenAI es opcional.

## 1) Configuracion

1. Copia `.env.example` a `.env`.
2. Si no tienes saldo, usa modo gratuito:

```env
USE_OPENAI=false
```

3. Si quieres activar OpenAI, usa:

```env
USE_OPENAI=true
OPENAI_API_KEY=tu_api_key
OPENAI_MODEL=gpt-4.1-mini
```

## 2) Ejecutar

```powershell
npm start
```

o:

```powershell
node chatbot-server.js
```

Luego abre:

- `http://localhost:3011` (o el puerto que tengas en `.env`).

Importante: abre desde `localhost` y no desde `file://`.

## 3) Reindexar contenido (opcional)

Si editas muchas paginas HTML y quieres recargar contexto sin reiniciar:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3011/api/reindex"
```

## 4) Dependencias

No se agregaron paquetes npm. Solo necesitas Node.js 18+.
