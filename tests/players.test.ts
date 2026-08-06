import assert from "node:assert/strict";
import test from "node:test";
import { mockPlayers } from "../data/mock-players.ts";
import { validateMockPlayers } from "../lib/player-validation.ts";
import {
  filterPlayers,
  getPlayerById,
  queryPlayers,
  searchPlayers,
  sortPlayers,
} from "../lib/players.ts";
import type {
  Player,
  PlayerFilterOptions,
  PlayerQueryOptions,
} from "../types/player.ts";

const allFilters: PlayerFilterOptions = {
  query: "",
  team: "all",
  region: "all",
  role: "all",
  status: "all",
};

const defaultQuery: PlayerQueryOptions = {
  ...allFilters,
  sort: "default",
};

test("getPlayerById returns the player for an exact valid id", () => {
  assert.equal(
    getPlayerById(mockPlayers, "demo-player-aeralis")?.nickname,
    "Aeralis",
  );
});

test("getPlayerById returns undefined for an unknown id", () => {
  assert.equal(getPlayerById(mockPlayers, "missing-player"), undefined);
});

test("searchPlayers ignores English letter casing", () => {
  assert.deepEqual(
    searchPlayers(mockPlayers, "  AeRaLiS  ").map((player) => player.id),
    ["demo-player-aeralis"],
  );
});

test("searchPlayers matches nickname", () => {
  assert.deepEqual(
    searchPlayers(mockPlayers, "Solune").map((player) => player.id),
    ["demo-player-solune"],
  );
});

test("searchPlayers matches simulated team", () => {
  assert.equal(searchPlayers(mockPlayers, "Vector Harbor").length, 2);
});

test("searchPlayers matches nationality", () => {
  assert.deepEqual(
    searchPlayers(mockPlayers, "new zealand").map((player) => player.id),
    ["demo-player-elarc"],
  );
});

test("searchPlayers returns a new array for an empty query", () => {
  const results = searchPlayers(mockPlayers, "   ");

  assert.deepEqual(results, mockPlayers);
  assert.notEqual(results, mockPlayers);
});

test("filterPlayers filters by team", () => {
  const results = filterPlayers(mockPlayers, {
    ...allFilters,
    team: "Aurora Grid",
  });

  assert.deepEqual(
    results.map((player) => player.nickname),
    ["Aeralis", "Nyvara"],
  );
});

test("filterPlayers filters by region", () => {
  const results = filterPlayers(mockPlayers, {
    ...allFilters,
    region: "Asia",
  });

  assert.deepEqual(
    results.map((player) => player.nickname),
    ["Brimor", "Rovik"],
  );
});

test("filterPlayers matches any role held by a player", () => {
  const results = filterPlayers(mockPlayers, {
    ...allFilters,
    role: "IGL",
  });

  assert.deepEqual(
    results.map((player) => player.nickname),
    ["Voltane", "Lumaris"],
  );
});

test("filterPlayers filters by status", () => {
  const results = filterPlayers(mockPlayers, {
    ...allFilters,
    status: "Inactive",
  });

  assert.deepEqual(
    results.map((player) => player.nickname),
    ["Nyvara"],
  );
});

test("queryPlayers combines search and multiple filters", () => {
  const results = queryPlayers(mockPlayers, {
    query: "Crimson",
    team: "Crimson Circuit",
    region: "Asia",
    role: "AWPer",
    status: "Active",
    sort: "nickname-asc",
  });

  assert.deepEqual(
    results.map((player) => player.nickname),
    ["Rovik"],
  );
});

test("queryPlayers returns an empty array when no player matches", () => {
  assert.deepEqual(
    queryPlayers(mockPlayers, { ...defaultQuery, query: "no-such-player" }),
    [],
  );
});

test("sortPlayers sorts nicknames A–Z", () => {
  const results = sortPlayers(mockPlayers, "nickname-asc");
  const expected = [...mockPlayers]
    .map((player) => player.nickname)
    .sort((first, second) =>
      first.localeCompare(second, "en", { sensitivity: "base" }),
    );

  assert.deepEqual(
    results.map((player) => player.nickname),
    expected,
  );
});

test("sortPlayers sorts teams A–Z while preserving ties", () => {
  const results = sortPlayers(mockPlayers, "team-asc");
  const auroraPlayers = results
    .filter((player) => player.team === "Aurora Grid")
    .map((player) => player.nickname);

  assert.deepEqual(auroraPlayers, ["Aeralis", "Nyvara"]);
  assert.deepEqual(
    results.map((player) => player.team),
    [...results.map((player) => player.team)].sort((first, second) =>
      first.localeCompare(second, "en", { sensitivity: "base" }),
    ),
  );
});

