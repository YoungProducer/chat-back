// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from "@loopback/context";
import {PasswordHasher} from "./services/hash.password.bcryptjs";
import {TokenService, UserService, authenticate} from "@loopback/authentication";
import {User} from "./models";
import {Credentials} from "./repositories";
import {I_UserServicePatching} from "./services/user-service-patching";
import {I_MailerService} from "./services/email-service";
import {I_TokenRefreshService} from "./services/jwt-pair-service";

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = "myjwts3cr3t";
  export const TOKEN_EXPIRES_IN_VALUE = "216000";
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    "authentication.jwt.secret",
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    "authentication.jwt.expires.in.seconds",
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    "services.authentication.jwt.tokenservice",
  );
  export const TOKEN_REFRESH_SERVICE = BindingKey.create<I_TokenRefreshService>(
    "services.authentication.jwt.refreshtokenservice"
  )
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    "services.hasher",
  );
  export const ROUNDS = BindingKey.create<number>("services.hasher.round");
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    "services.user.service",
  );

  export const USER_SERVICE_FOR_PATCHING = BindingKey.create<
    I_UserServicePatching
  >("services.user.patching.service");
}

export namespace MailreServiceConstants {
  export const MAILER_USER_VALUE = "sashabezrukovownmail@gmail.com";
  export const MAILER_USER_PASS = "Sasha080701";
}

export namespace MailerServiceBindings {
  export const MAILER_SERVICE = BindingKey.create<I_MailerService>(
    "service.mailer.service"
  );

  export const MAILER_SERVICE_USER = BindingKey.create<string>(
    "authentication.mailer.user"
  );

  export const MAILER_SERVICE_PASS = BindingKey.create<string>(
    "authentication.mailer.pass"
  );
}
