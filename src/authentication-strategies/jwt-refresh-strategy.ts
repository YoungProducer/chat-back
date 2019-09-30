import {inject} from "@loopback/context";
import {HttpErrors, Request} from "@loopback/rest";
import {UserProfile} from "@loopback/security";
import {AuthenticationStrategy} from "@loopback/authentication";
import {TokenServiceBindings} from "../keys";
import {I_TokenRefreshService} from "../services/jwt-pair-service";

export class JWTRefreshAuthenticationStrategy
  implements AuthenticationStrategy {
  name = "jwrt";

  constructor(
    @inject(TokenServiceBindings.TOKEN_REFRESH_SERVICE)
    public tokenRefreshService: I_TokenRefreshService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const {refreshToken, userId} = this.extractCredentials(request);
    const userProfile: UserProfile = await this.tokenRefreshService.verifyToken(
      userId,
      refreshToken,
    );
    return userProfile;
  }

  extractCredentials(request: Request): {refreshToken: string; userId: number} {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // for example : Bearer xxx.yyy.zzz
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith("Bearer")) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`,
      );
    }

    //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
    const parts = authHeaderValue.split(" ");
    if (parts.length !== 3)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
      );
    const refreshToken = parts[1];
    const userId = parseInt(parts[2]);

    return {refreshToken, userId};
  }
}
