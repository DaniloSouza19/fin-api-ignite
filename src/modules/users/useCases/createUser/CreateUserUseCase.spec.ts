import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe('Create a User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('Should be able to create a new User', async () => {
    const user = await createUserUseCase.execute({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: 'some-password'
    });

    expect(user).toHaveProperty('id')
  });

  it('Should not be able to create a new User with an already existing email', async () => {
    await expect(async() => {
      await createUserUseCase.execute({
        email: 'johndoe@example.com',
        name: 'John Doe',
        password: 'some-password'
      });

      await createUserUseCase.execute({
        email: 'johndoe@example.com',
        name: 'John Doe',
        password: 'some-password'
      });
    }).rejects.toBeInstanceOf(CreateUserError)
  });
});
