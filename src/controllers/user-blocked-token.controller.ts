// import {
//   Count,
//   CountSchema,
//   Filter,
//   repository,
//   Where,
// } from "@loopback/repository";
// import {
//   post,
//   param,
//   get,
//   getFilterSchemaFor,
//   getModelSchemaRef,
//   getWhereSchemaFor,
//   patch,
//   put,
//   del,
//   requestBody,
//   HttpErrors,
// } from "@loopback/rest";
// import {BlockedToken} from "../models";
// import {BlockedTokenRepository, UserRepository} from "../repositories";

// export class UserBlockedTokenController {
//   constructor(
//     @repository(BlockedTokenRepository)
//     public blockedTokenRepository: BlockedTokenRepository,
//     @repository(UserRepository)
//     protected userRepositiory: UserRepository,
//   ) {}

//   @post("/users/{userId}/blacklist/tokens", {
//     responses: {
//       "200": {
//         description: "User.BlockedToken model instance",
//         content: {
//           "application/json": {
//             schema: {
//               "x-ts-type": BlockedToken,
//             },
//           },
//         },
//       },
//     },
//   })
//   async createBlockedToken(
//     @param.path.number("userId") userId: number,
//     @requestBody() blockedToken: BlockedToken,
//   ): Promise<BlockedToken> {
//     if (userId !== blockedToken.userId) {
//       throw new HttpErrors.BadRequest(
//         `User id does not match: ${userId} !== ${blockedToken.userId}`,
//       );
//     }

//     delete blockedToken.userId;
//     return this.userRepositiory.blockedTokens(userId).create(blockedToken);
//   }

//   @post("/blacklist-token", {
//     responses: {
//       "200": {
//         description: "BlockedToken model instance",
//         content: {
//           "application/json": {schema: getModelSchemaRef(BlockedToken)},
//         },
//       },
//     },
//   })
//   async create(
//     @requestBody({
//       content: {
//         "application/json": {
//           schema: getModelSchemaRef(BlockedToken, {
//             title: "NewBlockedToken",
//             exclude: ["id"],
//           }),
//         },
//       },
//     })
//     blockedToken: Omit<BlockedToken, "id">,
//   ): Promise<BlockedToken> {
//     return this.blockedTokenRepository.create(blockedToken);
//   }

//   @get("/blacklist-token/count", {
//     responses: {
//       "200": {
//         description: "BlockedToken model count",
//         content: {"application/json": {schema: CountSchema}},
//       },
//     },
//   })
//   async count(
//     @param.query.object("where", getWhereSchemaFor(BlockedToken))
//     where?: Where<BlockedToken>,
//   ): Promise<Count> {
//     return this.blockedTokenRepository.count(where);
//   }

//   @get("/blacklist-token", {
//     responses: {
//       "200": {
//         description: "Array of BlockedToken model instances",
//         content: {
//           "application/json": {
//             schema: {type: "array", items: getModelSchemaRef(BlockedToken)},
//           },
//         },
//       },
//     },
//   })
//   async find(
//     @param.query.object("filter", getFilterSchemaFor(BlockedToken))
//     filter?: Filter<BlockedToken>,
//   ): Promise<BlockedToken[]> {
//     return this.blockedTokenRepository.find(filter);
//   }

//   @patch("/blacklist-token", {
//     responses: {
//       "200": {
//         description: "BlockedToken PATCH success count",
//         content: {"application/json": {schema: CountSchema}},
//       },
//     },
//   })
//   async updateAll(
//     @requestBody({
//       content: {
//         "application/json": {
//           schema: getModelSchemaRef(BlockedToken, {partial: true}),
//         },
//       },
//     })
//     blockedToken: BlockedToken,
//     @param.query.object("where", getWhereSchemaFor(BlockedToken))
//     where?: Where<BlockedToken>,
//   ): Promise<Count> {
//     return this.blockedTokenRepository.updateAll(blockedToken, where);
//   }

//   @get("/blacklist-token/{id}", {
//     responses: {
//       "200": {
//         description: "BlockedToken model instance",
//         content: {
//           "application/json": {schema: getModelSchemaRef(BlockedToken)},
//         },
//       },
//     },
//   })
//   async findById(@param.path.number("id") id: number): Promise<BlockedToken> {
//     return this.blockedTokenRepository.findById(id);
//   }

//   @patch("/blacklist-token/{id}", {
//     responses: {
//       "204": {
//         description: "BlockedToken PATCH success",
//       },
//     },
//   })
//   async updateById(
//     @param.path.number("id") id: number,
//     @requestBody({
//       content: {
//         "application/json": {
//           schema: getModelSchemaRef(BlockedToken, {partial: true}),
//         },
//       },
//     })
//     blockedToken: BlockedToken,
//   ): Promise<void> {
//     await this.blockedTokenRepository.updateById(id, blockedToken);
//   }

//   @put("/blacklist-token/{id}", {
//     responses: {
//       "204": {
//         description: "BlockedToken PUT success",
//       },
//     },
//   })
//   async replaceById(
//     @param.path.number("id") id: number,
//     @requestBody() blockedToken: BlockedToken,
//   ): Promise<void> {
//     await this.blockedTokenRepository.replaceById(id, blockedToken);
//   }

//   @del("/blacklist-token/{id}", {
//     responses: {
//       "204": {
//         description: "BlockedToken DELETE success",
//       },
//     },
//   })
//   async deleteById(@param.path.number("id") id: number): Promise<void> {
//     await this.blockedTokenRepository.deleteById(id);
//   }
// }
