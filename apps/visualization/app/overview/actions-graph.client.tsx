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
  BarChartProps,
  BarChart,
} from "@tremor/react";
import { ExportedData, useData } from "../lib/get-data";
import { districtColors, districtNames } from "./utils";
import { TurnAction } from "../../../game/src/map/map-types";


// the 4 changeable options on columns coloured by districts
const turnActions = {
  [TurnAction.Fight]: "Fight",
  [TurnAction.Hide]: "Hide",
  [TurnAction.Loot]: "Loot",
  [TurnAction.Move]: "Move",
  [TurnAction.Pass]: "Nothing",
} satisfies Record<TurnAction, string>
// const a: ExportedData["districtCensus"]["1"]['12']['bestTurnAction'] = []

function formatBestTurnAction(census: ExportedData["districtCensus"]) {
  // return [{name: "Fight", "District 1": 1, "District 2": 2, ...}...]
  const result = [] as Record<string, number>[] & { Action: string }[]

  for (const turnAction in turnActions) {
    if (turnAction === TurnAction.Pass as any) continue
    result.push({ Action: turnActions[turnAction as any as TurnAction] })
  }

  for (const district in census) {
    const districtCensus = census[district]

    for (const { bestTurnAction } of districtCensus) {
      for (const turnAction in bestTurnAction) {
        const name = turnActions[turnAction as any as TurnAction]
        const districtResult = result.find((r) => (r.Action as any as string) === name)
        districtResult![`District ${district}`] = bestTurnAction[turnAction as any as TurnAction]
      }
    }
  }

  return result
}

export default function ActionsGraph() {
  const data = useData()

  if (data.isLoading || !data.data || data.error) return

  const ageChartArgs: BarChartProps = {
    className: "mt-5 h-72",
    // 5 columns
    // 12 lines in each (the districts)
    data: formatBestTurnAction(data.data.districtCensus),
    index: "Action",
    categories: districtNames,
    colors: districtColors,
    showLegend: false,
    // valueFormatter: (value) => `${value} people`,
    yAxisWidth: 56,
    animationDuration: 700,
    showAnimation: true,
  };


  return (
    <div className="mt-6">
      <Card>
        <>
          <div className="md:flex justify-between">
            <div>
              <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                <Title>Choice action distribution</Title>
                <Icon
                  icon={InformationCircleIcon}
                  variant="simple"
                  tooltip="Shows how the 20 points are spent"
                />
              </Flex>
              <Text>Every district has 20 points to spend</Text>
            </div>
          </div>
          {/* web */}
          <div className="mt-8 hidden sm:block">
            <BarChart {...ageChartArgs} />
          </div>
          {/* mobile */}
          <div className="mt-8 sm:hidden">
            <BarChart
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