test("sortPlayers sorts sensitivity from low to high", () => {
  const values = sortPlayers(mockPlayers, "sensitivity-low").map(
    (player) => player.sensitivity,
  );

  assert.deepEqual(values, [...values].sort((first, second) => first - second));
});

test("sortPlayers sorts sensitivity from high to low", () => {
  const values = sortPlayers(mockPlayers, "sensitivity-high").map(
    (player) => player.sensitivity,
  );

  assert.deepEqual(values, [...values].sort((first, second) => second - first));
});

test("default sorting preserves the simulated source order", () => {
  const results = sortPlayers(mockPlayers, "default");

  assert.deepEqual(
    results.map((player) => player.id),
    mockPlayers.map((player) => player.id),
  );
  assert.notEqual(results, mockPlayers);
});

test("query functions do not mutate the source array", () => {
  const before = JSON.stringify(mockPlayers);

  queryPlayers(mockPlayers, {
    ...defaultQuery,
    region: "Europe",
    sort: "sensitivity-high",
  });

  assert.equal(JSON.stringify(mockPlayers), before);
});

test("the complete simulated player dataset passes validation", () => {
  assert.equal(mockPlayers.length, 12);
  assert.deepEqual(validateMockPlayers(mockPlayers), []);
});

test("every simulated player has a mouse value", () => {
  assert.ok(mockPlayers.every((player) => player.mouse.trim().length > 0));
});

test("every simulated player has a keyboard value", () => {
  assert.ok(mockPlayers.every((player) => player.keyboard.trim().length > 0));
});

test("every simulated player has a mousepad value", () => {
  assert.ok(mockPlayers.every((player) => player.mousepad.trim().length > 0));
});

test("every simulated player has a headset value", () => {
  assert.ok(mockPlayers.every((player) => player.headset.trim().length > 0));
});

test("every simulated player has a monitor value", () => {
  assert.ok(mockPlayers.every((player) => player.monitor.trim().length > 0));
});

test("every simulated player has a simulated crosshair code", () => {
  assert.ok(
    mockPlayers.every((player) => player.crosshairCode.trim().length > 0),
  );
});

test("validation reports the precise empty keyboard path", () => {
  const invalidPlayers: Player[] = mockPlayers.map((player) => ({
    ...player,
    roles: [...player.roles],
  }));
  invalidPlayers[2] = { ...invalidPlayers[2], keyboard: "   " };

  assert.ok(
    validateMockPlayers(invalidPlayers).some(
      (error) =>
        error.path === "mockPlayers[2].keyboard" &&
        error.message === "must not be empty",
    ),
  );
});

test("validation reports the precise empty mousepad path", () => {
  const invalidPlayers: Player[] = mockPlayers.map((player) => ({
    ...player,
    roles: [...player.roles],
  }));
  invalidPlayers[4] = { ...invalidPlayers[4], mousepad: "" };

  assert.ok(
    validateMockPlayers(invalidPlayers).some(
      (error) =>
        error.path === "mockPlayers[4].mousepad" &&
        error.message === "must not be empty",
    ),
  );
});

test("validation reports the precise empty headset path", () => {
  const invalidPlayers: Player[] = mockPlayers.map((player) => ({
    ...player,
    roles: [...player.roles],
  }));
  invalidPlayers[6] = { ...invalidPlayers[6], headset: "   " };

  assert.ok(
    validateMockPlayers(invalidPlayers).some(
      (error) =>
        error.path === "mockPlayers[6].headset" &&
        error.message === "must not be empty",
    ),
  );
});

test("validation reports the precise invalid crosshair code path", () => {
  const invalidPlayers: Player[] = mockPlayers.map((player) => ({
    ...player,
    roles: [...player.roles],
  }));
  invalidPlayers[8] = {
    ...invalidPlayers[8],
    crosshairCode: "REAL-CODE",
  };

  assert.ok(
    validateMockPlayers(invalidPlayers).some(
      (error) =>
        error.path === "mockPlayers[8].crosshairCode" &&
        error.message === "must match the simulated format DEMO-XXXX-00",
    ),
  );
});

test("validation reports the precise effectiveDpi path", () => {
  const invalidPlayers: Player[] = mockPlayers.map((player) => ({
    ...player,
    roles: [...player.roles],
  }));
  invalidPlayers[3] = { ...invalidPlayers[3], effectiveDpi: 999 };

  const errors = validateMockPlayers(invalidPlayers);

  assert.ok(
    errors.some(
      (error) =>
        error.path === "mockPlayers[3].effectiveDpi" &&
        error.message === "must equal dpi × sensitivity",
    ),
  );
});
