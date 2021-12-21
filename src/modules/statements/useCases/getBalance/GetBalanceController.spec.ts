import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import { createConnection } from '../../../../database';

let connection: Connection;
let token: string;
const PREFIX_URL = '/api/v1'

describe('Get a Statement', () => {
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

  it('Should be able to get a statement', async () => {
    await request(app).post(`${PREFIX_URL}/statements/deposit`)
      .send({
        amount: 100,
        description: 'A some deposit'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

     await request(app).post(`${PREFIX_URL}/statements/withdraw`)
      .send({
        amount: 50,
        description: 'A some withdraw'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get(`${PREFIX_URL}/statements/balance`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty('balance');
    expect(response.body.balance).toEqual(50);
  });
})
