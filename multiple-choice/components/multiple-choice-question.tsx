import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Choice {
  id: string
  text: string
}

interface QuestionData {
  question: string
  // choices: Choice[]
  choices: string[]
  // correctAnswer: string
  // explanation: string
}

interface MultipleChoiceQuestionProps {
  questionData: QuestionData
  onAnswerSelected: (answer: string) => void
}

export function MultipleChoiceQuestion({ questionData, onAnswerSelected }: MultipleChoiceQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  console.log("Question Data:", questionData);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    onAnswerSelected(answer)
  }

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{questionData.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {questionData.choices.map((choice, index) => (
          <Button
            // key={choice.id}
            key={index}
            // variant={selectedAnswer === choice.id ? "default" : "outline"}
            className="w-full justify-start text-left h-auto py-3 px-4"
            onClick={() => handleSelectAnswer(choice)}
            disabled={selectedAnswer !== null}
          >
            {/* <span className="font-bold mr-2">{choice.id}.</span> */}
            {/* {choice.text} */}
            {choice}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
