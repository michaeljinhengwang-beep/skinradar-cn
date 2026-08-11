import {
  MARKET_DATA_PROVIDER_NAMES,
} from "../../types/data-provider.ts";
import type {
  MarketDataProviderName,
  NormalizedMarketListing,
  ProviderCurrencyCode,
} from "../../types/data-provider.ts";
import type {
  MarketListingWriteRow,
} from "../../types/market-database.ts";
import { MarketProviderError } from "../providers/errors.ts";

type UnknownRecord = Record<string, unknown>;

const CURRENCIES = new Set<ProviderCurrencyCode>([
  "CAD",
  "USD",
  "UNSPECIFIED",
]);
const PROVIDERS = new Set<string>(MARKET_DATA_PROVIDER_NAMES);
const DECIMAL_PATTERN = /^\d+(?:\.\d{1,9})?$/u;
const PRICE_SCALE = 100_000_000;

function mappingError(message: string): never {
  throw new MarketProviderError(
    "INVALID_RESPONSE",
    "mock",
    `Market database row ${message}`,
  );
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireText(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return mappingError(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalText(value: unknown, field: string) {
  if (value === null) {
    return null;
  }
  return requireText(value, field);
}

function requireTimestamp(value: unknown, field: string) {
  const timestamp = requireText(value, field);
  if (!Number.isFinite(Date.parse(timestamp))) {
    return mappingError(`${field} must be a valid timestamp.`);
  }
  return timestamp;
}

function requireProvider(value: unknown): MarketDataProviderName {
  const provider = requireText(value, "provider");
  if (!PROVIDERS.has(provider)) {
    return mappingError("provider is not supported.");
  }
  return provider as MarketDataProviderName;
}

function requireCurrency(value: unknown): ProviderCurrencyCode {
  const currency = requireText(value, "currency") as ProviderCurrencyCode;
  if (!CURRENCIES.has(currency)) {
    return mappingError("currency is not supported.");
  }
  return currency;
}

function decimalStringToNumber(
  value: unknown,
  field: string,
  maxDecimals: number,
) {
  const decimal = requireText(value, field);
  if (!DECIMAL_PATTERN.test(decimal)) {
    return mappingError(`${field} must be a non-negative decimal string.`);
  }

  const [whole, fraction = ""] = decimal.split(".");
  if (fraction.length > maxDecimals) {
    return mappingError(`${field} exceeds supported decimal precision.`);
  }

  const scaledDigits = `${whole}${fraction.padEnd(maxDecimals, "0")}`;
  if (BigInt(scaledDigits) > BigInt(Number.MAX_SAFE_INTEGER)) {
    return mappingError(`${field} exceeds JavaScript safe precision.`);
  }

  return Number(decimal);
}

function numberToPriceDecimal(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return mappingError("price must be a finite non-negative number.");
  }

  const scaledValue = Math.round(value * PRICE_SCALE);
  if (!Number.isSafeInteger(scaledValue)) {
    return mappingError("price exceeds JavaScript safe precision.");
  }

  const whole = Math.floor(scaledValue / PRICE_SCALE);
  const fraction = String(scaledValue % PRICE_SCALE).padStart(8, "0");
  return `${whole}.${fraction}`;
}

function numberToFloatDecimal(value: number | null) {
  if (value === null) {
    return null;
  }
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    return mappingError("float_value must be null or between 0 and 1.");
  }
  return value.toFixed(9);
}

export function toMarketListingRow(
  listing: NormalizedMarketListing,
): MarketListingWriteRow {
  return {
    external_id: requireText(listing.externalId, "external_id"),
    provider: requireProvider(listing.provider),
    market_hash_name: requireText(
      listing.marketHashName,
      "market_hash_name",
    ),
    weapon: listing.weapon,
    skin_name: listing.skinName,
    exterior: listing.exterior,
    price_amount: numberToPriceDecimal(listing.price),
    currency: requireCurrency(listing.currency),
    float_value: numberToFloatDecimal(listing.floatValue),
    listing_url: listing.listingUrl,
    observed_at: requireTimestamp(listing.observedAt, "observed_at"),
  };
}

export function fromMarketListingRow(
  input: unknown,
): NormalizedMarketListing {
  if (!isRecord(input)) {
    return mappingError("must be an object.");
  }

  return {
    externalId: requireText(input.external_id, "external_id"),
    provider: requireProvider(input.provider),
    marketHashName: requireText(input.market_hash_name, "market_hash_name"),
    weapon: optionalText(input.weapon, "weapon"),
    skinName: optionalText(input.skin_name, "skin_name"),
    exterior: optionalText(input.exterior, "exterior"),
    price: decimalStringToNumber(input.price_amount, "price_amount", 8),
    currency: requireCurrency(input.currency),
    floatValue:
      input.float_value === null
        ? null
        : decimalStringToNumber(input.float_value, "float_value", 9),
    listingUrl: optionalText(input.listing_url, "listing_url"),
    observedAt: requireTimestamp(input.observed_at, "observed_at"),
  };
}
