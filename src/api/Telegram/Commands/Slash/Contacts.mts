import * as ServerCore from '@var3n1k/server-core'

import * as Telegram from '@var3n1k/telegram'

import * as GlobalModule from '../../../../module/@module.mjs'

import * as GlobalAPI from '../../../../api/@api.mjs'

const CommandName = `contacts`
const CommandDescription = `Контакты для обратной связи`

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

          const AdminContacts = ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(GlobalModule.DataSet.Dictionary.Admin.default.Contact.List)
          const Branches = ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(GlobalModule.DataSet.Dictionary.Branch.default)

          const Contacts: Array<GlobalModule.Types.Admin.IAdminContact> = [
            ...AdminContacts,
            ...Branches.map((_el, _ind, _arr) => {
              const Contact: GlobalModule.Types.Admin.IAdminContact = {
                Name: `${_el.Name} (${_el.Adress})`,
                Phone: {
                  Number: _el.Phone.Number,
                },
              }

              return Contact
            }),
          ]

          const GetContactToString = (contact: GlobalModule.Types.Admin.IAdminContact): string => {
            const ContactNamePrefix = `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Dot.Center.On}${UnicodeSpace(1)}`
            const ContactPhonePrefix = `${UnicodeSpace(ContactNamePrefix.length)}`

            const ContactNameToString = `*${ContactNamePrefix}**${contact.Name}*`
            const ContactPhoneToString = `*${ContactPhonePrefix}*\`${contact.Phone.Number}\``

            const ContactToString = `${ContactNameToString}\n${ContactPhoneToString}`

            return ContactToString
          }

          const ContactsGroups: Array<Array<GlobalModule.Types.Admin.IAdminContact>> = []
          const ContactsGroup: Array<GlobalModule.Types.Admin.IAdminContact> = []

          for (let i = 0; i < Contacts.length; i++) {
            const Contact = Contacts[i]

            const ContactsGroupMaximumSize = 1000

            const ContactsGroupCurrentSize = ContactsGroup.map((_el, _ind, _arr) => GetContactToString(_el).length).reduce((_prev, _curr, _currInd, _arr) => _prev + _curr, 0)
            const ContactsGroupNextSize = ContactsGroupCurrentSize + GetContactToString(Contact).length

            const IsContactsGroupFull = ContactsGroupNextSize > ContactsGroupMaximumSize
            if (IsContactsGroupFull) {
              ContactsGroups.push(ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(ContactsGroup))

              ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Clear(ContactsGroup)
            }

            ContactsGroup.push(Contact)
          }

          const IsContactsGroupEmpty = Validator.TypeGuard.Default.IsEmptyArray(ContactsGroup)
          if (!IsContactsGroupEmpty) {
            ContactsGroups.push(ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Copy(ContactsGroup))

            ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Clear(ContactsGroup)
          }

          for (let i = 0; i < ContactsGroups.length; i++) {
            const ContactsGroup = ContactsGroups[i]

            const ContactsGroupToString = ContactsGroup.map((_el, _ind, _arr) => {
              const ContactsToString = GetContactToString(_el)

              return ContactsToString
            }).join(`\n`)

            await EventContext.reply(`${ContactsGroupToString}`, { parse_mode: `Markdown` })
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
