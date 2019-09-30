import { Entity, model, property, belongsTo } from '@loopback/repository';
import { User } from "./"

@model({ settings: { strict: false } })
export class Token extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  // @property({
  //   type: 'number',
  //   required: true,
  // })
  // userId: number;

  @belongsTo(() => User)
  userId: number

  @property({
    type: 'string',
    required: true,
  })
  token: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // [prop: string]: any;

  constructor(data?: Partial<Token>) {
    super(data);
  }
}

export interface TokenRelations {
  // describe navigational properties here
}

export type TokenWithRelations = Token & TokenRelations;
