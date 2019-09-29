import {inject} from "@loopback/context";
import {Request, HttpErrors} from "@loopback/rest";
import {AuthenticationStrategy} from "@loopback/authentication";
import {UserProfile} from "@loopback/security";
import {TokenServiceBindings} from "../keys";
import {JWTTokensPairService} from "../services/jwt-service";

export interface RequestCredentials {
  token: string;
  userId: number;
}

export class JWTRefreshTokenAuthenticationStrategy
  implements AuthenticationStrategy {
  name = "jwtRT";

  constructor(
    @inject(TokenServiceBindings.TOKEN_PAIR_SERVICE)
    protected jwtTokensPairService: JWTTokensPairService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const {token, userId}: RequestCredentials = this.extractCredentials(
      request,
    );
    const userProfile: UserProfile = await this.jwtTokensPairService.verifyToken(
      token,
      userId,
    );
    return userProfile;
  }

  extractCredentials(request: Request): RequestCredentials {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found`);
    }

    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith("Bearer")) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`,
      );
    }

    const parts = authHeaderValue.split(" ");
    if (parts.length !== 3) {
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
      );
    }

    const token = parts[1];
    const userId = parseInt(parts[2], 10);

    return {
      token,
      userId,
    };
  }
}
