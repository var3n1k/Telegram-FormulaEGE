import * as ServerCore from '@var3n1k/server-core'

import * as Telegram from '@var3n1k/telegram'

import * as GlobalModule from '../../../module/@module.mjs'

import * as GlobalAPI from '../../@api.mjs'

const MessageContentPattern = /^.*$/im

export default class MessageHandler extends Telegram.Module.Classes.Handler.Message.default {
  constructor(api: Telegram.Module.Classes.API.default) {
    const Validator = ServerCore.Module.Classes.Validator
    Validator.Strict(api, new Validator().Default.Class.Instance().Required().Of(Telegram.Module.Classes.API.default))

    super(
      api,
      MessageContentPattern,
      {
        Private: {
          Global: true,
        },
        Public: {
          Chat: {
            Global: false,
          },
        },
      },
      {
        Private: async (..._) => {
          const [EventContext, Message, MessageContent, MessageChat, MessageAuthor] = _

          const MessageAuthorName = this._API.FormUserName(MessageAuthor.username, MessageAuthor.first_name, MessageAuthor.last_name)

          const FAQMessages = GlobalModule.DataSet.Dictionary.FAQ.default

          const SlicedMessageContent = MessageContent.split(/\s+/)

          const MatchedFAQMessages = FAQMessages.filter((_el, _ind, _arr) => {
            const FAQMessageQuestions = [_el.Question.Main.toLowerCase(), ..._el.Question.Aliases.map((__el, __ind, __arr) => __el.toLowerCase())]

            let FAQMessageQuestionMatch: boolean = false
            for (let i = 0; i < FAQMessageQuestions.length; i++) {
              const FAQMessageQuestion = FAQMessageQuestions[i]

              const SlicedFAQMessageQuestion = FAQMessageQuestion.split(/\s+/)

              const MatchedSlicedFAQMessageQuestionWords: Array<string> = []
              for (let j = 0; j < SlicedFAQMessageQuestion.length; j++) {
                const SlicedFAQMessageQuestionWord = SlicedFAQMessageQuestion[j]

                const SlicedFAQMessageQuestionWordMatch = SlicedMessageContent.some((_el, _ind, _arr) => {
                  const IsMessageWordIncludedInFAQMessageQuestionWord = SlicedFAQMessageQuestionWord.includes(_el.toLowerCase())
                  const IsMessageWordLongEnough =
                    _el.length ===
                    ServerCore.Module.Functions.Parameter.Type.Manager.Default.Numeric.ToRange(
                      _el.length,
                      SlicedFAQMessageQuestionWord.length * 0.7,
                      SlicedFAQMessageQuestionWord.length
                    )

                  const IsFAQMessageQuestionWordIncludedInMessageWord = _el.includes(SlicedFAQMessageQuestionWord)
                  const IsFAQMessageQuestionWordLongEnough =
                    SlicedFAQMessageQuestionWord.length ===
                    ServerCore.Module.Functions.Parameter.Type.Manager.Default.Numeric.ToRange(SlicedFAQMessageQuestionWord.length, _el.length * 0.7, _el.length)

                  const IsSlicedFAQMessageQuestionWordMatched =
                    (IsMessageWordIncludedInFAQMessageQuestionWord && IsMessageWordLongEnough) ||
                    (IsFAQMessageQuestionWordIncludedInMessageWord && IsFAQMessageQuestionWordLongEnough)

                  return IsSlicedFAQMessageQuestionWordMatched
                })

                if (SlicedFAQMessageQuestionWordMatch) {
                  MatchedSlicedFAQMessageQuestionWords.push(SlicedFAQMessageQuestionWord)
                }
              }

              const MatchedSlicedFAQMessageQuestionWordsValue = MatchedSlicedFAQMessageQuestionWords.length / SlicedFAQMessageQuestion.length

              if (MatchedSlicedFAQMessageQuestionWordsValue > 0.7) {
                FAQMessageQuestionMatch = true
              }
            }

            return FAQMessageQuestionMatch
          })

          const [MatchedFAQMessage] = MatchedFAQMessages
          const DoesMatchedFAQMessageExist = !Validator.TypeGuard.Default.IsNullOrUndefined(MatchedFAQMessage)

          if (DoesMatchedFAQMessageExist) {
            const MatchedFAQMessageAnswer = MatchedFAQMessage.Answer

            await EventContext.reply(`*${MatchedFAQMessageAnswer}*`, { parse_mode: `Markdown` })
          }
        },
        Public: {
          Chat: async (..._) => {
            const [EventContext, Message, MessageContent, MessageChat, MessageAuthor] = _
          },
        },
      }
    )
  }
}
