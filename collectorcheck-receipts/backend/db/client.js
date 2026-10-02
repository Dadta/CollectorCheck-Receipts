import { createDb } from './init.js';

let dbInstance = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await createDb();
  }
  return dbInstance;
}