import { HttpErrors } from "@loopback/rest";
import {
  CredentialsForChangeId,
  UserRepository,
} from "../repositories/user.repository";
import { User } from "../models/user.model"
import { repository } from "@loopback/repository";

//TODO: Move class UserServiceForPatching from user-service.ts
// and create interface for this class
// then create bindings in keys.ts
// and bind it in application.ts

export interface I_UserServicePatching {
  verifyCredentialsForChangeId(credentials: CredentialsForChangeId): Promise<User>
}

export class UserServicePatching implements I_UserServicePatching {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) { }

  async verifyCredentialsForChangeId(
    credentials: CredentialsForChangeId,
  ): Promise<User> {
    const foundUserById = await this.userRepository.findOne({
      where: { id: credentials.id },
    });

    if (foundUserById) {
      throw new HttpErrors.Unauthorized("Tag is already taken");
    }

    const foundUser = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized("User not found");
    }

    return foundUser;
  }
}
