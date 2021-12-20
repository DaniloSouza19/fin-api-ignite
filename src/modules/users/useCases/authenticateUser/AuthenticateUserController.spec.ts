import { decode } from 'jsonwebtoken';
import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import { createConnection } from '../../../../database';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let connection: Connection;

describe('Authenticate a user', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to authenticate a User', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '1234'
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'johndoe@example.com',
      password: '1234'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('Should not be able to authenticate a User with a wrong-password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'johndoe@example.com',
      password: 'wrong-password'
    });

    const incorrectEmailOrPasswordError = new IncorrectEmailOrPasswordError();

    expect(response.statusCode).toBe(incorrectEmailOrPasswordError.statusCode);
    expect(response.body.message).toEqual(incorrectEmailOrPasswordError.message);
  });

  it('Should not be able to authenticate a User from a non-existent user email', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
        email: 'non-existing-user@example.com',
        password: '1234'
    });

    const incorrectEmailOrPasswordError = new IncorrectEmailOrPasswordError();

    expect(response.statusCode).toBe(incorrectEmailOrPasswordError.statusCode);
    expect(response.body.message).toEqual(incorrectEmailOrPasswordError.message);
  });
})
