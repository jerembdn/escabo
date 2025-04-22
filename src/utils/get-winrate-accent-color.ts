import { AccentColors } from "kitchn";

export const getWinrateAccentColor = (value: number): keyof AccentColors => {
  switch (true) {
    case value > 65:
      return "success";
    case value > 50:
      return "info";
    case value > 45:
      return "warning";
    default:
      return "danger";
  }
};
