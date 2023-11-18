import { DistrictCensus, DistrictType } from "./districts.js";
import { Sex, Learboard } from "./types.js";

export interface ExportedPerson {
    id: number
    district: DistrictType
    name: string,
    sex: Sex,
    age: number
    diedAt: number | null
}

export type ExportedPeople = ExportedPerson[]

export interface ExportedFamily {
    parentMale: number
    parentFemale: number
    children: number[]
}

/** Key: district number */
export type ExportedFamilies = Record<number, ExportedFamily[]>


/** Key: district number */
export type ExportedDistrictCensus = Record<number, DistrictCensus[]>
/** Key: year number */
export type ExportedLeaderboard = Learboard[]

export interface BasicStats {
    lastYear: number

}

export interface ExportedData {
    people: ExportedPeople,
    districtCensus: ExportedDistrictCensus,
    leaderboard: ExportedLeaderboard,
    families: ExportedFamilies,
    metadata: {
        date: string,
        years_simulated: number,
        people_per_district: number,
    }

}
