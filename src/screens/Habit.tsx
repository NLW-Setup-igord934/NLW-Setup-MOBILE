import { Alert, ScrollView, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { BackButton } from "../components/BackButton";
import dayjs from "dayjs";
import { ProgressBar } from "../components/ProgressBar";
import { CheckBox } from "../components/CheckBox";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateProgessPercentage } from "../utils/generate-progress-percentage";
import { HabitEmpty } from "../components/HabitEmpty";
import clsx from "clsx";

interface iParmsRoute {
  date: string;
}

interface iDayInfo {
  completedHabits: string[];
  possibleHabits: {
    id: string;
    title: string;
  }[];
}

export function Habit() {
  const [loading, setLoading] = useState(true);
  const [dayInfo, setDayInfo] = useState<iDayInfo | null>(null);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const route = useRoute();
  const { date } = route.params as iParmsRoute;

  const parseDate = dayjs(date);
  const isDateInPast = parseDate.endOf("day").isBefore(new Date());
  const dayOfWeek = parseDate.format("dddd");
  const dayAndMonth = parseDate.format("DD/MM");

  const progress = dayInfo?.possibleHabits.length
    ? generateProgessPercentage(
        dayInfo!.possibleHabits.length,
        completedHabits.length
      )
    : 0;

  async function fetchHabits() {
    try {
      setLoading(true);
      const res = await api.get("/day", { params: { date } });
      setDayInfo(res.data);
      setCompletedHabits(res.data.completedHabits);
    } catch (err) {
      console.log(err);
      Alert.alert(
        "Ops",
        "Não foi possivel carregar as informações do hábitos!"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleHabit(habitId: string) {
    try {
      await api.patch(`/habits/${habitId}/toggle`);
      if (completedHabits.includes(habitId)) {
        setCompletedHabits((prevState) =>
          prevState.filter((habit) => habit !== habitId)
        );
      } else {
        setCompletedHabits((prevState) => [...prevState, habitId]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Ops", "Não foi possivel atualizar o status do hábito!");
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>
        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={progress} />

        <View className="mt-6">
          {dayInfo!.possibleHabits.length > 0 ? (
            dayInfo?.possibleHabits.map((habit) => (
              <CheckBox
                className={clsx("", {
                  ["opacity-50"]: isDateInPast,
                })}
                key={habit.id}
                title={habit.title}
                checked={completedHabits.includes(habit.id)}
                disabled={isDateInPast}
                onPress={() => handleToggleHabit(habit.id)}
              />
            ))
          ) : (
            <HabitEmpty />
          )}
        </View>
        {isDateInPast && (
          <Text className="text-white mt-10 text-center">
            Voçê não pode editar hábitos de datas passadas!
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
