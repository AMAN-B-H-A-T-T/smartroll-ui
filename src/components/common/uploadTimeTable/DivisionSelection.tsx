import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Skeleton } from '@components/ui/skeleton'

import useDivision from './useDivision'
import { SelectionProps } from './utils/selectionInterface'

const DivisionSelection = ({
  title,
  selectedValue,
  selectedValue2,
  onValueChange,
  placeholder,
}: SelectionProps) => {
  const { division } = useDivision()

  return (
    <div className="w-full md:w-[240px] lg:w-[320px]">
      <Card className="h-auto w-full dark:bg-black">
        <CardHeader className="space-y-0 pb-2 pt-2">
          <div className="flex items-center justify-center">
            <CardTitle className="text-center text-base sm:text-lg">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {selectedValue2 ? (
            <Select
              value={selectedValue}
              onValueChange={(value) => {
                onValueChange(value)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {division?.map((div) => (
                  <SelectItem
                    key={div.slug}
                    value={div.slug}
                    className="cursor-pointer"
                  >
                    {div.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <Skeleton className="h-10 w-full sm:h-9" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DivisionSelection
