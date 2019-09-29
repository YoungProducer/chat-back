import {Entity, model, property, belongsTo} from "@loopback/repository";
import {User} from "./user.model";

@model({settings: {}})
export class BlockedToken extends Entity {
  @property({
    type: "number",
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => User)
  userId: number;

  @property({
    type: "string",
    required: true,
  })
  token: string;

  constructor(data?: Partial<BlockedToken>) {
    super(data);
  }
}

export interface BlockedTokenRelations {
  // describe navigational properties here
}

export type BlockedTokenWithRelations = BlockedToken & BlockedTokenRelations;
