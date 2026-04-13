import { buildSystem, runCompletion, runJSON, type RunOptions } from "./client";
import { HANDBOOK } from "./handbook";
import { PERSONA } from "./persona";
import { STAGES, type StageKey } from "./stages";

type RunArgs = {
  stage: StageKey;
  user: string;
  maxTokens?: number;
  temperature?: number;
  useFast?: boolean;
};

function buildRunOpts(args: RunArgs): RunOptions {
  return {
    system: buildSystem({
      persona: PERSONA,
      extraCached: HANDBOOK,
      stageInstruction: STAGES[args.stage],
    }),
    user: args.user,
    maxTokens: args.maxTokens,
    temperature: args.temperature,
    useFast: args.useFast,
  };
}

export async function runStage(args: RunArgs): Promise<string> {
  return runCompletion(buildRunOpts(args));
}

export async function runStageJSON<T>(args: RunArgs): Promise<T> {
  return runJSON<T>(buildRunOpts(args));
}

export { PERSONA, HANDBOOK, STAGES };
export type { StageKey };
