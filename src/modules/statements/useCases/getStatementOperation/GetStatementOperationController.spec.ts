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
    const responseCreateStatement = await request(app).post(`${PREFIX_URL}/statements/deposit`)
      .send({
        amount: 100,
        description: 'A some deposit'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id,
          amount,
          description,
          user_id,
          type
      } = responseCreateStatement.body;

    const responseGetStatement = await request(app)
      .get(`${PREFIX_URL}/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseGetStatement.statusCode).toBe(200);
    expect(Number(responseGetStatement.body.amount)).toEqual(Number(amount));
    expect(responseGetStatement.body.type).toEqual(type);
    expect(responseGetStatement.body.user_id).toEqual(user_id);
    expect(responseGetStatement.body.description).toEqual(description);
  });
})
