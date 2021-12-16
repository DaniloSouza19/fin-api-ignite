import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe('Show the user profile', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it('Should be able to create a new User', async () => {
    const user = await usersRepositoryInMemory.create({
      email: 'johndoe@example.com',
      name: 'John Doe',
      password: 'some-password'
    });

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toEqual(user);
  });
});
