type FAQQuestion = string
type FAQAnswer = string

export interface IFAQ {
  readonly Question: {
    readonly Main: FAQQuestion
    readonly Aliases: Array<FAQQuestion>
  }
  readonly Answer: FAQAnswer
}
