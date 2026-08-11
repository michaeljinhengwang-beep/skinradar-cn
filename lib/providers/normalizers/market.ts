import type {
  ExternalMarketListing,
  NormalizedMarketListing,
} from "../../../types/data-provider.ts";
import { MarketProviderError } from "../errors.ts";

function requireText(value: string, field: string, provider: ExternalMarketListing["provider"]) {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new MarketProviderError(
      "NORMALIZATION_ERROR",
      provider,
      `Market listing ${field} must not be empty.`,
    );
  }

  return normalizedValue;
}

function isValidIsoTimestamp(value: string) {
  return value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

export function normalizeExternalMarketListing(
  listing: ExternalMarketListing,
): NormalizedMarketListing {
  if (!Number.isFinite(listing.price) || listing.price < 0) {
    throw new MarketProviderError(
      "NORMALIZATION_ERROR",
      listing.provider,
      "Market listing price must be a finite non-negative number.",
    );
  }

  if (
    listing.floatValue !== null &&
    (!Number.isFinite(listing.floatValue) ||
      listing.floatValue < 0 ||
      listing.floatValue > 1)
  ) {
    throw new MarketProviderError(
      "NORMALIZATION_ERROR",
      listing.provider,
      "Market listing floatValue must be null or a number from 0 to 1.",
    );
  }

  if (!isValidIsoTimestamp(listing.observedAt)) {
    throw new MarketProviderError(
      "NORMALIZATION_ERROR",
      listing.provider,
      "Market listing observedAt must be a valid ISO timestamp.",
    );
  }

  return {
    externalId: requireText(listing.externalId, "externalId", listing.provider),
    marketHashName: requireText(
      listing.marketHashName,
      "marketHashName",
      listing.provider,
    ),
    weapon: requireText(listing.weapon, "weapon", listing.provider),
    skinName: requireText(listing.skinName, "skinName", listing.provider),
    exterior: requireText(listing.exterior, "exterior", listing.provider),
    price: listing.price,
    currency: listing.currency,
    floatValue: listing.floatValue,
    listingUrl: listing.listingUrl,
    provider: listing.provider,
    observedAt: listing.observedAt,
  };
}

export function normalizeExternalMarketListings(
  listings: readonly ExternalMarketListing[],
) {
  return listings.map(normalizeExternalMarketListing);
}
