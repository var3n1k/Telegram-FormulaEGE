import * as ServerCore from '@var3n1k/server-core'

import * as Telegram from '@var3n1k/telegram'

const TelegramToken = ServerCore.Module.Classes.Process.Env.TELEGRAM_TOKEN as string

const TelegramEventHandlersPath = ServerCore.Module.Classes.FileSystem.GetPathFromRootDirectory(import.meta.url, [`Events`])
const TelegramMessageHandlersPath = ServerCore.Module.Classes.FileSystem.GetPathFromRootDirectory(import.meta.url, [`Messages`])
const TelegramActionComponentHandlersPath = ServerCore.Module.Classes.FileSystem.GetPathFromRootDirectory(import.meta.url, [`Action`, `Components`])
const TelegramCommandHandlersPath = ServerCore.Module.Classes.FileSystem.GetPathFromRootDirectory(import.meta.url, [`Commands`])

const TelegramAPI = new Telegram.default(TelegramToken, {
  Handler: {
    Event: {
      Directory: TelegramEventHandlersPath,
    },
    Message: {
      Directory: TelegramMessageHandlersPath,
    },
    Action: {
      Component: {
        Directory: TelegramActionComponentHandlersPath,
      },
    },
    Command: {
      Directory: TelegramCommandHandlersPath,
    },
  },
})

export default TelegramAPI
