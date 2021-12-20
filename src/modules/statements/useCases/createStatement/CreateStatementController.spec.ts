import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import { createConnection } from '../../../../database';
import { CreateStatementError } from './CreateStatementError';

let connection: Connection;
let token: string;

describe('Create a Statement', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '1234'
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'johndoe@example.com',
      password: '1234'
    });

    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create a deposit statement', async () => {
    const response = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'A some deposit'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.type).toEqual('deposit');
    expect(response.body.amount).toEqual(100);
  });

  it('Should be able to create a withdraw statement', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 50,
        description: 'A some withdraw'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.type).toEqual('withdraw');
    expect(response.body.amount).toEqual(50);
  });

  it('Should be able to create a statement from a non-existing user or invalid token', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 50,
        description: 'A some withdraw'
      })
      .set({
        Authorization: `Bearer wrong-token`,
      });

    expect(response.statusCode).toBe(401);
  });

  it(`Should not be able to create a new withdraw if you don't have enough funds`, async () => {
    const response = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 2000,
        description: 'A non permitted withdraw'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const createStatementError = new CreateStatementError.InsufficientFunds();

    expect(response.statusCode).toBe(createStatementError.statusCode);
    expect(response.body.message).toBe(createStatementError.message);
  });
})
