// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {repository} from "@loopback/repository";
import {
  post,
  get,
  patch,
  del,
  put,
  param,
  requestBody,
  HttpErrors,
} from "@loopback/rest";
import {
  UserService,
  authenticate,
  TokenService,
} from "@loopback/authentication";
import {
  Credentials,
  UserRepository,
  RefreshTokensRepository,
  BlockedTokensRepository,
} from "../repositories";
import {User, Token} from "../models";
import {TokensPair, JWTTokensPairService} from "../services/jwt-service";
import {inject} from "@loopback/context";
import {TokenServiceBindings, UserServiceBindings} from "../keys";
import {SecurityBindings, UserProfile, securityId} from "@loopback/security";

export class TokenController {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(RefreshTokensRepository)
    protected refreshTokensRepository: RefreshTokensRepository,
    @repository(BlockedTokensRepository)
    protected blockedTokensRepository: BlockedTokensRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    protected jwtRefreshService: TokenService,
    @inject(TokenServiceBindings.TOKEN_PAIR_SERVICE)
    protected jwtTokensPairService: JWTTokensPairService,
    @inject(UserServiceBindings.USER_SERVICE)
    protected userService: UserService<User, Credentials>,
  ) {}

  @post("/users/{userId}/tokens/deactivate", {
    responses: {
      "200": {
        description: "User.BlockedToken model instance",
        content: {
          "application/json": {
            schema: {
              "x-ts-type": Token,
            },
          },
        },
      },
    },
  })
  async createBlockedToken(
    @param.path.number("userId") userId: number,
    @requestBody() token: Token,
  ): Promise<Token> {
    if (userId !== token.userId) {
      throw new HttpErrors.BadRequest(
        `User id does not match: ${userId} !== ${token.userId}`,
      );
    }

    delete token.userId;
    return this.userRepository.blockedTokens(userId).create(token);
  }

  @post("/users/{userId}/tokens/refresh", {
    responses: {
      "200": {
        description: "User.RefreshToken model instance",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                accessToken: {
                  type: "string",
                },
                refreshToken: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  })
  @authenticate("jwtRT")
  async refreshTokensPair(
    @param.path.number("userId") userId: number,
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<TokensPair> {
    const foundUser = await this.userRepository.findById(userId);
    const userProfile = this.userService.convertToUserProfile(foundUser);
    const tokensPair: TokensPair = {
      accessToken: await this.jwtRefreshService.generateToken(userProfile),
      refreshToken: currentUserProfile[securityId],
    };

    delete currentUserProfile[securityId];
    // const tokensPair: TokensPair = await this.jwtTokensPairService.issueTokensPairs(
    //   userProfile,
    //   currentUserProfile.userId,
    // );

    return tokensPair;
  }
}
