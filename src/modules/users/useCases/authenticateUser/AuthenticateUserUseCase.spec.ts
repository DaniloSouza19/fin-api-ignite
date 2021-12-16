import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { hash } from "bcryptjs";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe('Authenticate a User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  });

  it('Should be able to authenticate a User', async () => {
    const password = await hash('some-password', 8);

    await usersRepositoryInMemory.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password,
    });

    const session = await authenticateUserUseCase.execute({
      email: 'johndoe@example.com',
      password: 'some-password'
    });

    expect(session).toHaveProperty('token')
  });

  it('Should not be able to authenticate a User from a wrong-password', async () => {
    const password = await hash('some-password', 8);

    await usersRepositoryInMemory.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password,
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'johndoe@example.com',
        password: 'wrong-password'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('Should not be able to authenticate a User from a non-existent user email', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'non.created.user@example.com',
        password: 'some-password'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
