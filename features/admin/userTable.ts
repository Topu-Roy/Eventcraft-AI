import { atom } from "jotai"

/**
 * Number of users to display per page.
 */
export const limitAtom = atom(10)

/**
 * Current page number in the users table.
 */
export const pageAtom = atom(1)

/**
 * Search query for filtering users by email.
 */
export const searchAtom = atom("")
