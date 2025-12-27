import http from 'http';
import { createApp } from './app';
import { initSocket } from './socket';

(async () => {
  const app = await createApp();

  const server = http.createServer(app);

  initSocket(server);

  server.listen(8080, () => {
    console.log('Server running on port 8080');
  });
})();
