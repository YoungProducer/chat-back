// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from "@loopback/boot";
import {ApplicationConfig, BindingKey} from "@loopback/core";
import {RepositoryMixin} from "@loopback/repository";
import {RestApplication} from "@loopback/rest";
import {ServiceMixin} from "@loopback/service-proxy";
import {MyAuthenticationSequence} from "./sequence";
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from "@loopback/rest-explorer";
import {
  TokenServiceBindings,
  UserServiceBindings,
  TokenServiceConstants,
  MailerServiceBindings,
  MailreServiceConstants,
  BlacklistServiceBindings,
} from "./keys";
import {JWTService, JWTTokensPairService} from "./services/jwt-service";
import {MyUserService} from "./services/user-service";
import {UserServicePatching} from "./services/user-service-patching";
import {BcryptHasher} from "./services/hash.password.bcryptjs";
import {MailerService} from "./services/email-service";
import * as path from "path";
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from "@loopback/authentication";
import {PasswordHasherBindings} from "./keys";
import {JWTAuthenticationStrategy} from "./authentication-strategies/jwt-strategy";
// import {BlacklistService} from "./services/blacklist-service";

/**
 * Information from package.json
 */
export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
export const PackageKey = BindingKey.create<PackageInfo>("application.package");

const pkg: PackageInfo = require("../package.json");

export class ShoppingApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    this.setUpBindings();

    // Bind authentication component related elements
    this.component(AuthenticationComponent);

    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

    // Set up the custom sequence
    this.sequence(MyAuthenticationSequence);

    // Set up default home page
    this.static("/", path.join(__dirname, "../public"));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: "/explorer",
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ["controllers"],
        extensions: [".controller.js"],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    // Bind package.json to the application context
    this.bind(PackageKey).to(pkg);

    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_PAIR_SERVICE).toClass(
      JWTTokensPairService,
    );

    // // Bind bcrypt hash services
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.bind(UserServiceBindings.USER_SERVICE_FOR_PATCHING).toClass(
      UserServicePatching,
    );

    // Bind mailer services
    this.bind(MailerServiceBindings.MAILER_SERVICE).toClass(MailerService);

    this.bind(MailerServiceBindings.MAILER_SERVICE_USER).to(
      MailreServiceConstants.MAILER_USER_VALUE,
    );

    this.bind(MailerServiceBindings.MAILER_SERVICE_PASS).to(
      MailreServiceConstants.MAILER_USER_PASS,
    );

    // Bind blacklist services
    // this.bind(BlacklistServiceBindings.BLACKLIST_SERVICE).toClass(
    //   BlacklistService,
    // );
  }
}
