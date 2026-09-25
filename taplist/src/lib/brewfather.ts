import sample from "../data/sample-batches.json";
import tapNotes from "../data/tap-notes.json";
import { basicAuth, fetchTapBatches } from "./brewfather-query.mjs";

export type TapStatus = "Completed" | "Conditioning" | "Fermenting";

export interface Beer {
  id: string;
  batchNo: number;
  name: string;
  style?: string;
  abv?: number;
  ibu?: number;
  color?: number;
  description?: string;
  packagedOn?: Date;
  brewedOn?: Date;
  tap?: string | number;
  status: TapStatus;
}

interface TapNote {
  tap?: string | number;
  name?: string;
  description?: string;
  hidden?: boolean;
}

type RawBatch = Record<string, any>;

const num = (...values: unknown[]) =>
  values.find((v): v is number => typeof v === "number" && Number.isFinite(v) && v > 0);

function toBeer(raw: RawBatch): Beer | null {
  const note: TapNote = (tapNotes as Record<string, TapNote>)[String(raw.batchNo)] ?? {};
  if (note.hidden) return null;

  return {
    id: raw._id,
    batchNo: raw.batchNo,
    name: note.name ?? raw.recipe?.name ?? raw.name,
    style: raw.recipe?.style?.name,
    abv: num(raw.measuredAbv, raw.recipe?.abv),
    ibu: num(raw.estimatedIbu, raw.recipe?.ibu),
    color: num(raw.estimatedColor, raw.recipe?.color),
    description: note.description ?? (raw.tasteNotes || raw.recipe?.teaser || undefined),
    packagedOn: raw.bottlingDate ? new Date(raw.bottlingDate) : undefined,
    brewedOn: raw.brewDate ? new Date(raw.brewDate) : undefined,
    tap: note.tap,
    status: raw.status,
  };
}

// Coming soon: closest to ready first.
const READINESS: Record<TapStatus, number> = { Completed: 0, Conditioning: 1, Fermenting: 2 };

function sortBeers(a: Beer, b: Beer) {
  if (a.status !== b.status) return READINESS[a.status] - READINESS[b.status];
  if (a.tap != null && b.tap != null) return String(a.tap).localeCompare(String(b.tap), undefined, { numeric: true });
  if (a.tap != null) return -1;
  if (b.tap != null) return 1;
  return b.batchNo - a.batchNo;
}

export async function getTapList() {
  const userId = import.meta.env.BREWFATHER_API_USER_ID ?? process.env.BREWFATHER_API_USER_ID;
  const apiKey = import.meta.env.BREWFATHER_API_KEY ?? process.env.BREWFATHER_API_KEY;

  let raw: RawBatch[];
  let usingSample = false;

  if (userId && apiKey) {
    raw = await fetchTapBatches(basicAuth(userId, apiKey));
  } else if (process.env.NETLIFY) {
    // Never publish sample beers to the live site.
    throw new Error("Missing BREWFATHER_API_USER_ID / BREWFATHER_API_KEY in Netlify environment variables.");
  } else {
    console.warn("[taplist] No Brewfather credentials found, using sample data.");
    raw = sample;
    usingSample = true;
  }

  const beers = raw.map(toBeer).filter((b): b is Beer => b !== null);

  return {
    onTap: beers.filter((b) => b.status === "Completed").sort(sortBeers),
    comingSoon: beers.filter((b) => b.status !== "Completed").sort(sortBeers),
    usingSample,
    updatedAt: new Date(),
  };
}
