import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import type { CommonMasterFixture, ScenarioFixture } from "./types";

const readYaml = <T>(path: string): T => {
  const absolutePath = resolve(path);
  const raw = readFileSync(absolutePath, "utf8");
  return YAML.parse(raw) as T;
};

export const loadCommonMasterFixture = (path: string): CommonMasterFixture => readYaml<CommonMasterFixture>(path);

export const loadScenarioFixture = (path: string): ScenarioFixture => readYaml<ScenarioFixture>(path);

export const loadScenarioFixtures = (paths: string[]): ScenarioFixture[] =>
  paths.map((path) => loadScenarioFixture(path));
