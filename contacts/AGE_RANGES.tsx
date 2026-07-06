export type AgeRange = { label: string; rangeBottom: number; rangeTop: number }
/** This is the required "age range" filter for the contacts list. */
export const AGE_RANGES: AgeRange[] = [
  { label: "Babies", rangeBottom: 0, rangeTop: 2 },
  { label: "Children", rangeBottom: 3, rangeTop: 16 },
  { label: "Young Adults", rangeBottom: 17, rangeTop: 29 },
  { label: "Middle Aged Adults", rangeBottom: 30, rangeTop: 59 },
  { label: "Seniors", rangeBottom: 60, rangeTop: 200 },
]
