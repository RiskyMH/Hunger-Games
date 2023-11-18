"use client";

import {
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
} from "@tremor/react";
import { useData } from "./lib/get-data";
import Loading from "./components/loading";
import PeopleList from "@/app/people/people-list.client";
import AgeGraph from "@/app/overview/age-graph.client";
import ActionsGraph from "./overview/actions-graph.client";
import PopulationGraph from "./overview/population-graph.client";
import LeaderboardGraph from "./overview/leaderboard";


export default function Dashboard() {
  const data = useData()

  const isLoading = data.isLoading
  if (isLoading) {
    // return <Loading />
    return null
  }

  const isError = data.error
  if (isError) {
    return <div className="text-black dark:text-white">Error: {data.error.message}</div>
  }


  return (
    <main className="p-6 sm:p-10">
      <Title>Hunger Games Simulation</Title>
      <Text>Data stats for a run of the game.</Text>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>People</Tab>
        </TabList>
        <TabPanels>
          {/* Graphs */}
          <TabPanel>
            <AgeGraph />
            <ActionsGraph />
            <PopulationGraph />
            <LeaderboardGraph />
          </TabPanel>

          {/* People List */}
          <TabPanel>
            <PeopleList />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
