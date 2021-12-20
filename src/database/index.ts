import {
  Connection,
  createConnection as createConnectionTypeOrm,
  getConnectionOptions
} from 'typeorm';

async function createConnection(): Promise<Connection> {
  const options = await getConnectionOptions();

  const newOptions = Object.assign(options, {
    database: process.env.NODE_ENV === 'test'
    ? process.env.DATABASE_TEST : options.database
  });

  return createConnectionTypeOrm(newOptions);
}

export { createConnection }
