"use client";

import { InformationCircleIcon } from "@heroicons/react/solid";

import {
    Card,
    Title,
    Flex,
    Icon,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,

} from "@tremor/react";
import { useState } from "react";
import { ExportedData, useData } from "../lib/get-data";


export default function PeopleList() {
    const [selectedDistrict, setSelectedDistrict] = useState<string | number>("all");
    const [personFilter, setPersonFilter] = useState(
        ['dead', 'alive', 'male', 'female', 'child', 'adult', 'elder']
    );

    const isPersonSelected = (person: ExportedData["people"][0]) =>
        (person.district.toString() === selectedDistrict || selectedDistrict === "all")
    // (personFilter.includes('dead') ? person.diedAt : true) &&
    // (personFilter.includes('alive') ? !person.diedAt : true) &&
    // (personFilter.includes('male') ? person.sex === 'male' : true) &&
    // (personFilter.includes('female') ? person.sex === 'female' : true) &&
    // (personFilter.includes('child') ? person.age > 18 : true) &&
    // (personFilter.includes('adult') ? (person.age >= 18 || person.age < 65) : true) &&
    // (personFilter.includes('elder') ? person.age >= 65 : true);



    // (selectedNames.includes(salesPerson.name) || selectedNames.length === 0);

    // console.log("selectedDistrict", typeof selectedDistrict, selectedDistrict)

    const data = useData()

    if (data.isLoading || !data.data || data.error) return

    return (
        <div className="mt-6">
            <Card>
                <div>
                    <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                        <Title>People in the game</Title>
                        <Icon
                            icon={InformationCircleIcon}
                            variant="simple"
                            tooltip="Shows all the people in the game and all their stats"
                        />
                    </Flex>
                </div>
                <div className="flex space-x-2">
                    <Select
                        className="max-w-full sm:max-w-xs"
                        defaultValue="all"
                        onValueChange={setSelectedDistrict}
                        placeholder={selectedDistrict == 'all' ? "Select District..." : "District " + selectedDistrict}
                    >
                        <>
                            <SelectItem value="all">All Districts</SelectItem>
                            {Object.keys(data.data.districtCensus).map((item) => (
                                <SelectItem key={item} value={item}>
                                    District {item}
                                </SelectItem>
                            ))}
                        </>
                    </Select>


                </div>
                <Table className="mt-6">
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell className="text-right">Sex</TableHeaderCell>
                            <TableHeaderCell className="text-right">District</TableHeaderCell>
                            <TableHeaderCell className="text-right">Age at end</TableHeaderCell>
                            <TableHeaderCell className="text-right">Died at?</TableHeaderCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.data.people
                            .filter((person) => isPersonSelected(person))
                            .map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">{item.sex == 'male' ? "Male" : "Female"}</TableCell>
                                    <TableCell className="text-right">District {item.district}</TableCell>
                                    <TableCell className="text-right">{item.age} years old</TableCell>
                                    <TableCell className="text-right">{item.diedAt ? `Year ${item.diedAt}` : null}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
