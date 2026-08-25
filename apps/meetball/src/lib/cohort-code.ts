/** Cohort display names look like `MDPM1`, `GD9`, `UK-AIGD5`. */
const COHORT_CODE = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/

export interface CohortCodeResult {
  ok: boolean
  value: string
  error?: string
}

export function parseCohortCode(input: unknown): CohortCodeResult {
  if (typeof input !== "string") {
    return { ok: false, value: "", error: "Type a cohort code to start." }
  }
  const value = input.trim().toUpperCase()
  if (value.length === 0) {
    return { ok: false, value, error: "Type a cohort code to start." }
  }
  if (value.length > 24) {
    return { ok: false, value, error: "That is too long for a cohort code." }
  }
  if (!COHORT_CODE.test(value)) {
    return {
      ok: false,
      value,
      error: "Cohort codes are letters, digits and dashes — like MDPM1 or UK-AIGD5.",
    }
  }
  return { ok: true, value }
}
