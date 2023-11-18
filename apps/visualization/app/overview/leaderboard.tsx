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
import { districtColors, districtNames } from "./utils";

function formatLeaderboard(leaderboard: ExportedData["leaderboard"]) {
  const result = [] as Record<string, number>[] & { Year: number }[]

  // leaderboard is one large list with {year: 1, district: 1, position: 1}
  // so we need to loop through each district
  for (const { year, district, position } of leaderboard) {
    // and add it to the result
    const districtResult = result.find((r) => r.Year === year)
    if (districtResult) {
      districtResult[`District ${district}`] = position
    } else {
      result.push({ Year: year, [`District ${district}`]: position })
    }
  }

  return result

}

// ordinal ie 1st, 2nd, 3rd, 4th
const valueFormatter = (value: number) => {
  const lastDigit = value % 10
  const lastTwoDigits = value % 100
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${value}st`
  }
  if (lastDigit === 2 && lastTwoDigits !== 12) {
    return `${value}nd`
  }
  if (lastDigit === 3 && lastTwoDigits !== 13) {
    return `${value}rd`
  }
  return `${value}th`
}

export default function LeaderboardGraph() {

  const data = useData()

  if (data.isLoading || !data.data || data.error) return

  const ageChartArgs: LineChartProps = {
    className: "mt-5 h-72",
    // 12 lines (the districts)
    // each year is a column
    data: formatLeaderboard(data.data.leaderboard),
    index: "Year",
    categories: districtNames,
    colors: districtColors,
    showLegend: false,
    valueFormatter,
    yAxisWidth: 56,
  };


  return (
    <div className="mt-6">
      <Card>
        <>
          <div className="md:flex justify-between">
            <div>
              <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                <Title>Rankings</Title>
                <Icon
                  icon={InformationCircleIcon}
                  variant="simple"
                  tooltip="Shows the best player's position in each year and district"
                />
              </Flex>
              <Text>The leaderboard for each year</Text>
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
