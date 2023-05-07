import * as ServerCore from '@var3n1k/server-core'

import * as Telegram from '@var3n1k/telegram'

import * as GlobalModule from '../../../../module/@module.mjs'

import * as GlobalAPI from '../../../../api/@api.mjs'

const CommandName = `pricing`
const CommandDescription = `Услуги и расценки`

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

          const Services = ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(GlobalModule.DataSet.Dictionary.Service.default)

          const GetServiceToString = (service: GlobalModule.Types.Service.IService): string => {
            const ServiceNamePrefix = `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Dot.Center.On}${UnicodeSpace(1)}`
            const ServicePricePrefix = `${UnicodeSpace(ServiceNamePrefix.length)}`

            const ServiceNameToString = `*${ServiceNamePrefix}**Услуга*: *${service.Name}*\n*${ServicePricePrefix}**Описание*: ${service.Description}`
            const ServicePriceToString = `*${ServicePricePrefix}**Стоимость*: \`${service.Price}р\``

            const ServiceToString = `${ServiceNameToString}\n${ServicePriceToString}`

            return ServiceToString
          }

          const ServicesGroups: Array<Array<GlobalModule.Types.Service.IService>> = []
          const ServicesGroup: Array<GlobalModule.Types.Service.IService> = []

          for (let i = 0; i < Services.length; i++) {
            const Service = Services[i]

            const ServicesGroupMaximumSize = 1000

            const ServicesGroupCurrentSize = ServicesGroup.map((_el, _ind, _arr) => GetServiceToString(_el).length).reduce((_prev, _curr, _currInd, _arr) => _prev + _curr, 0)
            const ServicesGroupNextSize = ServicesGroupCurrentSize + GetServiceToString(Service).length

            const IsServicesGroupFull = ServicesGroupNextSize > ServicesGroupMaximumSize
            if (IsServicesGroupFull) {
              ServicesGroups.push(ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(ServicesGroup))

              ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Clear(ServicesGroup)
            }

            ServicesGroup.push(Service)
          }

          const IsServicesGroupEmpty = Validator.TypeGuard.Default.IsEmptyArray(ServicesGroup)
          if (!IsServicesGroupEmpty) {
            ServicesGroups.push(ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(ServicesGroup))

            ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Clear(ServicesGroup)
          }

          for (let i = 0; i < ServicesGroups.length; i++) {
            const ServicesGroup = ServicesGroups[i]

            const ServicesGroupToString = ServicesGroup.map((_el, _ind, _arr) => {
              const ServiceToString = GetServiceToString(_el)

              return ServiceToString
            }).join(`\n\n`)

            await EventContext.reply(`${ServicesGroupToString}`, { parse_mode: `Markdown` })
          }
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
