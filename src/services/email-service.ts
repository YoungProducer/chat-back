import { SentMessageInfo, createTransport } from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');
import { inject } from "@loopback/core";
import { TokenService } from "@loopback/authentication";
import { TokenServiceBindings } from "../keys";
import { JWTService } from "./jwt-service";

export class MailerService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService
  ) { }

  async sendMail(mailOptions: Mail.Options): Promise<SentMessageInfo> {
    // const transporter = createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: "sashabezrukovownmail@gmail.com",
    //     pass: "Sasha080701"
    //   }
    // });

    // const transporter = createTransport({
    //   aut
    // })

    return await transporter.sendMail(mailOptions);
  }
}
