type ServiceName = string
type ServiceDescription = string
type ServicePrice = number

export interface IService {
  readonly Name: ServiceName
  readonly Description: ServiceDescription
  readonly Price: ServicePrice
}
