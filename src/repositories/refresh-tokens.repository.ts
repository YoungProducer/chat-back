import {DefaultCrudRepository, juggler} from "@loopback/repository";
import {Token, TokenRelations} from "../models";
import {RefreshTokensDataSource} from "../datasources";
import {inject} from "@loopback/core";

export class RefreshTokensRepository extends DefaultCrudRepository<
  Token,
  typeof Token.prototype.id
  // TokenRelations
> {
  constructor(
    @inject("datasources.RefreshTokens") dataSource: RefreshTokensDataSource,
  ) {
    super(Token, dataSource);
  }
}
