// import {repository} from "@loopback/repository";
// import {BlockedTokenRepository, UserRepository} from "../repositories";
// import {BlockedToken} from "../models";
// import {HttpErrors} from "@loopback/rest";

// export interface I_BlacklistService {
//   isTokenDisabled(token: string): Promise<boolean>;
// }

// export class BlacklistService implements I_BlacklistService {
//   constructor(
//     @repository(BlockedTokenRepository)
//     public blockedTokenRepository: BlockedTokenRepository,
//   ) {}

//   async isTokenDisabled(token: string): Promise<boolean> {
//     const foundToken = await this.blockedTokenRepository.findOne({
//       where: {
//         token: token,
//       },
//     });

//     if (foundToken === null) {
//       return true;
//     } else return false;
//   }
// }
