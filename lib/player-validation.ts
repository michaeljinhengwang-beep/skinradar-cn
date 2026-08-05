import {
  PLAYER_REGIONS,
  PLAYER_ROLES,
  PLAYER_STATUSES,
  PLAYER_TEAMS,
  type Player,
} from "../types/player.ts";

export interface PlayerValidationError {
  path: string;
  message: string;
}

const RESOLUTION_PATTERN = /^\d{3,4}x\d{3,4}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const EFFECTIVE_DPI_TOLERANCE = 0.001;

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function isValidIsoDate(value: string): boolean {
  return ISO_DATE_PATTERN.test(value) && Number.isFinite(Date.parse(value));
}

function isNeutralEquipmentName(value: string): boolean {
  return value === "未公开" || value.startsWith("Demo ");
}

export function validateMockPlayers(
  players: readonly Player[],
): PlayerValidationError[] {
  const errors: PlayerValidationError[] = [];
  const ids = new Map<string, number>();
  const nicknames = new Map<string, number>();

  const addError = (path: string, message: string): void => {
    errors.push({ path, message });
  };

  players.forEach((player, index) => {
    const path = `mockPlayers[${index}]`;
    const trimmedId = player.id.trim();
    const normalizedNickname = player.nickname.trim().toLocaleLowerCase("en");

    if (!trimmedId) {
      addError(`${path}.id`, "must not be empty");
    } else {
      const firstIndex = ids.get(trimmedId);
      if (firstIndex !== undefined) {
        addError(
          `${path}.id`,
          `must be unique; already used by mockPlayers[${firstIndex}].id`,
        );
      } else {
        ids.set(trimmedId, index);
      }
    }

    if (!player.nickname.trim()) {
      addError(`${path}.nickname`, "must not be empty");
    } else {
      const firstIndex = nicknames.get(normalizedNickname);
      if (firstIndex !== undefined) {
        addError(
          `${path}.nickname`,
          `must be unique; already used by mockPlayers[${firstIndex}].nickname`,
        );
      } else {
        nicknames.set(normalizedNickname, index);
      }
    }

    if (!player.realName.trim()) {
      addError(`${path}.realName`, "must not be empty");
    }
    if (!player.team.trim()) {
      addError(`${path}.team`, "must not be empty");
    }
    if (!player.nationality.trim()) {
      addError(`${path}.nationality`, "must not be empty");
    }
    if (player.roles.length === 0) {
      addError(`${path}.roles`, "must contain at least one role");
    }
    if (player.roles.some((role) => !PLAYER_ROLES.includes(role))) {
      addError(`${path}.roles`, "contains an unsupported role");
    }
    if (!Number.isInteger(player.dpi) || player.dpi <= 0) {
      addError(`${path}.dpi`, "must be a positive integer");
    }
    if (!isPositiveFinite(player.sensitivity)) {
      addError(`${path}.sensitivity`, "must be a positive finite number");
    }
    if (!isPositiveFinite(player.effectiveDpi)) {
      addError(`${path}.effectiveDpi`, "must be a positive finite number");
    } else if (
      Math.abs(player.effectiveDpi - player.dpi * player.sensitivity) >
      EFFECTIVE_DPI_TOLERANCE
    ) {
      addError(
        `${path}.effectiveDpi`,
        "must equal dpi × sensitivity",
      );
    }
    if (!isPositiveFinite(player.zoomSensitivity)) {
      addError(`${path}.zoomSensitivity`, "must be a positive finite number");
    }
    if (!RESOLUTION_PATTERN.test(player.resolution)) {
      addError(`${path}.resolution`, "must use a format such as 1920x1080");
    }
    if (!player.aspectRatio.trim()) {
      addError(`${path}.aspectRatio`, "must not be empty");
    }
    if (!isValidIsoDate(player.updatedAt)) {
      addError(`${path}.updatedAt`, "must be a valid ISO date");
    }
    if (!PLAYER_STATUSES.includes(player.status)) {
      addError(`${path}.status`, "must be an allowed player status");
    }
    if (!PLAYER_REGIONS.includes(player.region)) {
      addError(`${path}.region`, "must be an allowed player region");
    }

    if (!player.id.startsWith("demo-player-")) {
      addError(`${path}.id`, "must use the demo-player- prefix");
    }
    if (!PLAYER_TEAMS.includes(player.team)) {
      addError(`${path}.team`, "must use an approved simulated team name");
    }
    if (!player.crosshairCode.startsWith("DEMO-")) {
      addError(`${path}.crosshairCode`, "must use the DEMO- prefix");
    }

    const equipment = [
      ["mouse", player.mouse],
      ["keyboard", player.keyboard],
      ["headset", player.headset],
      ["monitor", player.monitor],
      ["mousepad", player.mousepad],
    ] as const;

    equipment.forEach(([field, value]) => {
      if (!isNeutralEquipmentName(value)) {
        addError(
          `${path}.${field}`,
          'must use a neutral "Demo" name or “未公开”',
        );
      }
    });
  });

  const teams = new Set(players.map((player) => player.team));
  const regions = new Set(players.map((player) => player.region));
  const roleCount = (role: (typeof PLAYER_ROLES)[number]): number =>
    players.filter((player) => player.roles.includes(role)).length;
  const statusCount = (status: (typeof PLAYER_STATUSES)[number]): number =>
    players.filter((player) => player.status === status).length;

  if (teams.size < 5) {
    addError("mockPlayers", "must include at least 5 simulated teams");
  }
  if (regions.size < 4) {
    addError("mockPlayers", "must include at least 4 regions");
  }
  if (roleCount("IGL") < 1) {
    addError("mockPlayers", "must include at least one IGL");
  }
  if (roleCount("AWPer") < 2) {
    addError("mockPlayers", "must include at least two AWPers");
  }
  if (statusCount("Benched") < 1) {
    addError("mockPlayers", "must include at least one Benched player");
  }
  if (statusCount("Inactive") < 1) {
    addError("mockPlayers", "must include at least one Inactive player");
  }

  return errors;
}
