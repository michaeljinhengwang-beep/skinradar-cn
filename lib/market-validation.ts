import { DEMO_MARKETS } from "../types/market.ts";
import type { Skin } from "../types/market.ts";

export type MarketValidationError = {
  path: string;
  message: string;
};

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2}))?$/;
const demoMarketNames = new Set<string>(DEMO_MARKETS);

function isValidIsoDate(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const datePart = value.slice(0, 10);
  const parsedDatePart = new Date(`${datePart}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDatePart.getTime()) ||
    parsedDatePart.toISOString().slice(0, 10) !== datePart
  ) {
    return false;
  }

  if (value === datePart) {
    return true;
  }

  return Number.isFinite(Date.parse(value));
}

export function validateMarketData(skins: readonly Skin[]) {
  const errors: MarketValidationError[] = [];
  const skinIdIndexes = new Map<string, number>();

  skins.forEach((skin, skinIndex) => {
    const skinPath = `mockSkins[${skinIndex}]`;

    if (skin.id.trim().length === 0) {
      errors.push({ path: `${skinPath}.id`, message: "must not be empty" });
    } else {
      const previousIndex = skinIdIndexes.get(skin.id);

      if (previousIndex !== undefined) {
        errors.push({
          path: `${skinPath}.id`,
          message: `must be unique; duplicates mockSkins[${previousIndex}].id`,
        });
      } else {
        skinIdIndexes.set(skin.id, skinIndex);
      }
    }

    if (skin.name.trim().length === 0) {
      errors.push({ path: `${skinPath}.name`, message: "must not be empty" });
    }

    if (skin.weapon.trim().length === 0) {
      errors.push({
        path: `${skinPath}.weapon`,
        message: "must not be empty",
      });
    }

    if (skin.skinName.trim().length === 0) {
      errors.push({
        path: `${skinPath}.skinName`,
        message: "must not be empty",
      });
    }

    if (!Number.isFinite(skin.startingPrice) || skin.startingPrice < 0) {
      errors.push({
        path: `${skinPath}.startingPrice`,
        message: "must be a finite non-negative number",
      });
    }

    if (
      !Number.isInteger(skin.availableListings) ||
      skin.availableListings < 0
    ) {
      errors.push({
        path: `${skinPath}.availableListings`,
        message: "must be a non-negative integer",
      });
    }

    if (!Number.isFinite(skin.priceChange24h)) {
      errors.push({
        path: `${skinPath}.priceChange24h`,
        message: "must be a finite number",
      });
    }

    if (skin.platforms.length === 0) {
      errors.push({
        path: `${skinPath}.platforms`,
        message: "must contain at least one quote",
      });
    }

    skin.platforms.forEach((quote, quoteIndex) => {
      const quotePath = `${skinPath}.platforms[${quoteIndex}]`;

      if (!demoMarketNames.has(quote.platform)) {
        errors.push({
          path: `${quotePath}.platform`,
          message: "must use an approved neutral demo market name",
        });
      }

      if (!Number.isFinite(quote.price) || quote.price < 0) {
        errors.push({
          path: `${quotePath}.price`,
          message: "must be a finite non-negative number",
        });
      }

      if (!Number.isInteger(quote.listings) || quote.listings < 0) {
        errors.push({
          path: `${quotePath}.listings`,
          message: "must be a non-negative integer",
        });
      }

      if (quote.currency !== "CAD") {
        errors.push({
          path: `${quotePath}.currency`,
          message: "must be CAD",
        });
      }

      if (!isValidIsoDate(quote.updatedAt)) {
        errors.push({
          path: `${quotePath}.updatedAt`,
          message: "must be a valid ISO date",
        });
      }
    });

    if (skin.priceHistory.length === 0) {
      errors.push({
        path: `${skinPath}.priceHistory`,
        message: "must contain at least one point",
      });
    }

    const historyDates = new Set<string>();

    skin.priceHistory.forEach((point, pointIndex) => {
      const pointPath = `${skinPath}.priceHistory[${pointIndex}]`;

      if (!Number.isFinite(point.price) || point.price < 0) {
        errors.push({
          path: `${pointPath}.price`,
          message: "must be a finite non-negative number",
        });
      }

      if (!isValidIsoDate(point.date)) {
        errors.push({
          path: `${pointPath}.date`,
          message: "must be a valid ISO date",
        });
      }

      if (historyDates.has(point.date)) {
        errors.push({
          path: `${pointPath}.date`,
          message: "must be unique within the skin price history",
        });
      } else {
        historyDates.add(point.date);
      }
    });
  });

  if (!skins.some((skin) => skin.isStatTrak)) {
    errors.push({
      path: "mockSkins",
      message: "must include at least one StatTrak skin",
    });
  }

  if (!skins.some((skin) => skin.weapon === "Knife")) {
    errors.push({
      path: "mockSkins",
      message: "must include at least one Knife skin",
    });
  }

  if (!skins.some((skin) => skin.priceChange24h > 0)) {
    errors.push({
      path: "mockSkins",
      message: "must include a positive 24-hour price change",
    });
  }

  if (!skins.some((skin) => skin.priceChange24h < 0)) {
    errors.push({
      path: "mockSkins",
      message: "must include a negative 24-hour price change",
    });
  }

  if (!skins.some((skin) => skin.priceChange24h === 0)) {
    errors.push({
      path: "mockSkins",
      message: "must include a zero 24-hour price change",
    });
  }

  return errors;
}
