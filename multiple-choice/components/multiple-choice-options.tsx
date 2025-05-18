import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuestionData {
  title: string
  options: string[]
  multipleSelection: boolean
}

interface MultipleChoiceQuestionProps {
  optionsData: QuestionData
  onOptionsSelected: (option: string) => void
}

export function MultipleChoiceOptions({ optionsData, onOptionsSelected }: MultipleChoiceQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string | null>(null)
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([])

  const handleSelectOption = (option: string) => {
    setSelectedOptions(prev => (prev ? `${prev}, ${option}` : option))
    setSelectedIndexes(prev => [...prev, optionsData.options.indexOf(option)])
  }

  const handleSelectOptions = () => {
    if (selectedOptions) {
      onOptionsSelected(selectedOptions)
    } else {
      alert("Please select an option")
    }
  }

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{optionsData.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {optionsData.options.map((option, index) => (
          <Button
            key={index}
            variant={selectedIndexes.includes(index) ? "default" : "outline"}
            className="w-full justify-start text-left h-auto py-3 px-4"
            onClick={() => handleSelectOption(option)}
            disabled={selectedIndexes.includes(index)}
          >
            {option}
          </Button>
        ))}
        <Button onClick={handleSelectOptions}>Send</Button>
      </CardContent>
    </Card>
  )
}
