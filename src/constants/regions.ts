import { Region } from "@/types/region";
import { RegionId } from "@prisma/client";

export const Regions: Record<RegionId, Region> = {
  EUW: {
    id: "EUW",
    name: "Europe de l'Ouest",
    routing: {
      platform: "euw1.api.riotgames.com",
      regional: "europe.api.riotgames.com",
    },
    available: true,
  },
};
