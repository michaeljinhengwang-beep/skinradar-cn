import type {
  CSFloatListingItemResponse,
  CSFloatListingResponse,
  CSFloatListingsResponse,
} from "../../types/csfloat.ts";
import { MarketProviderError } from "./errors.ts";

type UnknownRecord = Record<string, unknown>;

function invalidResponse(message: string): never {
  throw new MarketProviderError("INVALID_RESPONSE", "csfloat", message);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): UnknownRecord {
  if (!isRecord(value)) {
    return invalidResponse(`${path} must be an object.`);
  }

  return value;
}

function requireText(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    return invalidResponse(`${path} must be a non-empty string.`);
  }

  return value.trim();
}

function parseOptionalText(value: unknown, path: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  return requireText(value, path);
}

function parseFloatValue(value: unknown, path: string): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    return invalidResponse(`${path} must be null or a number from 0 to 1.`);
  }

  return value;
}

function parseItem(value: unknown, path: string): CSFloatListingItemResponse {
  const item = requireRecord(value, path);

  return {
    market_hash_name: requireText(
      item.market_hash_name,
      `${path}.market_hash_name`,
    ),
    item_name: requireText(item.item_name, `${path}.item_name`),
    wear_name: parseOptionalText(item.wear_name, `${path}.wear_name`),
    float_value: parseFloatValue(item.float_value, `${path}.float_value`),
  };
}

function parseListing(value: unknown, index: number): CSFloatListingResponse {
  const path = `CSFloat listings[${index}]`;
  const listing = requireRecord(value, path);
  const createdAt = requireText(listing.created_at, `${path}.created_at`);

  if (!Number.isFinite(Date.parse(createdAt))) {
    return invalidResponse(`${path}.created_at must be a valid timestamp.`);
  }

  if (
    typeof listing.price !== "number" ||
    !Number.isFinite(listing.price) ||
    !Number.isInteger(listing.price) ||
    listing.price < 0
  ) {
    return invalidResponse(
      `${path}.price must be a finite non-negative integer in cents.`,
    );
  }

  return {
    id: requireText(listing.id, `${path}.id`),
    created_at: createdAt,
    price: listing.price,
    state: requireText(listing.state, `${path}.state`),
    item: parseItem(listing.item, `${path}.item`),
  };
}

function extractListings(input: unknown): readonly unknown[] {
  if (Array.isArray(input)) {
    return input;
  }

  const envelope = requireRecord(input, "CSFloat listings response");
  if (!Array.isArray(envelope.data)) {
    return invalidResponse(
      "CSFloat listings response.data must be an array.",
    );
  }

  return envelope.data;
}

export function parseCSFloatListingsResponse(
  input: unknown,
): CSFloatListingsResponse {
  return extractListings(input).map(parseListing);
}
