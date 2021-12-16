import "reflect-metadata";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";

let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('Create a Statement', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository()

    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory,
      inMemoryStatementsRepository);
  });

  it('Should be able to create a new Statement', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: 'some-password'
    });

    const statement = await createStatementUseCase.execute({
      amount: 100000,
      description: 'A some statement',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    })

    expect(statement).toHaveProperty('id');
    expect(statement.type).toEqual('deposit');
    expect(statement.amount).toEqual(100000);
    expect(statement.user_id).toEqual(user.id);
  });

  it('Should not be able to create a new Statement from a non-existing user', async () => {

    await expect(async () => {
      await createStatementUseCase.execute({
        amount: 100000,
        description: 'A some statement',
        type: OperationType.DEPOSIT,
        user_id: 'non-existing-user',
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it(`Should not be able to create a new withdraw if you don't have enough funds`, async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: 'some-password'
    });

    await createStatementUseCase.execute({
      amount: 10,
      description: 'A some deposit',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    await expect(async () => {
      await createStatementUseCase.execute({
        amount: 20,
        description: 'A withdraw with insufficient funds',
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
