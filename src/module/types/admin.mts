type EmailAdress = string

export interface IAdminContact {
  readonly Name: string
  readonly Phone: {
    readonly Number: string
  }
}

export interface IAdmin {
  readonly Contact: {
    readonly List: Array<IAdminContact>
  }
  readonly Email: {
    readonly Adress: {
      readonly List: Array<EmailAdress>
    }
  }
}
