import * as ServerCore from '@var3n1k/server-core'

import * as Telegram from '@var3n1k/telegram'

import * as GlobalModule from '../../../../module/@module.mjs'

import * as GlobalAPI from '../../../../api/@api.mjs'

const CommandName = `registration`
const CommandDescription = `Записаться на курс`

export default class Command extends Telegram.Module.Classes.Handler.Command.Slash.BaseSlashCommand.default {
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

          const PhoneNumberPattern = /^(?:8|(?:\+)?7)?(?:[\-\s])?(?:\(?\d{3}\)?)(?:[\-\s])?(?:\d{3})(?:[\-\s])?(?:\d{2})(?:[\-\s])?(?:\d{2})$/
          const EMailAdressPattern = /^[a-zA-Z\d\.\+\-\%_]+@[a-zA-Z\d\.\-]+\.[a-zA-Z]{2,}$/

          const RequiredFullNamePartsSize = 2
          const FullNameValidator = new Validator().Default.String()
            .Required()
            .MinSpaces(RequiredFullNamePartsSize - 1)
            .MinLength(RequiredFullNamePartsSize * 2 + (RequiredFullNamePartsSize - 1))
          const PhoneNumberValidator = new Validator().Default.String()
            .Required()
            .Custom(
              (_) => PhoneNumberPattern.test(_),
              (_) => []
            )
          const EMailAdressValidator = new Validator().Default.String()
            .Required()
            .Custom(
              (_) => EMailAdressPattern.test(_),
              (_) => []
            )

          interface RegistrationForm {
            readonly Customer: {
              readonly Name: {
                Full: string | undefined
              }
              readonly Phone: {
                Number: string | undefined
              }
              readonly EMail: {
                Adress: string | undefined
              }
            }
            readonly Child: {
              readonly Name: {
                Full: string | undefined
              }
              Grade: number | undefined
            }
            readonly Subjects: Array<GlobalModule.Types.Subject.ISubject>
            Branch: GlobalModule.Types.Branch.IBranch | undefined
          }

          const RegistrationForm: RegistrationForm = {
            Customer: {
              Name: {
                Full: undefined,
              },
              Phone: {
                Number: undefined,
              },
              EMail: {
                Adress: undefined,
              },
            },
            Child: {
              Name: {
                Full: undefined,
              },
              Grade: undefined,
            },
            Subjects: [],
            Branch: undefined,
          }

          const UnicodeSpace = (length: number) => ``.padStart(length, ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Separator.Space.Unicode)

