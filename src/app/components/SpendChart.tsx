"use client";
import {
  BarChart,
  Bold,
  Card,
  DateRangePicker,
  DateRangePickerValue,
  Divider,
  DonutChart,
  Flex,
  List,
  ListItem,
  Metric,
  MultiSelectBox,
  MultiSelectBoxItem,
  SelectBox,
  SelectBoxItem,
  Text,
  Title,
  Toggle,
  ToggleItem,
} from "@tremor/react";

import { ChartPieIcon, ViewListIcon } from "@heroicons/react/outline";

import { CategoryInsight, Expense, splitwiseCategories } from "@/app/lib/type";
import {
  formatDate,
  groupByCategory,
  groupByCategoryByDay,
  groupByCategoryByWeek,
} from "@/app/lib/utils";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useCallback, useState } from "react";

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

export const SpendChart = ({ expenses }: Props) => {
  const [dateRange, setDateRange] = useState<DateRangePickerValue>([
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    new Date(),
  ]);

  const handleDatePickerValueChange = useCallback(
    ([start, end]: DateRangePickerValue) => {
      setDateRange([start, end ? endOfDay(end) : undefined]);
    },
    []
  );

  const [minDate, maxDate] = dateRange;
  const [selectedView, setSelectedView] = useState("chart");
  const [groupedBy, setGroupedBy] = useState<"day" | "week">("day");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    splitwiseCategories.filter((c) => c !== "18")
  );
  const [isMultiCategory, setIsMultiCategory] = useState("true");

  const users = expenses
    .flatMap(({ users }) => users)
    .filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj.user.id).indexOf(obj.user.id) === pos;
    });

  const expensesFilteredByDate = expenses.filter(
    ({ date }) => !minDate || !maxDate || (date >= minDate && date <= maxDate)
  );

  const expensesFilteredByCategory = expensesFilteredByDate.filter(
    ({ category }) =>
      !selectedCategories ||
      selectedCategories.length === 0 ||
      selectedCategories.includes(String(category.id))
  );

  const categoryInsights: CategoryInsight[] = groupByCategory(
    expensesFilteredByCategory
  );

  const categoryInsightsByDay = groupByCategoryByDay(
    expensesFilteredByCategory
  );

  const categoryInsightsByWeek = groupByCategoryByWeek(
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

  const lastXDays = (days: number) => ({
    text: `Last ${days} days`,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * days),
    endDate: new Date(),
    value: `last${days}Days`,
  });

  // last monday to sunday perdiod
  const lastWeek = {
    text: "Last week",
    startDate: startOfWeek(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)),
    endDate: endOfWeek(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)),
    value: "lastWeek",
  };

  const dateRangeOptions = [
    lastXDays(7),
    lastWeek,
    lastXDays(30),
    ...monthRanges,
  ];

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

      <Divider />
      <Flex style={{ flexWrap: "wrap" }} className="gap-2">
        <DateRangePicker
          className="max-w-md mx-auto"
          value={dateRange}
          onValueChange={handleDatePickerValueChange}
          dropdownPlaceholder="Seleccionar"
          options={dateRangeOptions}
          style={{ flex: 3 }}
        />
        {isMultiCategory === "true" ? (
          <MultiSelectBox
            value={selectedCategories}
            onValueChange={setSelectedCategories}
            style={{ flex: 3 }}
          >
            {allCategories.map(({ name, id }) => (
              <MultiSelectBoxItem key={id} value={id.toString()} text={name} />
            ))}
          </MultiSelectBox>
        ) : (
          <SelectBox
            value={selectedCategories[0]}
            onValueChange={(value) => setSelectedCategories([value])}
            style={{ flex: 3 }}
          >
            {allCategories.map(({ name, id }) => (
              <SelectBoxItem key={id} value={id.toString()} text={name} />
            ))}
          </SelectBox>
        )}

        <Toggle
          value={isMultiCategory}
          onValueChange={(value: string) => {
            setIsMultiCategory(value);
            setSelectedCategories(allCategories.map(({ id }) => id.toString()));
          }}
          style={{ flex: 1 }}
        >
          <ToggleItem value={"true"} text="Multi" />
          <ToggleItem value={"false"} text="One" />
        </Toggle>
      </Flex>

      {selectedView === "chart" ? (
        <>
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

          <Toggle
            defaultValue="day"
            onValueChange={setGroupedBy as (v: string) => void}
          >
            <ToggleItem value="day" text="Day" />
            <ToggleItem value="week" text="Week" />
          </Toggle>

          <BarChart
            className="mt-6"
            data={Object.entries(
              groupedBy === "day"
                ? categoryInsightsByDay
                : categoryInsightsByWeek
            ).flatMap(([date, categories]) => {
              const isToday = isSameDay(Number(date), Date.now());
              const isThisWeek = isSameWeek(Number(date), Date.now(), {
                weekStartsOn: 1,
              });
              const name =
                groupedBy == "day" && isToday
                  ? "Today"
                  : groupedBy == "week" && isThisWeek
                  ? "This week"
                  : formatDate(Number(date));
              return {
                name,
                ...Object.fromEntries(
                  categories.map(({ name, total }) => [name, total])
                ),
              };
            })}
            index="name"
            categories={allCategories.map(({ name }) => name)}
            colors={[...colors]}
            valueFormatter={valueFormatter}
            stack
            showLegend={false}
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
