import * as ServerCore from '@var3n1k/server-core'

const GlobalModule = await import(`./module/@module.mjs`)

const Core = new ServerCore.default(
  {
    Custom: GlobalModule.Dependencies,
  },
  {
    Custom: GlobalModule.DataSet,
  },
  {
    Custom: GlobalModule.Functions,
  },
  {
    Custom: GlobalModule.Classes,
  },
  [`.env`]
)

export default Core
