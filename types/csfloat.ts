export type CSFloatListingItemResponse = {
  readonly market_hash_name: string;
  readonly item_name: string;
  readonly wear_name: string | null;
  readonly float_value: number | null;
};

export type CSFloatListingResponse = {
  readonly id: string;
  readonly created_at: string;
  readonly price: number;
  readonly state: string;
  readonly item: CSFloatListingItemResponse;
};

export type CSFloatListingsResponse = readonly CSFloatListingResponse[];
