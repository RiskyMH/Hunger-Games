"use client";

import { InformationCircleIcon } from "@heroicons/react/solid";

import {
  Card,
  Title,
  Text,
  Flex,
  Icon,
  LineChart,
  LineChartProps,
} from "@tremor/react";
import { ExportedData, useData } from "../lib/get-data";
import { districtNames, districtColors } from "./utils";


function formatAge(people: ExportedData["people"]) {
  // Assuming the data is an array of objects with district and age properties

  // Initialize an empty object to store the intermediate result
  let intermediate = {} as Record<string, Record<string, number>>;

  // Loop through the data array
  for (const item of people) {
    // Get the district and age values of the current item
    const district = item.district;
    const age = item.age;

    // Check if the intermediate object already has a property with the age value
    if (intermediate.hasOwnProperty(age)) {
      // If yes, increment the count of the district by one
      intermediate[age][`District ${district}`] = (intermediate[age][`District ${district}`] || 0) + 1;
    } else {
      // If not, create a new property with the age value and assign an object with the district and count of one
      intermediate[age] = { [`District ${district}`]: 1 };
    }
  }

  // Initialize an empty array to store the final result
  const result = [];

  // Loop through the intermediate object
  for (let key in intermediate) {
    // Get the value of the current key
    let value = intermediate[key];

    // Add a new object to the result array with the age and district properties
    result.push({ age: Number(key), ...value });
  }

  // sort by age
  return result.sort((a, b) => a.age - b.age);
  // return result;
}


export default function AgeGraph() {
  const data = useData()

  if (data.isLoading || !data.data || data.error) return

  const ageChartArgs: LineChartProps = {
    className: "mt-5 h-72",
    // 12 lines (the districts)
    // each age has a value for each district - it is in the same dict
    // ie age 50 has dict of { district1: 1, district2: 2, ... }
    // data.data!.people is the array of people with age and district as props
    data: formatAge(data.data!.people),
    index: "age",
    categories: districtNames,
    colors: districtColors,
    showLegend: false,
    valueFormatter: (value) => `${value} people`,
    yAxisWidth: 56,
  };


  return (
    <div className="mt-6">
      <Card>
        <>
          <div className="md:flex justify-between">
            <div>
              <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                <Title>Age distribution</Title>
                <Icon
                  icon={InformationCircleIcon}
                  variant="simple"
                  tooltip="Shows the age distribution grouped by districts"
                />
              </Flex>
              <Text>The age distribution grouped by districts for the end of the game</Text>
            </div>
          </div>
          {/* web */}
          <div className="mt-8 hidden sm:block">
            <LineChart {...ageChartArgs} />
          </div>
          {/* mobile */}
          <div className="mt-8 sm:hidden">
            <LineChart
              {...ageChartArgs}
              startEndOnly={true}
              showYAxis={false}
            />
          </div>
        </>
      </Card>
    </div>
  );
}
