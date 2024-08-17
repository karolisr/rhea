import { format } from 'date-fns'

export function dateTimeStringSortable(): string {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
}
