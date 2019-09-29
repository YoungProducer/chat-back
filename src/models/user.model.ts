// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property, hasMany} from "@loopback/repository";
import {Token} from "../models";

@model({
  settings: {
    indexes: {
      uniqueEmail: {
        keys: {
          email: 1,
        },
        options: {
          unique: true,
        },
      },
      uniqueTag: {
        keys: {
          tag: 1,
        },
        options: {
          unique: true,
        },
      },
    },
  },
})
export class User extends Entity {
  @property({
    type: "number",
    generated: true,
    id: true,
  })
  id: number;

  @property({
    type: "string",
    required: true,
  })
  email: string;

  @property({
    type: "string",
    required: true,
  })
  password: string;

  @property({
    type: "boolean",
    required: false,
    defaultValue: true,
  })
  emailVerified: boolean;

  @property({
    type: "string",
  })
  tag?: string;

  @property({
    type: "string",
  })
  firstName?: string;

  @property({
    type: "string",
  })
  lastName?: string;

  @hasMany(() => Token)
  refreshTokens: Token[];

  // @hasMany(() => Token)
  // blockedTokens: Token[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}
