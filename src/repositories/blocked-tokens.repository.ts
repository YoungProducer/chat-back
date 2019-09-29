import {DefaultCrudRepository} from "@loopback/repository";
import {Token, TokenRelations} from "../models";
import {BlockedTokensDataSource} from "../datasources";
import {inject} from "@loopback/core";

export class BlockedTokensRepository extends DefaultCrudRepository<
  Token,
  typeof Token.prototype.id,
  TokenRelations
> {
  constructor(
    @inject("datasources.BlockedTokens") dataSource: BlockedTokensDataSource,
  ) {
    super(Token, dataSource);
  }
}
