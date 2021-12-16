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

  it('Should be able to create a new User', async () => {
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
});
