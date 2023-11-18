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
  Tab,
  TabGroup,
  TabList,
} from "@tremor/react";
import { useState } from "react";
import { ExportedData, useData } from "../lib/get-data";
import { districtColors, districtNames } from "./utils";

function formatPopulation(census: ExportedData["districtCensus"], key: string) {
  const result = [] as Record<string, number>[] & { Year: number }[]
  const keyy = key.toLowerCase() as 'population' | 'deaths' | 'births'

  // census is keyed by district
  // so we need to loop through each district
  for (const district in census) {
    const districtCensus = census[district]

    // and then each year
    for (const { year, [keyy]: value } of districtCensus) {
      // and add it to the result
      const districtResult = result.find((r) => r.Year === year)
      if (districtResult) {
        districtResult[`District ${district}`] = value
      } else {
        result.push({ Year: year, [`District ${district}`]: value })
      }
    }
  }

  return result

}

const keys = ['population', 'deaths', 'births']

export default function PopulationGraph() {

  const [selectedIndex, setSelectedIndex] = useState<number>(1)

  const data = useData()

  if (data.isLoading || !data.data || data.error) return

  const ageChartArgs: LineChartProps = {
    className: "mt-5 h-72",
    // 12 lines (the districts)
    // each year is a column
    data: formatPopulation(data.data.districtCensus, keys[selectedIndex]),
    index: "Year",
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
                <Title>People census</Title>
                <Icon
                  icon={InformationCircleIcon}
                  variant="simple"
                  tooltip="Shows the data grouped by year"
                />
              </Flex>
              <Text>The amount of people who {
                selectedIndex == 0 ? "exist" :
                  selectedIndex == 1 ? "are born" 
                  : "die"
                } year</Text>
            </div>
            <div>
              <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                <TabList variant="solid">
                  <Tab>Population</Tab>
                  <Tab>Deaths</Tab>
                  <Tab>Births</Tab>
                </TabList>
              </TabGroup>
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
