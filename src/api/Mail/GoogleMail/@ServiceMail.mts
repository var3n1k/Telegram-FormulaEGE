import * as ServerCore from '@var3n1k/server-core'

import * as Mail from '@var3n1k/mail'

const MailAPIConfiguration = {
  User: {
    Name: ServerCore.Module.Classes.Process.Env.MAILER_SERVICE_USER as string,
    Password: ServerCore.Module.Classes.Process.Env.MAILER_SERVICE_PASSWORD as string,
  },
  Connection: {
    Host: {
      Name: ServerCore.Module.Classes.Process.Env.MAILER_SERVICE_DOMAIN as string,
      Port: Number.parseInt(ServerCore.Module.Classes.Process.Env.MAILER_SERVICE_PORT as string),
    },
  },
}

const MailAPI = new Mail.default(
  MailAPIConfiguration.User.Name,
  MailAPIConfiguration.User.Password,
  MailAPIConfiguration.Connection.Host.Name,
  MailAPIConfiguration.Connection.Host.Port
)

export default MailAPI
