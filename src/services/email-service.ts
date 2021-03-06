import {SentMessageInfo, createTransport} from "nodemailer";
import Mail = require("nodemailer/lib/mailer");
import {inject} from "@loopback/core";
import {TokenService, UserService} from "@loopback/authentication";
import {
  TokenServiceBindings,
  UserServiceBindings,
  MailerServiceBindings,
} from "../keys";
import {JWTService} from "./jwt-service";
import {UserProfile, securityId} from "@loopback/security";
import {repository} from "@loopback/repository";
import {UserRepository, Credentials} from "../repositories";
import {User} from "../models/user.model";
import {HttpErrors} from "@loopback/rest";

export interface I_MailerService {
  sendMail(mailOptions: Mail.Options, user: User): Promise<SentMessageInfo>;
  confirmEmail(userId: number): Promise<string>;
  emailConfirmed(email: string | undefined): Promise<boolean>;
}

export class MailerService implements I_MailerService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(MailerServiceBindings.MAILER_SERVICE_USER)
    public mailerUser: string,
    @inject(MailerServiceBindings.MAILER_SERVICE_PASS)
    public mailerPass: string,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    public jwtExpiresIn: string,
    @inject(TokenServiceBindings.TOKEN_SECRET)
    public jwtSecret: string,
  ) {}

  async sendMail(
    mailOptions: Mail.Options,
    user: User,
  ): Promise<SentMessageInfo> {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: this.mailerUser,
        pass: this.mailerPass,
      },
    });

    // const userProfile = this.userService.convertToUserProfile(user);

    // const accessToken = await this.jwtService.generateToken(userProfile);
    // const refreshToken = await this.jwtService.generateToken(userProfile);
    // const clientId = userProfile[securityId];
    // const clientSecret = this.jwtSecret;
    // delete userProfile[securityId];

    // let transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
    //   port: 465,
    //   secure: true,
    //   auth: {
    //     type: "OAuth2",
    //     clientId: clientId,
    //     clientSecret: clientSecret,
    //   },
    // });

    // return transporter.sendMail({
    //   ...mailOptions,
    //   auth: {
    //     user: "sashabezrukovownmail@gmail.com",
    //     accessToken: accessToken,
    //     refreshToken: refreshToken,
    //     expires: parseInt(this.jwtExpiresIn, 10),
    //   },
    // });
    return await transporter.sendMail({
      ...mailOptions,
      envelope: {
        from: "messager <sashabezrukovownmail@gmail.com>", // used as MAIL FROM: address for SMTP
        to: `${mailOptions.to}`, // used as RCPT TO: address for SMTP
      },
    });
  }

  async confirmEmail(userId: number): Promise<string> {
    const foundUser = await this.userRepository.findById(userId);

    if (foundUser === null) {
      throw new HttpErrors.Unauthorized("User not found");
    }

    foundUser.emailVerified = true;

    try {
      delete foundUser.id;
      await this.userRepository.updateById(userId, foundUser);
      return "Email verified successfully";
    } catch (error) {
      throw error;
    }
  }

  async emailConfirmed(email: string | undefined): Promise<boolean> {
    const foundUser = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (foundUser === null) {
      throw new HttpErrors.Unauthorized("User not found");
    }

    return foundUser.emailVerified;
  }
}
