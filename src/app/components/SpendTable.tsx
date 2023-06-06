"use client";

import { ChangeEvent, useCallback, useState } from "react";

import { Expense } from "@/app/lib/type";

import {
  Badge,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
  Title,
} from "@tremor/react";
import { normalize } from "../lib/string";
import { formatDate } from "../lib/utils";

type Props = {
  expenses: Expense[];
};

export const SpendTable = ({ expenses }: Props) => {
  const [expensesShown, setExpensesShown] = useState<Expense[]>(expenses);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!expenses) return;

      const {
        target: { value },
      } = event;

      if (!value || value === "") {
        setExpensesShown(expenses);
        return;
      }

      const normalizedValue = normalize(value);

      const filteredExpenses = expenses.filter(
        ({ description, category: { name } }) =>
          normalize(description).includes(normalizedValue) ||
          normalize(name).includes(normalizedValue)
      );

      setExpensesShown(filteredExpenses);
    },
    [expenses]
  );

  return (
    <Card>
      <Title>Last Spendings</Title>
      <TextInput
        className="mt-5"
        onChange={handleInputChange}
        name={"expense-search"}
        placeholder={"Search for a specific spend or category"}
        disabled={!expenses}
      />
      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Details</TableHeaderCell>
            <TableHeaderCell>Cost</TableHeaderCell>
            <TableHeaderCell>Created At</TableHeaderCell>
            <TableHeaderCell>Users</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {expensesShown.map(
            ({
              category,
              cost,
              date,
              id,
              currency_code,
              description,
              users,
            }) => (
              <TableRow key={id}>
                <TableCell>
                  {description} <Badge>{category.name}</Badge>
                </TableCell>
                <TableCell>
                  {currency_code} {cost}
                </TableCell>

                <TableCell>{formatDate(new Date(date).getTime())}</TableCell>

                <TableCell>
                  {users.map(({ user, user_id }) => (
                    <Badge key={user_id}>
                      {user.first_name} {user.last_name}
                    </Badge>
                  ))}
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
