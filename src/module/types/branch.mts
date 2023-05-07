type BranchName = string
type BranchAdress = string
type BranchPhoneNumber = string

export interface IBranch {
  readonly Name: BranchName
  readonly Adress: BranchAdress
  readonly Phone: {
    readonly Number: BranchPhoneNumber
  }
}
