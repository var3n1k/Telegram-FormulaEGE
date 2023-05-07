type SubjectName = string
type SubjectMinimumGrade = number
type SubjectMaximumGrade = number

export interface ISubject {
  readonly Name: SubjectName
  readonly Grade: {
    readonly Minimum: SubjectMinimumGrade
    readonly Maximum: SubjectMaximumGrade
  }
}
