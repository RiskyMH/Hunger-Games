import { DistrictType } from "./districts.js"

export type Sex = "male" | "female"

export interface Learboard {
    district: DistrictType
    // the top position of the leaderboard
    position: number
    year: number
}
