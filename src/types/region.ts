import { RegionId } from "@prisma/client";

export type Region = {
  id: RegionId;
  name: string;
  routing: {
    platform: string;
    regional: string;
  };
  available: boolean;
};
