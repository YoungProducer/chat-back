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
import {User} from "../models";
import {inject} from "@loopback/core";

export type Credentials = {
  email: string;
  password: string;
};

export type CredentialsForChangeId = {
  id: string;
  email: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  constructor(
    @inject("datasources.mongo") protected datasource: juggler.DataSource,
  ) {
    super(User, datasource);
  }
}
