// import {DefaultCrudRepository} from '@loopback/repository';
// import {User, UserRelations} from '../models';
// import {TokensBlackListDataSource} from '../datasources';
// import {inject} from '@loopback/core';

import {
  DefaultCrudRepository,
  juggler,
  HasManyRepositoryFactory,
  repository,
} from "@loopback/repository";
import {User, Token} from "../models";
import {inject} from "@loopback/core";
import {
  BlockedTokensRepository,
  RefreshTokensRepository,
} from "../repositories";

export type Credentials = {
  email: string;
  password: string;
};

export type CredentialsForPatch = {
  id: number;
  password?: string;
  newPassword?: string;
  email?: string;
  tag?: string;
  firstName?: string;
  lastName?: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  public blockedTokens: HasManyRepositoryFactory<
    Token,
    typeof User.prototype.id
  >;
  public refreshTokens: HasManyRepositoryFactory<
    Token,
    typeof User.prototype.id
  >;

  constructor(
    @inject("datasources.mongo") protected datasource: juggler.DataSource,
    @repository(RefreshTokensRepository)
    protected refreshTokensRepository: RefreshTokensRepository,
    @repository(BlockedTokensRepository)
    protected blockedTokensRepository: BlockedTokensRepository,
  ) {
    super(User, datasource);

    this.refreshTokens = this.createHasManyRepositoryFactoryFor(
      "refresTokens",
      async () => refreshTokensRepository,
    );

    this.blockedTokens = this.createHasManyRepositoryFactoryFor(
      "blockedTokens",
      async () => blockedTokensRepository,
    );
  }
}

// export class UserRepository extends DefaultCrudRepository<
//   User,
//   typeof User.prototype.id,
//   UserRelations
// > {
//   constructor(
//     @inject('datasources.TokensBlackList') dataSource: TokensBlackListDataSource,
//   ) {
//     super(User, dataSource);
//   }
// }
