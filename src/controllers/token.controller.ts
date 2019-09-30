// Uncomment these imports to begin using these cool features!

import {inject} from "@loopback/context";
import {param, get, post, requestBody} from "@loopback/rest";
import {
  authenticate,
  TokenService,
  UserService,
} from "@loopback/authentication";
import {SecurityBindings, UserProfile, securityId} from "@loopback/security";
import {TokenServiceBindings, UserServiceBindings} from "../keys";
import {I_TokenRefreshService} from "../services/jwt-pair-service";
import {User} from "../models";
import {Credentials, UserRepository} from "../repositories";
import {repository} from "@loopback/repository";

export class TokenController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(TokenServiceBindings.TOKEN_REFRESH_SERVICE)
    public jwtRefreshService: I_TokenRefreshService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
  ) {}

  @post("/users/token/refresh", {
    responses: {
      "200": {
        description: "Refresh tokens response",
        content: {
          "application/json": {
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
  })
  @authenticate("jwrt")
  async refreshTokens(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<{accessToken: string; refreshToken: string}> {
    const foundUser = await this.userRepository.findById(
      currentUserProfile.userId,
    );
    const userProfile = this.userService.convertToUserProfile(foundUser);

    const accessToken = await this.jwtService.generateToken(userProfile);
    const refreshToken = currentUserProfile[securityId];
    delete currentUserProfile[securityId];

    return {accessToken, refreshToken};
  }
}
