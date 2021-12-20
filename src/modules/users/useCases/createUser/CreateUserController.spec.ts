import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import { createConnection } from '../../../../database';
import { CreateUserError } from './CreateUserError';

let connection: Connection;

describe('Create a user', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create a new User', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '1234'
    });

    expect(response.statusCode).toBe(201);
  });

  it('Should not be able to create a new User with already exist email', async () => {
    const response = await request(app).post('/api/v1/users').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '1234'
      });

    const createUserError = new CreateUserError();

    expect(response.statusCode).toBe(createUserError.statusCode);
    expect(response.body.message).toEqual(createUserError.message);
  });
})
