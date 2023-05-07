import * as ServerCore from '@var3n1k/server-core'

import * as Telegram from '@var3n1k/telegram'

import * as GlobalModule from '../../../../module/@module.mjs'

import * as GlobalAPI from '../../../../api/@api.mjs'

const CommandName = `start`
const CommandDescription = `Начало работы`

export default class SlashCommandHandler extends Telegram.Module.Classes.Handler.Command.Slash.BaseSlashCommand.default {
  constructor(api: Telegram.Module.Classes.API.default) {
    const Validator = ServerCore.Module.Classes.Validator
    Validator.Strict(api, new Validator().Default.Class.Instance().Required().Of(Telegram.Module.Classes.API.default))

    super(
      api,
      CommandName,
      CommandDescription,
      {
        Private: {
          Global: true,
          User: async (actionUser) => {
            const IsActionAvailableForUser = true

            return IsActionAvailableForUser
          },
        },
        Public: {
          Chat: {
            Global: false,
            Local: async (actionChat) => {
              const IsActionAvailableForChat = false

              return IsActionAvailableForChat
            },
            User: async (actionChat, actionUser) => {
              const IsActionAvailableForUser = false

              return IsActionAvailableForUser
            },
          },
        },
      },
      {
        Private: async (..._) => {
          const [EventContext, Message, CommandName, CommandArguments, CommandQuery, CommandChat, CommandAuthor] = _

          const CommandAuthorName = this._API.FormUserName(CommandAuthor.username, CommandAuthor.first_name, CommandAuthor.last_name)

          const WelcomeMessage = `Привет! Это чат-бот репетиторского центра «*Формула*», здесь Вы можете узнать основную информацию о нашем центре (используйте для этого команды /faq, /pricing и /contacts), а также записаться на занятия (команда /registration). Для этого нажмите на кнопку «*Меню*» и выберете нужную команду.`

          await EventContext.reply(`${WelcomeMessage}`, { parse_mode: `Markdown` })
        },
        Public: {
          Chat: async (..._) => {
            const [EventContext, Message, CommandName, CommandArguments, CommandQuery, CommandChat, CommandAuthor] = _
          },
        },
      }
    )
  }
}
