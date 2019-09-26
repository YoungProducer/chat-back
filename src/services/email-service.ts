import {SentMessageInfo, createTransport} from "nodemailer";
import Mail = require("nodemailer/lib/mailer");
import {inject} from "@loopback/core";
import {TokenService, UserService} from "@loopback/authentication";
import {TokenServiceBindings, UserServiceBindings} from "../keys";
import {JWTService} from "./jwt-service";
import {UserProfile, securityId} from "@loopback/security";
import {repository} from "@loopback/repository";
import {UserRepository, Credentials} from "../repositories";
import {User} from "../models/user.model";

const nodemailer = require("nodemailer");

export class MailerService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
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
        user: "sashabezrukovownmail@gmail.com",
        pass: "Sasha080701",
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
}
