import * as ServerCore from '@var3n1k/server-core'

import * as Telegram from '@var3n1k/telegram'

import * as GlobalModule from '../../../../module/@module.mjs'

import * as GlobalAPI from '../../../../api/@api.mjs'

const CommandName = `faq`
const CommandDescription = `Часто-задаваемые вопросы`

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

          const UnicodeSpace = (length: number) => ``.padStart(length, ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Separator.Space.Unicode)

          const FAQs = ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(GlobalModule.DataSet.Dictionary.FAQ.default)

          const GetFAQToString = (faq: GlobalModule.Types.FAQ.IFAQ): string => {
            const FAQQuestionPrefix = `` // `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Dot.Center.On}`
            const FAQAnswerPrefix = `${UnicodeSpace(FAQQuestionPrefix.length)}`

            const FAQQuestionToString = `*${FAQQuestionPrefix}**В*: *${faq.Question.Main}*`
            const FAQAnswerToString = `*${FAQAnswerPrefix}**О*: ${faq.Answer}`

            const FAQToString = `${FAQQuestionToString}\n${FAQAnswerToString}`

            return FAQToString
          }

          const RequestFAQ = async (): Promise<void> => {
            const FAQButtonPrefix = `faq_choose_`

            const FAQButtons = FAQs.map((_el, _ind, _arr) =>
              Telegram.Module.Dependencies.telegraf.Markup.button.callback(
                `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Star.On} ${_el.Question.Main}`,
                `${FAQButtonPrefix}${_ind}`,
                false
              )
            )

            const RequestMessage = await EventContext.reply(`*Выберите интересующий вас вопрос*`, {
              parse_mode: `Markdown`,
              reply_markup: {
                inline_keyboard: [...FAQButtons.map((_el, _ind, _arr) => [_el])],
              },
            })

            const FAQButtonInteraction = await this._API.Awaited.Action.Component.Button.Private(new RegExp(`^${FAQButtonPrefix}\\d+$`), CommandAuthor.id, undefined)
            await FAQButtonInteraction[0].answerCbQuery()

            const FAQID = Number.parseInt(FAQButtonInteraction[2].slice(FAQButtonPrefix.length, FAQButtonInteraction[2].length))
            const FAQ = FAQs[FAQID]

            try {
              await this._API.Client.telegram.editMessageText(RequestMessage.chat.id, RequestMessage.message_id, undefined, `${GetFAQToString(FAQ)}`, {
                parse_mode: `Markdown`,
              })
            } catch (APIError) {}

            try {
              await this._API.Client.telegram.editMessageReplyMarkup(RequestMessage.chat.id, RequestMessage.message_id, undefined, {
                inline_keyboard: [],
              })
            } catch (APIError) {}
          }

          const SendFAQ = async (): Promise<void> => {
            const FAQsGroups: Array<Array<GlobalModule.Types.FAQ.IFAQ>> = []
            const FAQsGroup: Array<GlobalModule.Types.FAQ.IFAQ> = []

            for (let i = 0; i < FAQs.length; i++) {
              const FAQ = FAQs[i]

              const FAQsGroupMaximumSize = 1000

              const FAQsGroupCurrentSize = FAQsGroup.map((_el, _ind, _arr) => GetFAQToString(_el).length).reduce((_prev, _curr, _currInd, _arr) => _prev + _curr, 0)
              const FAQsGroupNextSize = FAQsGroupCurrentSize + GetFAQToString(FAQ).length

              const IsFAQsGroupFull = FAQsGroupNextSize > FAQsGroupMaximumSize
              if (IsFAQsGroupFull) {
                FAQsGroups.push(ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(FAQsGroup))

                ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Clear(FAQsGroup)
              }

              FAQsGroup.push(FAQ)
            }

            const IsFAQsGroupEmpty = Validator.TypeGuard.Default.IsEmptyArray(FAQsGroup)
            if (!IsFAQsGroupEmpty) {
              FAQsGroups.push(ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(FAQsGroup))

              ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Clear(FAQsGroup)
            }

            for (let i = 0; i < FAQsGroups.length; i++) {
              const FAQsGroup = FAQsGroups[i]

              const FAQsGroupToString = FAQsGroup.map((_el, _ind, _arr) => {
                const FAQToString = GetFAQToString(_el)

                return FAQToString
              }).join(`\n\n`)

              await EventContext.reply(`${FAQsGroupToString}`, { parse_mode: `Markdown` })
            }
          }

          await RequestFAQ()
          // await SendFAQ()
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
