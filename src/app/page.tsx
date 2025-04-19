import { DefaultQueueType } from "@/constants/default-queue-type";
import { NextPage } from "next";
import { redirect } from "next/navigation";

const HomePage: NextPage = () => {
  redirect(`/ladder/tft/${DefaultQueueType.tft}`);
};

export default HomePage;
