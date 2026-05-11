import { supabase, getLeaderboard, getGameConfig } from './supabase';
import { adjustedFinishMs } from '../hooks/useLeaderboard';
import { PUBS } from '../constants/pubs';
import type { Team, CheckIn } from '../types/game';

export interface TeamCheckins {
  team: Team;
  rank: number;
  /** keyed by pub_index */
  checkins: Record<number, string>; // pub_index → photo_url
}

export interface PresentationData {
  teams: TeamCheckins[];
  pubNames: string[];
}

export async function fetchPresentationData(): Promise<PresentationData> {
  const [teamsRaw, checkinsRaw, config] = await Promise.all([
    getLeaderboard(),
    supabase.from('checkins').select('*').then(({ data }) => (data ?? []) as CheckIn[]),
    getGameConfig(),
  ]);

  const huntStartedAt = config?.hunt_started_at ?? null;

  const sorted = [...teamsRaw].sort((a, b) => {
    if (a.finished_at && b.finished_at) {
      const diff = adjustedFinishMs(a, huntStartedAt) - adjustedFinishMs(b, huntStartedAt);
      if (diff !== 0) return diff;
      return (a.hint_penalties_seconds ?? 0) - (b.hint_penalties_seconds ?? 0);
    }
    if (a.finished_at) return -1;
    if (b.finished_at) return 1;
    return b.current_pub_index - a.current_pub_index;
  });

  const checkinsByTeam: Record<string, Record<number, string>> = {};
  for (const c of checkinsRaw) {
    if (!checkinsByTeam[c.team_id]) checkinsByTeam[c.team_id] = {};
    checkinsByTeam[c.team_id][c.pub_index] = c.photo_url;
  }

  const teams: TeamCheckins[] = sorted.map((team, i) => ({
    team,
    rank: i + 1,
    checkins: checkinsByTeam[team.id] ?? {},
  }));

  return {
    teams,
    pubNames: PUBS.map((p) => p.name),
  };
}

// Picsum seeds chosen to look like pub/group/outdoor photos
const DEMO_PHOTO_SEEDS = [
  10, 20, 30, 40, 50,
  60, 70, 80, 90, 100,
  110, 120, 130, 140, 150,
  160, 170, 180, 190, 200,
  210, 220, 230, 240, 250,
  260, 270, 280, 290, 300,
];

function picsumUrl(seed: number, w = 800, h = 600) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const DEMO_TEAMS: { name: string; finishOffsetMin: number; hints: number }[] = [
  { name: 'The Salthill Sippers',  finishOffsetMin: 52, hints: 0 },
  { name: 'Quay Street Legends',   finishOffsetMin: 55, hints: 1 },
  { name: 'Corrib Crawlers',       finishOffsetMin: 58, hints: 2 },
  { name: 'The Tribal Thirsty',    finishOffsetMin: 63, hints: 1 },
  { name: 'Eyre Square Warriors',  finishOffsetMin: 70, hints: 0 },
];

export function buildDemoData(): PresentationData {
  const huntStart = new Date('2026-05-30T18:00:00Z');

  const teams: TeamCheckins[] = DEMO_TEAMS.map((t, teamIdx) => {
    const finishedAt = new Date(huntStart.getTime() + t.finishOffsetMin * 60_000).toISOString();
    const hintPenalty = t.hints === 1 ? 120 : t.hints === 2 ? 420 : 0;

    const team: Team = {
      id: `demo-team-${teamIdx}`,
      name: t.name,
      started_at: huntStart.toISOString(),
      finished_at: finishedAt,
      current_pub_index: 6,
      hint_penalties_seconds: hintPenalty,
    };

    const checkins: Record<number, string> = {};
    PUBS.forEach((pub, pubIdx) => {
      checkins[pub.index] = picsumUrl(DEMO_PHOTO_SEEDS[teamIdx * PUBS.length + pubIdx]);
    });

    return { team, rank: teamIdx + 1, checkins };
  });

  return { teams, pubNames: PUBS.map((p) => p.name) };
}
