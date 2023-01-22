import { View, Text, ScrollView, Alert } from "react-native";
import { useCallback, useState } from "react";
import { HabitDay, DAY_SIZE } from "../components/HabitDay";
import { Header } from "../components/Header";
import { generateRangeDatesFromYearStart } from "../utils/generate-range-between-dates";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { api } from "../lib/axios";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const datesFromYersStart = generateRangeDatesFromYearStart();
const minimunSummaryDatesSizes = 18 * 7;
const amountOfDaysToFill = minimunSummaryDatesSizes - datesFromYersStart.length;

type tSummaryProps = {
  id: string;
  date: string;
  amount: number;
  completed: number;
}[];

export function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<tSummaryProps | null>(null);

  const { navigate } = useNavigation();

  async function fetchData() {
    try {
      setLoading(true);
      const res = await api.get("/summary");
      setSummary(res.data);
    } catch (err) {
      Alert.alert("Ops", "Não foi possivel carregar o sumário de hábitos.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />
      <View className="flex-row mt-6 mb-2">
        {weekDays.map((day, i) => {
          return (
            <Text
              key={`${day}-${i}`}
              className="text-zinc-400 text-xl font-bold text-center mx-1"
              style={{ width: DAY_SIZE }}
            >
              {day}
            </Text>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {summary && (
          <View className="flex-row flex-wrap">
            {datesFromYersStart.map((date) => {
              const dayWithHabits = summary.find((day) =>
                dayjs(date).isSame(day.date)
              );

              return (
                <HabitDay
                  key={date.toISOString()}
                  date={date}
                  amountOfHabits={dayWithHabits?.amount}
                  amountCompletede={dayWithHabits?.completed}
                  onPress={() =>
                    navigate("habit", { date: date.toISOString() })
                  }
                />
              );
            })}

            {amountOfDaysToFill > 0 &&
              Array.from({ length: amountOfDaysToFill }).map((v, i) => (
                <View
                  key={`noDay-${i}`}
                  className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                ></View>
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
