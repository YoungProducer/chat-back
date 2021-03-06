// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {repository} from "@loopback/repository";
import {validateCredentials} from "../services/validator";
import {
  post,
  param,
  get,
  patch,
  requestBody,
  HttpErrors,
  getModelSchemaRef,
} from "@loopback/rest";
import {User} from "../models";
import {UserRepository} from "../repositories";
import {inject} from "@loopback/core";
import {
  authenticate,
  TokenService,
  UserService,
} from "@loopback/authentication";
import {UserProfile, securityId, SecurityBindings} from "@loopback/security";
import {
  CredentialsRequestBody,
  PatchingRequestBody,
  UserProfileSchema,
} from "./specs/user-controller.specs";
import {
  Credentials,
  CredentialsForPatch,
} from "../repositories/user.repository";
import {PasswordHasher} from "../services/hash.password.bcryptjs";
import {MailerService} from "../services/email-service";

import {
  TokenServiceBindings,
  PasswordHasherBindings,
  UserServiceBindings,
  MailerServiceBindings,
} from "../keys";
import * as _ from "lodash";
import {I_UserServicePatching} from "../services/user-service-patching";
import {I_TokenRefreshService} from "../services/jwt-pair-service";

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(TokenServiceBindings.TOKEN_REFRESH_SERVICE)
    public jwtRefreshService: I_TokenRefreshService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(UserServiceBindings.USER_SERVICE_FOR_PATCHING)
    public userServicePatching: I_UserServicePatching,
    @inject(MailerServiceBindings.MAILER_SERVICE)
    public mailerService: MailerService,
  ) {}

  @post("/users", {
    responses: {
      "200": {
        description: "User",
        content: {
          "application/json": {
            schema: {
              "x-ts-type": User,
            },
          },
        },
      },
    },
  })
  async create(
    @requestBody({
      description: "The input of user registration",
      content: {
        "application/json": {
          schema: getModelSchemaRef(User, {exclude: ["id"]}),
        },
      },
    })
    user: User,
  ): Promise<User> {
    // ensure a valid email value and password value
    validateCredentials(_.pick(user, ["email", "password"]));
    const credentials = {
      email: user.email,
      password: user.password,
    };

    // encrypt the password
    // eslint-disable-next-line require-atomic-updates
    user.emailVerified = false;
    user.password = await this.passwordHasher.hashPassword(user.password);

    try {
      // create the new user
      const savedUser = await this.userRepository.create(user);
      delete savedUser.password;

      // ensure the user exists, and the password is correct
      const userData = await this.userService.verifyCredentials(credentials);

      // convert a User object into a UserProfile object (reduced set of properties)
      const userProfile = this.userService.convertToUserProfile(userData);

      // create a JSON Web Token based on the user profile
      const token = await this.jwtService.generateToken(userProfile);

      //TODO: add created user id to href in email to optimization
      this.mailerService.sendMail(
        {
          from: "noreply@mess.com",
          to: savedUser.email,
          subject: "TestMail",
          html: `
            <p>To confirm your email, click
              <a href="http://localhost:8080/#/validate/${token}?userId=${savedUser.id}">
                here
              </a>
              .
            </p>`,
        },
        user,
      );

      return savedUser;
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new HttpErrors.Conflict("Email is already taken");
      } else {
        throw error;
      }
    }
  }

  @get("/validate/{userId}", {
    responses: {
      "200": {
        description: "Email confirmation",
        content: {
          "application/json": {
            scheme: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate("jwt")
  async confirmation(
    @param.path.number("userId") userId: number,
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    return await this.mailerService.confirmEmail(userId);
  }

  @get("/users/{userId}", {
    responses: {
      "200": {
        description: "User",
        content: {
          "application/json": {
            schema: {
              "x-ts-type": User,
            },
          },
        },
      },
    },
  })
  async findById(@param.path.string("userId") userId: number): Promise<User> {
    return this.userRepository.findById(userId, {
      fields: {password: false},
    });
  }

  @get("/users/me", {
    responses: {
      "200": {
        description: "The current user profile",
        content: {
          "application/json": {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  @authenticate("jwt")
  async printCurrentUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<UserProfile> {
    // (@jannyHou)FIXME: explore a way to generate OpenAPI schema
    // for symbol property
    currentUserProfile.id = currentUserProfile[securityId];
    delete currentUserProfile[securityId];
    return currentUserProfile;
  }

  @post("/users/login", {
    responses: {
      "200": {
        description: "Token",
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
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{accessToken: string; refreshToken: string}> {
    const emailConfirmed = await this.mailerService.emailConfirmed(
      credentials.email,
    );

    if (!emailConfirmed) {
      throw new HttpErrors.Unauthorized("Email is not confirmed.");
    }

    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const accessToken = await this.jwtService.generateToken(userProfile);
    const refreshToken = await this.jwtRefreshService.generateRefreshToken(
      user.id,
    );

    return {accessToken, refreshToken};
  }

  @patch("/users", {
    responses: {
      "204": {
        description: "Change user tag",
        content: {
          "application/json": {
            schema: PatchingRequestBody,
          },
        },
      },
    },
  })
  @authenticate("jwt")
  async changeId(
    @requestBody(PatchingRequestBody)
    credentials: CredentialsForPatch,
  ): Promise<string> {
    const verifiedCredentials = await this.userServicePatching.verifyCredentials(
      credentials,
    );

    try {
      delete credentials.id;
      await this.userRepository.updateById(verifiedCredentials.id, credentials);
      return "User wat patched successfully";
    } catch (error) {
      throw error;
    }
  }
}
