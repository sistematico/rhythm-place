# Sistema de Rastreamento de Músicas - Rhythm Place

## Arquitetura

### 1. Server-Sent Events (SSE)
O endpoint `/api/song/current/$genre` estabelece uma conexão SSE que notifica o cliente quando uma música muda no stream.

### 2. AudioContext com Gerenciamento de Estado
O contexto gerencia:
- **Estado do Player**: playing, paused, volume, muted
- **Metadados da Música**: title, artist, genre
- **Sincronização**: Detecta mudanças de música via SSE

### 3. Fluxo de Dados

```
Liquidsoap (externo)
    ↓ (troca de música)
SSE Endpoint (/api/song/current/$genre)
    ↓ (emite evento 'track-change')
AudioContext (escuta eventos)
    ↓ (fetch /api/song/$genre)
Atualiza UI (title, artist)
    ↓
Salva no localStorage (histórico)
```

### 4. Histórico de Músicas
Todas as músicas tocadas são salvas em `localStorage` com:
- Metadados completos (id, title, artist, genre)
- Timestamp de quando foi tocada
- Limite de 50 músicas mais recentes

### 5. Benefícios

- ✅ **Sem polling desnecessário**: SSE notifica apenas quando necessário
- ✅ **Músicas únicas**: `lastSongIdRef` evita duplicatas
- ✅ **Histórico persistente**: localStorage mantém registro
- ✅ **Reconexão automática**: SSE reconecta após erros
- ✅ **Limpeza adequada**: Fecha conexões ao pausar/desmontar

## Configuração para Produção

### Integração com Liquidsoap
Para integrar com o Liquidsoap real, você precisa:

1. **Criar um script que monitore mudanças de música no Liquidsoap**
2. **Enviar eventos para o endpoint SSE** quando a música trocar
3. **Alternativa**: Usar webhooks do Liquidsoap para notificar o servidor

Exemplo de configuração Liquidsoap:
```liquidsoap
on_metadata(fun(m) -> 
  # Enviar POST para /api/song/track-change
  http.post("http://localhost:3000/api/song/track-change",
    data=json.stringify(m))
end)
```

## Uso

```tsx
import { useAudio } from "@/context/AudioContext";

function Player() {
  const { title, artist, playing, play, pause } = useAudio();
  
  return (
    <div>
      <h3>{title}</h3>
      <p>{artist}</p>
      <button onClick={playing ? pause : play}>
        {playing ? "Pause" : "Play"}
      </button>
    </div>
  );
}
```

## Acessar Histórico

```javascript
const history = JSON.parse(localStorage.getItem("trackHistory") || "[]");
console.log("Últimas músicas tocadas:", history);
```
