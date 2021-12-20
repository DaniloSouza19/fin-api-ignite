import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import { createConnection } from '../../../../database';

let connection: Connection;
let token: string;

describe('Show user profile', () => {
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

  it('Should be able to show a User Profile', async () => {
    const response = await request(app).get('/api/v1/profile/')
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toEqual('johndoe@example.com');
  });

  it('Should not be able to show a non-existing User profile', async () => {
    const response = await request(app).get('/api/v1/profile/')
      .set({
        Authorization: 'Bearer invalid-token'
      });

    expect(response.statusCode).toBe(401);
  });
})
