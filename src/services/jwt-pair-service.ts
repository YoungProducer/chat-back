import { inject } from "@loopback/context";
import { UserProfile, securityId } from "@loopback/security";
import { repository } from "@loopback/repository";
import { HttpErrors } from "@loopback/rest";
import { Token } from "../models";
import { RefreshTokensRepository, UserRepository } from "../repositories";

const uuid = require("uuid/v4");

export interface I_TokenRefreshService {
  verifyToken(userId: number, token: string): Promise<UserProfile>,
  generateRefreshToken(userId: number): Promise<string>
}

export class JWTRefreshService implements I_TokenRefreshService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository
  ) { }

  async verifyToken(userId: number, token: string): Promise<UserProfile> {
    try {
      const count = await this.userRepository.refreshTokens(userId).delete({ token: token });

      if (count.count === 0) {
        throw new HttpErrors.Unauthorized("Invalid refresh token");
      }

      let userProfile: UserProfile;
      const newToken = await this.generateRefreshToken(userId);

      userProfile = Object.assign(
        { [securityId]: "", userId: "" },
        { [securityId]: newToken, userId: userId }
      );

      return userProfile;
    } catch (error) {
      throw error;
    }
  }

  async generateRefreshToken(userId: number): Promise<string> {
    try {
      const newToken = await this.userRepository
        .refreshTokens(userId)
        .create({ userId: userId, token: uuid() });

      return newToken.token;
    } catch (error) {
      throw error;
    }
  }
}
