import { AppDataSource } from 'data-source';
import { User } from 'entities/user-entity';
import { Repository } from 'typeorm';

export default class UserRepository extends Repository<User> {
  constructor() {
    super(User, AppDataSource.createEntityManager());
  }

  //Experimental method
  public async findByEmail(email: string): Promise<User> {
    return await this.findOneBy({
      email: email,
    });
  }

  //Experimental method
  public async findByEmailToken(token: string): Promise<User> {
    return await this.findOneBy({
      emailToken: token,
    });
  }
}
