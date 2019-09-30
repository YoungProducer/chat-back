import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './refresh-tokens.datasource.json';

export class RefreshTokensDataSource extends juggler.DataSource {
  static dataSourceName = 'RefreshTokens';

  constructor(
    @inject('datasources.config.RefreshTokens', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
