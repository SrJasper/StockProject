import { Injectable } from "@nestjs/common";
import { Transporter, createTransport } from "nodemailer";


@Injectable()
export class EmailService {

  private transporter: Transporter

  constructor() {
    this.transporter = createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAILPASS
      }
    })
  }


  template = (nome: string) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <h3>Mail recovery</h3>
    
    
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Tel</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${nome}</td>
           
      </table>
    </body>
    </html>`
  }


  async sendEmail(to: string, subject: string, text: string,) {

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL,
        to,
        subject,
        text,
      })
    } catch (error) {
      console.error('Erro ao enviar email', error)
    }

    return 'Email enviado com sucesso!';
  }
}