import { DefaultCrudRepository, HasManyRepository, HasManyRepositoryFactory, repository } from '@loopback/repository';
import { Token, TokenRelations, User } from '../models';
import { RefreshTokensDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class RefreshTokensRepository extends DefaultCrudRepository<
  Token,
  typeof Token.prototype.id,
  TokenRelations
  > {
  constructor(
    @inject('datasources.RefreshTokens') dataSource: RefreshTokensDataSource,
  ) {
    super(Token, dataSource);
  }
}
