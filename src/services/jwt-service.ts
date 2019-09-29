// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from "@loopback/context";
import {HttpErrors} from "@loopback/rest";
import {promisify} from "util";
import {TokenService} from "@loopback/authentication";
import {UserProfile, securityId} from "@loopback/security";
import {TokenServiceBindings, BlacklistServiceBindings} from "../keys";
// import {BlacklistService} from "./blacklist-service";
import {repository, DataObject, Count} from "@loopback/repository";
import {RefreshTokensRepository, UserRepository} from "../repositories";
import {Token} from "../models";

const uuid = require("uuid/v4");
const jwt = require("jsonwebtoken");
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string, // @inject(BlacklistServiceBindings.BLACKLIST_SERVICE) // public blacklistService: BlacklistService,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }

    // const isTokenDisabled = await this.blacklistService.isTokenDisabled(token);

    // if (!isTokenDisabled) {
    //   throw new HttpErrors.Unauthorized("Verification token has been blocked.");
    // }

    let userProfile: UserProfile;

    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
        {[securityId]: "", name: ""},
        {[securityId]: decodedToken.id, name: decodedToken.name},
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        "Error generating token : userProfile is null",
      );
    }
    const userInfoForToken = {
      id: userProfile[securityId],
      name: userProfile.name,
      email: userProfile.email,
    };
    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(userInfoForToken, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    return token;
  }
}

export type TokensPair = {
  accessToken: string;
  refreshToken: string;
};

export interface I_JWTIssueTokensPair {
  verifyToken(token: string, userId: number): Promise<UserProfile>;
  generateRefreshToken(userId: number): Promise<Token>;
  issueTokensPairs(
    userProfile: UserProfile,
    userId: number,
    refresh?: boolean,
    refreshTokenForDeactivate?: string,
  ): Promise<TokensPair>;
}

export class JWTTokensPairService implements I_JWTIssueTokensPair {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(RefreshTokensRepository)
    protected refreshTokensRepository: RefreshTokensRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    protected jwtService: TokenService,
  ) {}

  async verifyToken(token: string, userId: number): Promise<UserProfile> {
    // const count = await this.userRepository.refreshTokens(userId).delete({
    //   where: {
    //     token: token,
    //   },
    // });

    // if (count.count === 0) {
    //   throw new HttpErrors.BadRequest("Refresh token is invalid");
    // }

    const refreshToken: Partial<Token> = {
      userId: userId,
      token: uuid(),
    };

    try {
      const newToken = await this.generateRefreshToken(userId);

      let userProfile: UserProfile;

      userProfile = Object.assign(
        {[securityId]: "", userId: ""},
        {[securityId]: newToken.token, userId: newToken.userId},
      );

      return userProfile;
    } catch (error) {
      throw error;
    }
  }

  async generateRefreshToken(userId: number): Promise<Token> {
    const newRefreshToken: Partial<Token> = {
      userId: userId,
      token: uuid(),
    };

    try {
      const newToken = await this.userRepository
        .refreshTokens(userId)
        .create(newRefreshToken);

      return newToken;
    } catch (error) {
      throw error;
    }
  }

  async issueTokensPairs(
    userProfile: UserProfile,
    userId: number,
    refresh: boolean = false,
    refreshTokenForDeactivate?: string,
  ) {
    const refreshToken: Partial<Token> = {
      userId: userId,
      token: uuid,
    };

    // if (refresh) {
    //   const count = await this.userRepository.refreshTokens(userId).delete({
    //     where: {
    //       token: refreshTokenForDeactivate,
    //     },
    //   });

    //   if (!count) {
    //     throw new HttpErrors.BadRequest("Refresh token is invalid");
    //   }
    // }

    // const tokensPair: TokensPair = {
    //   accessToken: await this.jwtService.generateToken(userProfile),
    //   refreshToken: newToken,
    // };

    try {
      const createdToken: Token = await this.userRepository
        .refreshTokens(userId)
        .create(refreshToken);

      return {
        accessToken: await this.jwtService.generateToken(userProfile),
        refreshToken: createdToken.token,
      };
    } catch (error) {
      throw error;
    }
  }
}
