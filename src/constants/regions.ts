import type { Region } from "@/types/region";

export const Regions: Region[] = [
  {
    id: "NA",
    name: "Amérique du Nord",
    domain: "na1.api.riotgames.com",
    available: false,
  },
  {
    id: "EUW",
    name: "Europe de l'Ouest",
    domain: "euw1.api.riotgames.com",
    available: true,
  }
];