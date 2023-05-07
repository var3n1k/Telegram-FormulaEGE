import * as GlobalModule from '../../@module.mjs'

const Services: Array<GlobalModule.Types.Service.IService> = [
  {
    Name: `Академический час`,
    Description: `Стоимость одного академического часа (45 минут)`,
    Price: 350,
  },
  {
    Name: `Занятие`,
    Description: `Стоимость одного занятия (3 академических часа -> 2 часа 15 минут)`,
    Price: 1050,
  },
  {
    Name: `Олимпиадная дисциплина`,
    Description: `Стоимость одного занятия по олимпиадной физике / математике`,
    Price: 999,
  },
]

export default Services
