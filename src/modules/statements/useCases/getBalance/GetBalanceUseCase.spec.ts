import "reflect-metadata";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";

let getBalanceUseCase: GetBalanceUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('Get a balance', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      usersRepositoryInMemory
    );
  });

  it('Should be able to get a balance', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: 'some-password'
    });

    const statement1 = await inMemoryStatementsRepository.create({
      amount: 1100,
      description: 'A some DEPOSIT',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    });

    const statement2 = await inMemoryStatementsRepository.create({
      amount: 100,
      description: 'A some WITHDRAW',
      type: OperationType.WITHDRAW,
      user_id: user.id as string
    });

    const balanceFetched = await getBalanceUseCase.execute({
      user_id: user.id as string
    });

    expect(balanceFetched).toHaveProperty('balance');
    expect(balanceFetched.balance).toEqual(1000);
    expect(balanceFetched.statement).toEqual(
      expect.arrayContaining([statement1,statement2]
    ))
  });

  it('Should not be able to get a balance from a non-existing user', async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'non-existing-user'
      });
    }).rejects.toBeInstanceOf(GetBalanceError)
  });
});
