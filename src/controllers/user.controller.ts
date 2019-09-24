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

import {
  TokenServiceBindings,
  PasswordHasherBindings,
  UserServiceBindings,
} from "../keys";
import * as _ from "lodash";
import {UserServicePatching} from "../services/user-service-patching";

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(UserServiceBindings.USER_SERVICE_FOR_PATCHING)
    public userServicePatching: UserServicePatching,
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
    user: Omit<User, "id">,
  ): Promise<User> {
    // ensure a valid email value and password value
    validateCredentials(_.pick(user, ["email", "password"]));

    // encrypt the password
    // eslint-disable-next-line require-atomic-updates
    user.password = await this.passwordHasher.hashPassword(user.password);

    try {
      // create the new user
      const savedUser = await this.userRepository.create(user);
      delete savedUser.password;

      return savedUser;
    } catch (error) {
      // MongoError 11000 duplicate key
      // Todo: try to check the 1062 error code
      if (error.code === 1 && error.errmsg.includes("index: uniqueEmail")) {
        throw new HttpErrors.Conflict("Email value is already taken");
      } else {
        throw error;
      }
    }
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
                token: {
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
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
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
