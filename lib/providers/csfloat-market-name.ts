export type ParsedMarketHashName = {
  readonly weapon: string;
  readonly skinName: string | null;
  readonly exterior: string | null;
};

const ITEM_NAME_PATTERN = /^(.+?)\s+\|\s+(.+)$/u;
const ITEM_PREFIX_PATTERN = /^(?:★\s*)?(?:(?:StatTrak™|Souvenir)\s+)?/u;

export function parseCSFloatMarketHashName(
  marketHashName: string,
  itemName: string,
  wearName: string | null,
): ParsedMarketHashName {
  const normalizedItemName = itemName
    .replace(ITEM_PREFIX_PATTERN, "")
    .trim();
  const match = ITEM_NAME_PATTERN.exec(normalizedItemName);

  if (!match) {
    return {
      weapon: normalizedItemName || marketHashName,
      skinName: null,
      exterior: wearName,
    };
  }

  return {
    weapon: match[1].trim(),
    skinName: match[2].trim(),
    exterior: wearName,
  };
}
