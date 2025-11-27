import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/song/current/$genre')({
  server: {
    handlers: {
      GET: async (ctx) => {
        const { genre } = ctx.params;
        
        // Configurar SSE
        const headers = new Headers({
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        const stream = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            
            // Enviar evento inicial
            const sendEvent = (data: any) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            // Simular mudança de música a cada 3 minutos (180000ms)
            // Em produção, isso deveria vir do Liquidsoap
            const interval = setInterval(async () => {
              try {
                // Aqui você faria o fetch da música atual do banco
                // Por enquanto, vamos enviar um evento para o cliente buscar
                sendEvent({ type: 'track-change', genre, timestamp: Date.now() });
              } catch (error) {
                console.error('Erro ao enviar evento:', error);
              }
            }, 180000); // 3 minutos

            // Cleanup
            ctx.request.signal.addEventListener('abort', () => {
              clearInterval(interval);
              controller.close();
            });
          },
        });

        return new Response(stream, { headers });
      },
    },
  },
});
