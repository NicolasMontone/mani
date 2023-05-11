"use client";
import {
  BadgeDelta,
  Button,
  Card,
  DeltaType,
  DonutChart,
  Flex,
  Toggle,
  ToggleItem,
  Bold,
  Divider,
  List,
  ListItem,
  Metric,
  Text,
  Title,
  Legend,
  DateRangePicker,
  DateRangePickerValue,
  MultiSelectBox,
  MultiSelectBoxItem,
  BarChart,
} from "@tremor/react";

import { ViewListIcon, ChartPieIcon } from "@heroicons/react/outline";

import { ArrowNarrowRightIcon } from "@heroicons/react/solid";

import { useEffect, useState } from "react";
import { CategoryInsights, Expense } from "@/app/lib/type";
import { groupByCategory, groupByCategoryByDay } from "@/app/lib/utils";
import { endOfMonth, set, startOfMonth } from "date-fns";

const valueFormatter = (number: number) =>
  `$ ${Intl.NumberFormat("us").format(number).toString()}`;

type Props = {
  expenses: Expense[];
};

const colors = [
  "lime",
  "violet",
  "teal",
  "cyan",
  "amber",
  "orange",
  "purple",
  "indigo",
  "blue",
  "emerald",
  "fuchsia",
  "yellow",
  "red",
  "sky",
  "pink",
  "rose",
  "gray",
  "stone",
  "green",
  "zinc",
  "neutral",

  "slate",
] as const;

function revertOrtderOfArray(array: any[]) {
  const newArray = [];
  for (let i = array.length - 1; i >= 0; i--) {
    newArray.push(array[i]);
  }
  return newArray;
}

export const SpendChart = ({ expenses }: Props) => {
  const [dateRange, setDateRange] = useState<DateRangePickerValue>([
    new Date(2022, 1, 1),
    new Date(),
  ]);

  const [minDate, maxDate] = dateRange;

  const [selectedView, setSelectedView] = useState("chart");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.from({ length: 100 }, (_, index) => index.toString())
  );

  const users = expenses
    .flatMap(({ users }) => users)
    .filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj.user.id).indexOf(obj.user.id) === pos;
    });

  const expensesFilteredByDate = expenses.filter(
    ({ created_at }) =>
      !minDate ||
      !maxDate ||
      (created_at >= minDate.toISOString() &&
        created_at <= maxDate.toISOString())
  );

  const expensesFilteredByPerson = expensesFilteredByDate.filter(
    ({ users }) =>
      !selectedUserIds ||
      users.every(({ user }) => selectedUserIds.includes(user.id.toString()))
  );

  const expensesFilteredByCategory = expensesFilteredByPerson.filter(
    ({ category }) =>
      !selectedCategories ||
      selectedCategories.length === 0 ||
      selectedCategories.includes(category.id.toString())
  );

  const categoryInsights: CategoryInsights[] = groupByCategory(
    expensesFilteredByCategory
  );

  const categoryInsightsByDay = groupByCategoryByDay(
    expensesFilteredByCategory
  );

  const allCategories = expenses
    .map(({ category }) => category)
    .filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos;
    });

  const total = categoryInsights.reduce((acc, { total }) => acc + total, 0);

  const now = new Date();

  // array of objects containing text prop with the name of the month
  // and a minDate and maxDate props with the start and end of the month
  // of that month in the current year
  const monthRanges = Array.from({ length: 12 })
    .map((_, index) => now.getMonth() - index || now.getMonth() - index + 12)
    .map((monthIndex) => {
      const month = monthIndex;
      const year = now.getFullYear();
      const startDate = startOfMonth(new Date(year, month, 1));
      const endDate = endOfMonth(new Date(year, month, 1));
      return {
        text: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
          startDate
        ),
        startDate,
        endDate,
        value: month.toString(),
      };
    });

  return (
    <Card className="mx-auto">
      <Flex className="space-x-8" justifyContent="between" alignItems="center">
        <Title>Overview</Title>
        <Toggle
          defaultValue="chart"
          color="gray"
          onValueChange={(value) => setSelectedView(value)}
        >
          <ToggleItem value="chart" icon={ChartPieIcon} />
          <ToggleItem value="list" icon={ViewListIcon} />
        </Toggle>
      </Flex>
      <Text className="mt-8">Total</Text>
      <Metric>{valueFormatter(total)}</Metric>
      <Divider />
      <Flex>
        <DateRangePicker
          className="max-w-md mx-auto"
          value={dateRange}
          onValueChange={setDateRange}
          dropdownPlaceholder="Seleccionar"
          options={monthRanges}
        />

        <MultiSelectBox
          value={selectedUserIds}
          onValueChange={setSelectedUserIds}
        >
          {users.map(({ user: { id, first_name, last_name } }) => (
            <MultiSelectBoxItem
              key={id}
              value={id.toString()}
              text={`${first_name} ${last_name}`}
            />
          ))}
        </MultiSelectBox>

        <MultiSelectBox
          value={selectedCategories}
          onValueChange={setSelectedCategories}
        >
          {allCategories.map(({ name, id }) => (
            <MultiSelectBoxItem key={id} value={id.toString()} text={name} />
          ))}
        </MultiSelectBox>
      </Flex>

      {selectedView === "chart" ? (
        <>
          <Legend
            categories={allCategories.map(({ name }) => name)}
            className="mt-6"
            colors={[...colors]}
          />
          <DonutChart
            data={categoryInsights}
            category="total"
            index="name"
            valueFormatter={valueFormatter}
            className="mt-6 w-full h-64"
            showLabel
            colors={[...colors]}
            showAnimation={false}
          />

          <BarChart
            className="mt-6"
            data={Object.entries(categoryInsightsByDay).flatMap(
              ([date, categories]) => ({
                name: new Date(Number(date)).toLocaleDateString(),
                ...Object.fromEntries(
                  categories.map(({ name, total }) => [name, total])
                ),
              })
            )}
            index="name"
            categories={allCategories.map(({ name }) => name)}
            colors={[...colors]}
            valueFormatter={valueFormatter}
            stack
          />
        </>
      ) : (
        <>
          <Flex className="mt-8" justifyContent="between">
            <Text className="truncate">
              <Bold>Stocks</Bold>
            </Text>
            <Text>Since transaction</Text>
          </Flex>
          <List className="mt-4">
            {categoryInsights.map((category) => (
              <ListItem key={category.name}>
                <Text>{category.name}</Text>
                <Flex justifyContent="end" className="space-x-2">
                  <Text>
                    ${" "}
                    {Intl.NumberFormat("us").format(category.total).toString()}
                  </Text>
                </Flex>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Card>
  );
};