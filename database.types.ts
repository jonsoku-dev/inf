import type { MergeDeep, SetNonNullable, SetFieldType } from 'type-fest'
import type { Database as DatabaseGenerated } from './database-generated.types'
export type { Json } from './database-generated.types'

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
  }
>