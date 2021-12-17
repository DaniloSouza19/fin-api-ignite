import "reflect-metadata";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('Get a Statement operation', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      inMemoryStatementsRepository,
      );
  });

  it('Should be able to get a Statement operation', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: 'some-password'
    });

    const statement = await inMemoryStatementsRepository.create({
      amount: 1100,
      description: 'A some DEPOSIT',
      type: OperationType.DEPOSIT,
      user_id: user.id as string
    });

    const statementFetched = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: user.id as string
    });

    expect(statementFetched).toHaveProperty('id');
    expect(statementFetched).toEqual(statement);
  });



  it('Should not be able to get a Statement operation from a non-existing statement', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: 'some-password'
    });

    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: 'non-existing-statement',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });
});
