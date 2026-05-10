import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { GameServer } from './GameServer';

const server = new GameServer();
server.start().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
