import {HttpErrors} from "@loopback/rest";
import {inject} from "@loopback/context";
import {PasswordHasher} from "./hash.password.bcryptjs";
import {PasswordHasherBindings} from "../keys";
import {
  CredentialsForPatch,
  UserRepository,
} from "../repositories/user.repository";
import {User} from "../models/user.model";
import {repository} from "@loopback/repository";

//TODO: Move class UserServiceForPatching from user-service.ts
// and create interface for this class
// then create bindings in keys.ts
// and bind it in application.ts

export interface I_UserServicePatching {
  verifyCredentials(
    credentials: CredentialsForPatch,
  ): Promise<CredentialsForPatch>;
}

export class UserServicePatching implements I_UserServicePatching {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async verifyCredentials(
    credentials: CredentialsForPatch,
  ): Promise<CredentialsForPatch> {
    try {
      const user = await this.userRepository.findById(credentials.id);
      if (!user) {
        throw new HttpErrors.NotFound("User not found");
      }

      if (credentials.password && credentials.newPassword) {
        const foundUser = await this.userRepository.findById(credentials.id);

        if (!foundUser) {
          throw new HttpErrors.NotFound("User not found");
        }

        const passwordMatched = await this.passwordHasher.comparePassword(
          credentials.password,
          foundUser.password,
        );

        if (!passwordMatched) {
          throw new HttpErrors.Unauthorized("Invalid password");
        }

        credentials.password = await this.passwordHasher.hashPassword(
          credentials.newPassword,
        );
      }

      if (credentials.tag) {
        const foundUser = await this.userRepository.findOne({
          where: {
            tag: credentials.tag,
          },
        });

        if (foundUser) {
          throw new HttpErrors.Conflict("Tag is already taken");
        }
      }

      if (credentials.email) {
        const foundUser = await this.userRepository.findOne({
          where: {
            email: credentials.email,
          },
        });

        if (foundUser) {
          throw new HttpErrors.Conflict("Email is already taken");
        }
      }

      return credentials;
    } catch (error) {
      throw error;
    }
  }
}
