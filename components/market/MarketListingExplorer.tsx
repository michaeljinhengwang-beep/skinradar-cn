"use client";

import { useMemo, useState } from "react";
import {
  getMarketListingFilterOptions,
  queryMarketListings,
} from "@/lib/market-listings";
import {
  ALL_MARKET_FILTER_VALUE,
  type MarketDisplayListing,
  type MarketListingSortOption,
} from "@/types/market";
import MarketListingFilters from "./MarketListingFilters";
import MarketListingGrid from "./MarketListingGrid";

type MarketListingExplorerProps = {
  listings: readonly MarketDisplayListing[];
};

export default function MarketListingExplorer({
  listings,
}: MarketListingExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState<string>(
    ALL_MARKET_FILTER_VALUE,
  );
  const [selectedExterior, setSelectedExterior] = useState<string>(
    ALL_MARKET_FILTER_VALUE,
  );
  const [sortOption, setSortOption] =
    useState<MarketListingSortOption>("default");

  const filterOptions = useMemo(
    () => getMarketListingFilterOptions(listings),
    [listings],
  );
  const filteredListings = useMemo(
    () =>
      queryMarketListings(listings, {
        query: searchTerm,
        weapon: selectedWeapon,
        exterior: selectedExterior,
        sort: sortOption,
      }),
    [
      listings,
      searchTerm,
      selectedExterior,
      selectedWeapon,
      sortOption,
    ],
  );

  function resetFilters() {
    setSearchTerm("");
    setSelectedWeapon(ALL_MARKET_FILTER_VALUE);
    setSelectedExterior(ALL_MARKET_FILTER_VALUE);
    setSortOption("default");
  }

  return (
    <div className="mt-10">
      <MarketListingFilters
        searchTerm={searchTerm}
        selectedWeapon={selectedWeapon}
        selectedExterior={selectedExterior}
        sortOption={sortOption}
        weaponOptions={filterOptions.weapons}
        exteriorOptions={filterOptions.exteriors}
        onSearchTermChange={setSearchTerm}
        onWeaponChange={setSelectedWeapon}
        onExteriorChange={setSelectedExterior}
        onSortChange={setSortOption}
        onReset={resetFilters}
      />
      <MarketListingGrid listings={filteredListings} />
    </div>
  );
}
