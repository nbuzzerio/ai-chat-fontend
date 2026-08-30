# Ollama Chat MVP

A minimal, frontend-only chat interface built with Vite, React, and TypeScript. It sends the current in-memory conversation directly from the browser to a locally running Ollama instance. There is no backend, database, authentication, or persistent storage.

## Prerequisites

- Node.js and npm
- [Ollama](https://ollama.com/) installed and running locally
- A downloaded Ollama model

Check your installed models with:

```sh
ollama list
```

The app uses `llama3.2` by default. Change the clearly labeled `OLLAMA_MODEL` constant near the top of `src/App.tsx` if you want to use another installed model.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

The frontend expects Ollama at `http://localhost:11434` and sends chat requests to `/api/chat`. If Ollama rejects requests from the Vite origin, you may need to configure Ollama's allowed browser origins/CORS settings and restart Ollama.

## Production build

```sh
npm run build
```