          const RegistrationFormModifyCustomerFullNameButtonID = `registration_form_modify_customer_name_full`
          const RegistrationFormModifyCustomerFullNameButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
            `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Graphic.Pencil.DownRight} Изменить ФИО заказчика`,
            RegistrationFormModifyCustomerFullNameButtonID,
            false
          )

          const RegistrationFormModifyChildFullNameButtonID = `registration_form_modify_child_name_full`
          const RegistrationFormModifyChildFullNameButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
            `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Graphic.Pencil.DownRight} Изменить ФИО обучающегося`,
            RegistrationFormModifyChildFullNameButtonID,
            false
          )

          const RegistrationFormModifyPhoneNumberButtonID = `registration_form_modify_phone_number`
          const RegistrationFormModifyPhoneNumberButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
            `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Graphic.Pencil.DownRight} Изменить телефон`,
            RegistrationFormModifyPhoneNumberButtonID,
            false
          )

          const RegistrationFormModifyEmailAdressButtonID = `registration_form_modify_email_adress`
          const RegistrationFormModifyEmailAdressButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
            `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Graphic.Pencil.DownRight} Изменить почту`,
            RegistrationFormModifyEmailAdressButtonID,
            false
          )

          const RegistrationFormModifyGradeButtonID = `registration_form_modify_grade`
          const RegistrationFormModifyGradeButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
            `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Graphic.Pencil.DownRight} Изменить класс обучения`,
            RegistrationFormModifyGradeButtonID,
            false
          )

          const RegistrationFormModifySubjectsButtonID = `registration_form_modify_subjects`
          const RegistrationFormModifySubjectsButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
            `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Graphic.Pencil.DownRight} Изменить предметы`,
            RegistrationFormModifySubjectsButtonID,
            false
          )

          const RegistrationFormModifyBranchButtonID = `registration_form_modify_branch`
          const RegistrationFormModifyBranchButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
            `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Graphic.Pencil.DownRight} Изменить филиал`,
            RegistrationFormModifyBranchButtonID,
            false
          )

          const RegistrationFormSubmitButtonID = `registration_form_submit`
          const RegistrationFormSubmitButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
            `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Output.Status.Success.Colored} Отправить`,
            RegistrationFormSubmitButtonID,
            false
          )

          const FormatFullName = (initialFullName: string): string => {
            const InitialFullNameParts = initialFullName.split(/\s+/)

            const FullNamePartsToLowerCase = InitialFullNameParts.map((_el, _ind, _arr) =>
              ServerCore.Module.Functions.Parameter.Type.Manager.Default.String.Style.Modify.Case.Size.ToLowerCase(
                _el,
                Array.from(Array(_el.length), (__el, __ind) => __ind)
              )
            )
            const CapitalizedFullNameParts = FullNamePartsToLowerCase.map((_el, _ind, _arr) =>
              ServerCore.Module.Functions.Parameter.Type.Manager.Default.String.Style.Modify.Case.Size.ToUpperCase(_el, [0])
            )

            const FormattedFullName = CapitalizedFullNameParts.join(ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Separator.Space.Default)

            return FormattedFullName
          }

          const GetRegistrationFormMessageToString = (): string => {
            const LinePrefix = `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Dot.Center.On}${UnicodeSpace(1)}`

            const CustomerFullName = RegistrationForm.Customer.Name.Full
            const DoesCustomerFullNameExist = !Validator.TypeGuard.Default.IsNullOrUndefined(CustomerFullName)
            const CustomerFullNameToString = `*${LinePrefix}**ФИО заказчика (родителя)*: ${DoesCustomerFullNameExist ? `\`${FormatFullName(CustomerFullName)}\`` : `\`Не указано\``}`

            const ChildFullName = RegistrationForm.Child.Name.Full
            const DoesChildFullNameExist = !Validator.TypeGuard.Default.IsNullOrUndefined(ChildFullName)
            const ChildFullNameToString = `*${LinePrefix}**ФИО обучающегося (ребенка)*: ${DoesChildFullNameExist ? `\`${FormatFullName(ChildFullName)}\`` : `\`Не указано\``}`

            const PhoneNumber = RegistrationForm.Customer.Phone.Number
            const DoesPhoneNumberExist = !Validator.TypeGuard.Default.IsNullOrUndefined(PhoneNumber)
            const PhoneNumberToString = `*${LinePrefix}**Контактный номер телефона*: ${DoesPhoneNumberExist ? `\`${PhoneNumber}\`` : `\`Не указан\``}`

            const EmailAdress = RegistrationForm.Customer.EMail.Adress
            const DoesEmailAdressExist = !Validator.TypeGuard.Default.IsNullOrUndefined(EmailAdress)
            const EmailAdressToString = `*${LinePrefix}**Контактный адресс электронной почты*: ${DoesEmailAdressExist ? `\`${EmailAdress}\`` : `\`Не указан\``}`

            const Grade = RegistrationForm.Child.Grade
            const DoesGradeExist = !Validator.TypeGuard.Default.IsNullOrUndefined(Grade)
            const GradeToString = `*${LinePrefix}**Класс обучения*: ${DoesGradeExist ? `\`${Grade}\`` : `\`Не указан\``}`

            const Subjects = RegistrationForm.Subjects
            const DoesSubjectExist = !Validator.TypeGuard.Default.IsEmptyArray(Subjects)
            const SubjectsToString = `*${LinePrefix}**Выбранные предметы*: ${
              DoesSubjectExist ? `\n${Subjects.map((_el, _ind, _arr) => `${UnicodeSpace(LinePrefix.length * 2)}\`${_el.Name}\``).join(`\n`)}` : `\`Не указаны\``
            }`

            const Branch = RegistrationForm.Branch
            const DoesBranchExist = !Validator.TypeGuard.Default.IsNullOrUndefined(Branch)
            const BranchToString = `*${LinePrefix}**Филиал*: ${DoesBranchExist ? `\`${Branch.Name} (${Branch.Adress})\`` : `\`Не указан\``}`

            const RegistrationFormToStringParts: Array<string> = []
            RegistrationFormToStringParts.push(CustomerFullNameToString)
            RegistrationFormToStringParts.push(ChildFullNameToString)
            RegistrationFormToStringParts.push(PhoneNumberToString)
            RegistrationFormToStringParts.push(EmailAdressToString)
            RegistrationFormToStringParts.push(GradeToString)
            RegistrationFormToStringParts.push(SubjectsToString)
            RegistrationFormToStringParts.push(BranchToString)

            const RegistrationFormToString = `${RegistrationFormToStringParts.join(`\n`)}`

            return RegistrationFormToString
          }

          const GetRegistrationFormMailToString = (): string => {
            const LinePrefix = `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Dot.Center.On}${UnicodeSpace(1)}`

            const CustomerFullName = RegistrationForm.Customer.Name.Full
            const DoesCustomerFullNameExist = !Validator.TypeGuard.Default.IsNullOrUndefined(CustomerFullName)
            const CustomerFullNameToString = `<b>${LinePrefix}</b><b>ФИО заказчика (родителя)</b>: ${
              DoesCustomerFullNameExist ? `<i>${FormatFullName(CustomerFullName)}</i>` : `<i>Не указано</i>`
            }`

            const ChildFullName = RegistrationForm.Child.Name.Full
            const DoesChildFullNameExist = !Validator.TypeGuard.Default.IsNullOrUndefined(ChildFullName)
            const ChildFullNameToString = `<b>${LinePrefix}</b><b>ФИО обучающегося (ребенка)</b>: ${
              DoesChildFullNameExist ? `<i>${FormatFullName(ChildFullName)}</i>` : `<i>Не указано</i>`
            }`

            const PhoneNumber = RegistrationForm.Customer.Phone.Number
            const DoesPhoneNumberExist = !Validator.TypeGuard.Default.IsNullOrUndefined(PhoneNumber)
            const PhoneNumberToString = `<b>${LinePrefix}</b><b>Контактный номер телефона</b>: ${
              DoesPhoneNumberExist ? `<a href="tel:${PhoneNumber}">${PhoneNumber}</a>` : `<i>Не указан</i>`
            }`

            const EmailAdress = RegistrationForm.Customer.EMail.Adress
            const DoesEmailAdressExist = !Validator.TypeGuard.Default.IsNullOrUndefined(EmailAdress)
            const EmailAdressToString = `<b>${LinePrefix}</b><b>Контактный адресс электронной почты</b>: ${
              DoesEmailAdressExist ? `<a href="mailto:${EmailAdress}">${EmailAdress}</a>` : `<i>Не указан</i>`
            }`

            const Grade = RegistrationForm.Child.Grade
            const DoesGradeExist = !Validator.TypeGuard.Default.IsNullOrUndefined(Grade)
            const GradeToString = `<b>${LinePrefix}</b><b>Класс обучения</b>: ${DoesGradeExist ? `<i>${Grade}</i>` : `<i>Не указан</i>`}`

            const Subjects = RegistrationForm.Subjects
            const DoesSubjectExist = !Validator.TypeGuard.Default.IsEmptyArray(Subjects)
            const SubjectsToString = `<b>${LinePrefix}</b><b>Выбранные предметы</b>: ${
              DoesSubjectExist ? `<br>${Subjects.map((_el, _ind, _arr) => `${UnicodeSpace(LinePrefix.length * 2)}<i>${_el.Name}</i>`).join(`<br>`)}` : `<i>Не указаны</i>`
            }`

            const Branch = RegistrationForm.Branch
            const DoesBranchExist = !Validator.TypeGuard.Default.IsNullOrUndefined(Branch)
            const BranchToString = `<b>${LinePrefix}</b><b>Филиал</b>: ${DoesBranchExist ? `<i>${Branch.Name} (${Branch.Adress})</i>` : `<i>Не указан</i>`}`

            const RegistrationFormToStringParts: Array<string> = []
            RegistrationFormToStringParts.push(CustomerFullNameToString)
            RegistrationFormToStringParts.push(ChildFullNameToString)
            RegistrationFormToStringParts.push(PhoneNumberToString)
            RegistrationFormToStringParts.push(EmailAdressToString)
            RegistrationFormToStringParts.push(GradeToString)
            RegistrationFormToStringParts.push(SubjectsToString)
            RegistrationFormToStringParts.push(BranchToString)

            const RegistrationFormToString = `<div>${RegistrationFormToStringParts.join(`<br>`)}</div>`

            return RegistrationFormToString
          }

          const RegistrationFormMessage = await EventContext.reply(GetRegistrationFormMessageToString(), { parse_mode: `Markdown` })

          const UpdateRegistrationFormMessage = async (isAdditional: boolean): Promise<void> => {
            const RegistrationFormMessageToString = GetRegistrationFormMessageToString()

            try {
              await this._API.Client.telegram.editMessageText(RegistrationFormMessage.chat.id, RegistrationFormMessage.message_id, undefined, `${RegistrationFormMessageToString}`, {
                parse_mode: `Markdown`,
              })
            } catch (APIError) {}

            if (isAdditional) {
              try {
                const CustomerFullName = RegistrationForm.Customer.Name.Full
                const DoesCustomerFullNameExist = !Validator.TypeGuard.Default.IsNullOrUndefined(CustomerFullName)

                const ChildFullName = RegistrationForm.Child.Name.Full
                const DoesChildFullNameExist = !Validator.TypeGuard.Default.IsNullOrUndefined(ChildFullName)

                const PhoneNumber = RegistrationForm.Customer.Phone.Number
                const DoesPhoneNumberExist = !Validator.TypeGuard.Default.IsNullOrUndefined(PhoneNumber)

                const EmailAdress = RegistrationForm.Customer.EMail.Adress
                const DoesEmailAdressExist = !Validator.TypeGuard.Default.IsNullOrUndefined(EmailAdress)

                const Grade = RegistrationForm.Child.Grade
                const DoesGradeExist = !Validator.TypeGuard.Default.IsNullOrUndefined(Grade)

                const Subjects = RegistrationForm.Subjects
                const DoesSubjectExist = !Validator.TypeGuard.Default.IsEmptyArray(Subjects)

                const Branch = RegistrationForm.Branch
                const DoesBranchExist = !Validator.TypeGuard.Default.IsNullOrUndefined(Branch)

                const DoesEveryFieldExist =
                  DoesCustomerFullNameExist && DoesChildFullNameExist && DoesPhoneNumberExist && DoesEmailAdressExist && DoesGradeExist && DoesSubjectExist && DoesBranchExist

                type InlineKeyboardButton = ReturnType<typeof Telegram.Module.Dependencies.telegraf.Markup.button.callback>

                const InlineKeyboard: Array<Array<InlineKeyboardButton>> = []
                InlineKeyboard.push([RegistrationFormModifyCustomerFullNameButton])
                InlineKeyboard.push([RegistrationFormModifyChildFullNameButton])
                InlineKeyboard.push([RegistrationFormModifyPhoneNumberButton, RegistrationFormModifyEmailAdressButton])
                InlineKeyboard.push([RegistrationFormModifyGradeButton])
                InlineKeyboard.push([RegistrationFormModifySubjectsButton, RegistrationFormModifyBranchButton])
                if (DoesEveryFieldExist) InlineKeyboard.push([RegistrationFormSubmitButton])

                await this._API.Client.telegram.editMessageReplyMarkup(RegistrationFormMessage.chat.id, RegistrationFormMessage.message_id, undefined, {
                  inline_keyboard: InlineKeyboard,
                })
              } catch (APIError) {}
            }
          }

          const RequestCustomerFullName = async (isAdditional: boolean): Promise<void> => {
            if (isAdditional) {
              await UpdateRegistrationFormMessage(!isAdditional)
            }

            const RequestMessage = await EventContext.reply(`Введите ФИО заказчика (родителя) в формате \`Фамилия Имя Отчество\``, { parse_mode: `Markdown` })

            RegistrationForm.Customer.Name.Full = (await this._API.Awaited.Message.Private(CommandChat.id, CommandAuthor.id, undefined))[2]
            while (!Validator.Soft(RegistrationForm.Customer.Name.Full, FullNameValidator).Status) {
              const ErrorMessage = await EventContext.reply(`*Недопустимое ФИО, попробуйте снова*`, { parse_mode: `Markdown` })

              RegistrationForm.Customer.Name.Full = (await this._API.Awaited.Message.Private(CommandChat.id, CommandAuthor.id, undefined))[2]

              await this._API.Client.telegram.deleteMessage(ErrorMessage.chat.id, ErrorMessage.message_id)
            }
            await this._API.Client.telegram.deleteMessage(RequestMessage.chat.id, RequestMessage.message_id)

            await UpdateRegistrationFormMessage(isAdditional)
          }

          const RequestChildFullName = async (isAdditional: boolean): Promise<void> => {
            if (isAdditional) {
              await UpdateRegistrationFormMessage(!isAdditional)
            }

            const RequestMessage = await EventContext.reply(`Введите ФИО обучающегося (ребенка) в формате \`Фамилия Имя Отчество\``, { parse_mode: `Markdown` })

            RegistrationForm.Child.Name.Full = (await this._API.Awaited.Message.Private(CommandChat.id, CommandAuthor.id, undefined))[2]
            while (!Validator.Soft(RegistrationForm.Child.Name.Full, FullNameValidator).Status) {
              const ErrorMessage = await EventContext.reply(`*Недопустимое ФИО, попробуйте снова*`, { parse_mode: `Markdown` })

              RegistrationForm.Child.Name.Full = (await this._API.Awaited.Message.Private(CommandChat.id, CommandAuthor.id, undefined))[2]

              await this._API.Client.telegram.deleteMessage(ErrorMessage.chat.id, ErrorMessage.message_id)
            }
            await this._API.Client.telegram.deleteMessage(RequestMessage.chat.id, RequestMessage.message_id)

            await UpdateRegistrationFormMessage(isAdditional)
          }

          const RequestPhoneNumber = async (isAdditional: boolean): Promise<void> => {
            if (isAdditional) {
              await UpdateRegistrationFormMessage(!isAdditional)
            }

            const RequestMessage = await EventContext.reply(`Ведите контактный номер телефона в формате \`+7 912 345 67 89\``, { parse_mode: `Markdown` })

            RegistrationForm.Customer.Phone.Number = (await this._API.Awaited.Message.Private(CommandChat.id, CommandAuthor.id, undefined))[2]
            while (!Validator.Soft(RegistrationForm.Customer.Phone.Number, PhoneNumberValidator).Status) {
              const ErrorMessage = await EventContext.reply(`*Недопустимый формат номера телефона, попробуйте снова*`, { parse_mode: `Markdown` })

              RegistrationForm.Customer.Phone.Number = (await this._API.Awaited.Message.Private(CommandChat.id, CommandAuthor.id, undefined))[2]

              await this._API.Client.telegram.deleteMessage(ErrorMessage.chat.id, ErrorMessage.message_id)
            }
            await this._API.Client.telegram.deleteMessage(RequestMessage.chat.id, RequestMessage.message_id)

            await UpdateRegistrationFormMessage(isAdditional)
          }

          const RequestEmailAdress = async (isAdditional: boolean): Promise<void> => {
            if (isAdditional) {
              await UpdateRegistrationFormMessage(!isAdditional)
            }

            const RequestMessage = await EventContext.reply(`Ведите контактный адрес электронной почты в формате \`email@adress.domain\``, { parse_mode: `Markdown` })

            RegistrationForm.Customer.EMail.Adress = (await this._API.Awaited.Message.Private(CommandChat.id, CommandAuthor.id, undefined))[2]
            while (!Validator.Soft(RegistrationForm.Customer.EMail.Adress, EMailAdressValidator).Status) {
              const ErrorMessage = await EventContext.reply(`*Недопустимый формат адреса электронной почты, попробуйте снова*`, { parse_mode: `Markdown` })

              RegistrationForm.Customer.EMail.Adress = (await this._API.Awaited.Message.Private(CommandChat.id, CommandAuthor.id, undefined))[2]

              await this._API.Client.telegram.deleteMessage(ErrorMessage.chat.id, ErrorMessage.message_id)
            }
            await this._API.Client.telegram.deleteMessage(RequestMessage.chat.id, RequestMessage.message_id)

            await UpdateRegistrationFormMessage(isAdditional)
          }

          const RequestGrade = async (isAdditional: boolean): Promise<void> => {
            if (isAdditional) {
              await UpdateRegistrationFormMessage(!isAdditional)
            }

            const Subjects = GlobalModule.DataSet.Dictionary.Subject.default

            const MinimumGrade = Math.min(...Subjects.map((_el, _ind, _arr) => _el.Grade.Minimum))
            const MaximumGrade = Math.max(...Subjects.map((_el, _ind, _arr) => _el.Grade.Maximum))

            const GradesDelta = MaximumGrade - MinimumGrade

            const Grades = Array.from(Array(GradesDelta + 1), (__el, __ind) => __ind + MinimumGrade)

            const GradePrefix = `registration_form_choose_grade_`

            const RequestButtons = Grades.map((_el, _ind, _arr) =>
              Telegram.Module.Dependencies.telegraf.Markup.button.callback(
                `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Star.On} ${_el}`,
                `${GradePrefix}${_ind}`,
                false
              )
            )

            const RequestMessage = await EventContext.reply(`*Выберите нужный класс обучения*`, {
              parse_mode: `Markdown`,
              reply_markup: {
                inline_keyboard: [...RequestButtons.map((_el, _ind, _arr) => [_el])],
              },
            })

            const GradeButtonInteraction = await this._API.Awaited.Action.Component.Button.Private(new RegExp(`^${GradePrefix}\\d+$`), CommandAuthor.id, undefined)
            await GradeButtonInteraction[0].answerCbQuery()

            const GradeID = Number.parseInt(GradeButtonInteraction[2].slice(GradePrefix.length, GradeButtonInteraction[2].length))
            const Grade = Grades[GradeID]

            const SubjectsByNewGrade = RegistrationForm.Subjects.filter(
              (_el, _ind, _arr) => Grade === ServerCore.Module.Functions.Parameter.Type.Manager.Default.Numeric.ToRange(Grade, _el.Grade.Minimum, _el.Grade.Maximum)
            )
            RegistrationForm.Child.Grade = Grade

            ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Clear(RegistrationForm.Subjects)

            RegistrationForm.Subjects.push(...SubjectsByNewGrade)

            await this._API.Client.telegram.deleteMessage(RequestMessage.chat.id, RequestMessage.message_id)

            await UpdateRegistrationFormMessage(isAdditional)
          }

          const RequestSubjects = async (isAdditional: boolean): Promise<void> => {
            if (isAdditional) {
              await UpdateRegistrationFormMessage(!isAdditional)
            }

            const RequestMessage = await EventContext.reply(`*Выберите желаемые предметы*`, {
              parse_mode: `Markdown`,
              reply_markup: {
                inline_keyboard: [],
              },
            })

            const RenderSubjectsRequest = async (): Promise<void> => {
              const Subjects = GlobalModule.DataSet.Dictionary.Subject.default

              const Grade = RegistrationForm.Child.Grade
              const DoesGradeExist = !Validator.TypeGuard.Default.IsNullOrUndefined(Grade)

              const SubjectsByGrade = DoesGradeExist
                ? Subjects.filter(
                    (_el, _ind, _arr) => Grade === ServerCore.Module.Functions.Parameter.Type.Manager.Default.Numeric.ToRange(Grade, _el.Grade.Minimum, _el.Grade.Maximum)
                  )
                : Subjects

              const SubjectsConfirmButtonID = `registration_form_subjects_confirm`
              const SubjectsConfirmButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
                `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Output.Status.Success.Colored} Подтвердить`,
                SubjectsConfirmButtonID,
                false
              )

              const SubjectIDPrefix = `registration_form_subject_choose_`

              const SubjectButtons = SubjectsByGrade.map((_el, _ind, _arr) => {
                const IsSubjectChosen = !Validator.TypeGuard.Default.IsNullOrUndefined(RegistrationForm.Subjects.find((__el, __ind, __arr) => __el.Name === _el.Name))

                const CheckboxSign = ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Check

                const SubjectButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
                  `${IsSubjectChosen ? `${CheckboxSign.On}` : `${CheckboxSign.Off}`} ${_el.Name}`,
                  `${SubjectIDPrefix}${_ind}`,
                  false
                )

                return SubjectButton
              })

              try {
                await this._API.Client.telegram.editMessageText(RequestMessage.chat.id, RequestMessage.message_id, undefined, `*Выберите желаемые предметы*`, {
                  parse_mode: `Markdown`,
                })
              } catch (APIError) {}

              try {
                await this._API.Client.telegram.editMessageReplyMarkup(RequestMessage.chat.id, RequestMessage.message_id, undefined, {
                  inline_keyboard: [...SubjectButtons.map((_el, _ind, _arr) => [_el]), [SubjectsConfirmButton]],
                })
              } catch (APIError) {}

              const SubjectButtonInteraction = await this._API.Awaited.Action.Component.Button.Private(
                new RegExp(`^(?:(?:${SubjectIDPrefix}\\d+)|(?:${SubjectsConfirmButtonID}))$`),
                CommandAuthor.id,
                undefined
              )
              await SubjectButtonInteraction[0].answerCbQuery()

              if (SubjectButtonInteraction[2] === SubjectsConfirmButtonID) {
                await this._API.Client.telegram.deleteMessage(RequestMessage.chat.id, RequestMessage.message_id)

                await UpdateRegistrationFormMessage(isAdditional)
              } else {
                const SubjectID = Number.parseInt(SubjectButtonInteraction[2].slice(SubjectIDPrefix.length, SubjectButtonInteraction[2].length))
                const Subject = SubjectsByGrade[SubjectID]

                const DoesSubjectAlreadyExist = !Validator.TypeGuard.Default.IsNullOrUndefined(RegistrationForm.Subjects.find((_el, _ind, _arr) => _el.Name === Subject.Name))

                if (!DoesSubjectAlreadyExist) {
                  RegistrationForm.Subjects.push(Subject)
                } else {
                  const RestSubjects = RegistrationForm.Subjects.filter((_el, _ind, _arr) => _el.Name !== Subject.Name)

                  ServerCore.Module.Functions.Parameter.Type.Manager.Default.Array.Clear(RegistrationForm.Subjects)

                  RegistrationForm.Subjects.push(...RestSubjects)
                }

                await RenderSubjectsRequest()
              }
            }

            await RenderSubjectsRequest()
          }

          const RequestBranch = async (isAdditional: boolean): Promise<void> => {
            const Branches = GlobalModule.DataSet.Dictionary.Branch.default

            const BranchIDPrefix = `registration_form_branch_choose_`

            const RequestButtons = Branches.map((_el, _ind, _arr) =>
              Telegram.Module.Dependencies.telegraf.Markup.button.callback(
                `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Mark.Status.Star.On} ${_el.Name} (${_el.Adress})`,
                `${BranchIDPrefix}${_ind}`,
                false
              )
            )

            if (isAdditional) {
              await UpdateRegistrationFormMessage(!isAdditional)
            }

            const RequestMessage = await EventContext.reply(`*Выберите нужный адрес филиала*`, {
              parse_mode: `Markdown`,
              reply_markup: {
                inline_keyboard: [...RequestButtons.map((_el, _ind, _arr) => [_el])],
              },
            })

            const BranchButtonInteraction = await this._API.Awaited.Action.Component.Button.Private(new RegExp(`^${BranchIDPrefix}\\d+$`), CommandAuthor.id, undefined)
            await BranchButtonInteraction[0].answerCbQuery()

            const BranchID = Number.parseInt(BranchButtonInteraction[2].slice(BranchIDPrefix.length, BranchButtonInteraction[2].length))
            const Branch = Branches[BranchID]

            RegistrationForm.Branch = Branch

            await this._API.Client.telegram.deleteMessage(RequestMessage.chat.id, RequestMessage.message_id)

            await UpdateRegistrationFormMessage(isAdditional)
          }

          await RequestCustomerFullName(false)
          await RequestChildFullName(false)
          await RequestPhoneNumber(false)
          await RequestEmailAdress(false)
          await RequestGrade(false)
          await RequestSubjects(false)
          await RequestBranch(true)

          const RegistrationFormModifyButtons = [
            RegistrationFormModifyCustomerFullNameButtonID,
            RegistrationFormModifyChildFullNameButtonID,
            RegistrationFormModifyPhoneNumberButtonID,
            RegistrationFormModifyEmailAdressButtonID,
            RegistrationFormModifyGradeButtonID,
            RegistrationFormModifySubjectsButtonID,
            RegistrationFormModifyBranchButtonID,
          ]
          const RegistrationFormSubmitButtons = [RegistrationFormSubmitButtonID]

          const ModifyRegistrationForm = async (modifyButton: (typeof RegistrationFormModifyButtons)[number]): Promise<void> => {
            if (modifyButton === RegistrationFormModifyCustomerFullNameButtonID) {
              await RequestCustomerFullName(true)
            }
            if (modifyButton === RegistrationFormModifyChildFullNameButtonID) {
              await RequestChildFullName(true)
            }
            if (modifyButton === RegistrationFormModifyPhoneNumberButtonID) {
              await RequestPhoneNumber(true)
            }
            if (modifyButton === RegistrationFormModifyEmailAdressButtonID) {
              await RequestEmailAdress(true)
            }
            if (modifyButton === RegistrationFormModifyGradeButtonID) {
              await RequestGrade(true)
            }
            if (modifyButton === RegistrationFormModifySubjectsButtonID) {
              await RequestSubjects(true)
            }
            if (modifyButton === RegistrationFormModifyBranchButtonID) {
              await RequestBranch(true)
            }

            await AwaitedRegistrationFormAction()
          }

          const SubmitRegistrationForm = async (submitButton: (typeof RegistrationFormSubmitButtons)[number]): Promise<void> => {
            if (submitButton === RegistrationFormSubmitButtonID) {
              const ResultRegistrationFormMessageToString = GetRegistrationFormMessageToString()

              const RegistrationFormConfirmSubmitionButtonID = `registration_form_submition_confirm`
              const RegistrationFormConfirmSubmitionButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
                `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Output.Status.Success.Colored} Подтвердить`,
                RegistrationFormConfirmSubmitionButtonID,
                false
              )

              const RegistrationFormCancelSubmitionButtonID = `registration_form_submition_cancel`
              const RegistrationFormCancelSubmitionButton = Telegram.Module.Dependencies.telegraf.Markup.button.callback(
                `${ServerCore.Module.DataSet.Dictionary.Symbol.Single.Service.Output.Status.Error.Italic} Отмена`,
                RegistrationFormCancelSubmitionButtonID,
                false
              )

              try {
                await this._API.Client.telegram.editMessageText(
                  RegistrationFormMessage.chat.id,
                  RegistrationFormMessage.message_id,
                  undefined,
                  `*Вы собираетесь отправить форму*\n\n${ResultRegistrationFormMessageToString}\n\nПодтвердите действие, нажав соответствующую кнопку под сообщением`,
                  {
                    parse_mode: `Markdown`,
                  }
                )
              } catch (APIError) {}

              try {
                const InlineKeyboard = [[RegistrationFormConfirmSubmitionButton, RegistrationFormCancelSubmitionButton]]

                await this._API.Client.telegram.editMessageReplyMarkup(RegistrationFormMessage.chat.id, RegistrationFormMessage.message_id, undefined, {
                  inline_keyboard: InlineKeyboard,
                })
              } catch (APIError) {}

              const RegistrationFormSubmitButtonInteraction = await Promise.any(
                [RegistrationFormConfirmSubmitionButtonID, RegistrationFormCancelSubmitionButtonID].map((_el, _ind, _arr) =>
                  this._API.Awaited.Action.Component.Button.Private(new RegExp(`^${_el}$`), CommandAuthor.id, undefined)
                )
              )

              if (RegistrationFormSubmitButtonInteraction[2] === RegistrationFormConfirmSubmitionButtonID) {
                await RegistrationFormSubmitButtonInteraction[0].answerCbQuery(`Заявка отправлена. Администратор скоро свяжется с вами`, { show_alert: false })

                await this._API.Client.telegram.editMessageReplyMarkup(RegistrationFormMessage.chat.id, RegistrationFormMessage.message_id, undefined, {
                  inline_keyboard: [],
                })

                await ConfirmRegistrationFormSubmition()
              }
              if (RegistrationFormSubmitButtonInteraction[2] === RegistrationFormCancelSubmitionButtonID) {
                await RegistrationFormSubmitButtonInteraction[0].answerCbQuery()

                await UpdateRegistrationFormMessage(true)

                await AwaitedRegistrationFormAction()
              }
            }
          }

          const ConfirmRegistrationFormSubmition = async (): Promise<void> => {
            const AdminEMailAdressList = GlobalModule.DataSet.Dictionary.Admin.default.Email.Adress.List
            const CustomerEmailAdress = RegistrationForm.Customer.EMail.Adress!

            const ChosenBranch = RegistrationForm.Branch!

            await EventContext.reply(
              `*Заявка отправлена. Администратор скоро свяжется с вами*\n\nЕсли у вас есть какие-либо вопросы, касающиеся выбранного филиала, можете задать их по телефону \`${ChosenBranch.Phone.Number}\` - \`${ChosenBranch.Name} (${ChosenBranch.Adress})\``,
              { parse_mode: `Markdown` }
            )

            const ResultRegistrationFormMailToString = GetRegistrationFormMailToString()

            const SendResultRegistrationFormMessageToCustomer = async (customerEmailAdress: string): Promise<void> => {
              await GlobalAPI.Mail.GoogleMail.ServiceMail.default.SendMail(customerEmailAdress, `Заявка на курс в Формула ЕГЭ`, {
                Text: ``,
                HTML: `
                  <div>
                    <div>
                      <h1>Благодарим за заполнение заявки на прохождение курсов в Формула ЕГЭ</h1>
                    </div>
                    <div>
                      <b>Ваша заявка была отправлена на рассмотрение. Ниже прилагается копия вашей заявки</b>
                    </div>
                    <br>
                    ${ResultRegistrationFormMailToString}
                    <br>
                    <div>
                      <br>
                      <b>Если у вас есть какие-либо вопросы, касающиеся выбранного филиала, можете задать их по телефону <a href="tel:${ChosenBranch.Phone.Number}">${ChosenBranch.Phone.Number}</a> - <i>${ChosenBranch.Name} (${ChosenBranch.Adress})</i></b>
                    </div>
                  </div>
                  `,
              })
            }

            const SendResultRegistrationFormMessageToAdmin = async (adminEmailAdress: string): Promise<void> => {
              await GlobalAPI.Mail.GoogleMail.ServiceMail.default.SendMail(adminEmailAdress, `Новая заявка на курс`, {
                Text: ``,
                HTML: `
                  <div>
                    <div>
                      <h1>Получена новая заявка на прохождение курсов</h1>
                    </div>
                    <br>
                    ${ResultRegistrationFormMailToString}
                  </div>
                  `,
              })
            }

            await Promise.all([
              ...[CustomerEmailAdress].map((_el, _ind, _arr) => SendResultRegistrationFormMessageToCustomer(_el)),
              ...AdminEMailAdressList.map((_el, _ind, _arr) => SendResultRegistrationFormMessageToAdmin(_el)),
            ])
          }

          const AwaitedRegistrationFormAction = async (): Promise<void> => {
            const RegistrationFormActionInteraction = await Promise.any(
              [...RegistrationFormModifyButtons, ...RegistrationFormSubmitButtons].map((_el, _ind, _arr) =>
                this._API.Awaited.Action.Component.Button.Private(new RegExp(`^${_el}$`), CommandAuthor.id, undefined)
              )
            )
            await RegistrationFormActionInteraction[0].answerCbQuery()

            if (RegistrationFormModifyButtons.includes(RegistrationFormActionInteraction[2])) {
              await ModifyRegistrationForm(RegistrationFormActionInteraction[2])
            }
            if (RegistrationFormSubmitButtons.includes(RegistrationFormActionInteraction[2])) {
              await SubmitRegistrationForm(RegistrationFormActionInteraction[2])
            }
          }

          await AwaitedRegistrationFormAction()
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
