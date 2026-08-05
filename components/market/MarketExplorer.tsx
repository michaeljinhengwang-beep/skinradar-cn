"use client";

import { useMemo, useState } from "react";
import { querySkins } from "@/lib/market";
import type {
  MarketFilterOptions,
  MarketSortOption,
  Skin,
} from "@/types/market";
import {
  ALL_MARKET_FILTER_VALUE,
  EXTERIOR_TYPES,
  RARITY_TYPES,
  WEAPON_TYPES,
} from "@/types/market";
import MarketFilters from "./MarketFilters";
import SkinGrid from "./SkinGrid";

type MarketExplorerProps = {
  skins: readonly Skin[];
};

export default function MarketExplorer({ skins }: MarketExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeapon, setSelectedWeapon] =
    useState<MarketFilterOptions["weapon"]>(ALL_MARKET_FILTER_VALUE);
  const [selectedExterior, setSelectedExterior] =
    useState<MarketFilterOptions["exterior"]>(
      ALL_MARKET_FILTER_VALUE,
    );
  const [selectedRarity, setSelectedRarity] =
    useState<MarketFilterOptions["rarity"]>(ALL_MARKET_FILTER_VALUE);
  const [sortOption, setSortOption] =
    useState<MarketSortOption>("default");

  const filteredSkins = useMemo(() => {
    return querySkins(skins, {
      query: searchTerm,
      weapon: selectedWeapon,
      exterior: selectedExterior,
      rarity: selectedRarity,
      sort: sortOption,
    });
  }, [
    searchTerm,
    selectedExterior,
    selectedRarity,
    selectedWeapon,
    skins,
    sortOption,
  ]);

  function resetFilters() {
    setSearchTerm("");
    setSelectedWeapon(ALL_MARKET_FILTER_VALUE);
    setSelectedExterior(ALL_MARKET_FILTER_VALUE);
    setSelectedRarity(ALL_MARKET_FILTER_VALUE);
    setSortOption("default");
  }

  return (
    <div className="mt-10">
      <MarketFilters
        searchTerm={searchTerm}
        selectedWeapon={selectedWeapon}
        selectedExterior={selectedExterior}
        selectedRarity={selectedRarity}
        sortOption={sortOption}
        weaponOptions={WEAPON_TYPES}
        exteriorOptions={EXTERIOR_TYPES}
        rarityOptions={RARITY_TYPES}
        onSearchTermChange={setSearchTerm}
        onWeaponChange={setSelectedWeapon}
        onExteriorChange={setSelectedExterior}
        onRarityChange={setSelectedRarity}
        onSortChange={setSortOption}
        onReset={resetFilters}
      />
      <SkinGrid skins={filteredSkins} />
    </div>
  );
}
