// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultCrudRepository,
  juggler,
  HasManyRepositoryFactory,
  repository,
} from "@loopback/repository";
import { User, Token } from "../models";
import { inject } from "@loopback/core";
import { RefreshTokensRepository } from "./refresh-token.repository";

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
  public refreshTokens: HasManyRepositoryFactory<
    Token,
    typeof User.prototype.id
  >;

  constructor(
    @inject("datasources.mongo") protected datasource: juggler.DataSource,
    @repository(RefreshTokensRepository)
    protected refreshTokensRepository: RefreshTokensRepository,
  ) {
    super(User, datasource);

    this.refreshTokens = this.createHasManyRepositoryFactoryFor(
      "refreshTokens",
      async () => refreshTokensRepository
    );
  }
}
