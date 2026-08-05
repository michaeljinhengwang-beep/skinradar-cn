"use client";

import { useMemo, useState } from "react";
import type {
  ExteriorType,
  Skin,
  SkinRarity,
  WeaponType,
} from "@/types/market";
import {
  EXTERIOR_TYPES,
  RARITY_TYPES,
  WEAPON_TYPES,
} from "@/types/market";
import MarketFilters, { type MarketSortOption } from "./MarketFilters";
import SkinGrid from "./SkinGrid";

type MarketExplorerProps = {
  skins: readonly Skin[];
};

export default function MarketExplorer({ skins }: MarketExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | "">("");
  const [selectedExterior, setSelectedExterior] = useState<ExteriorType | "">(
    "",
  );
  const [selectedRarity, setSelectedRarity] = useState<SkinRarity | "">("");
  const [sortOption, setSortOption] =
    useState<MarketSortOption>("default");

  const weaponOptions = WEAPON_TYPES.filter((weapon) =>
    skins.some((skin) => skin.weapon === weapon),
  );
  const exteriorOptions = EXTERIOR_TYPES.filter((exterior) =>
    skins.some((skin) => skin.exterior === exterior),
  );
  const rarityOptions = RARITY_TYPES.filter((rarity) =>
    skins.some((skin) => skin.rarity === rarity),
  );

  const filteredSkins = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase("en-CA");
    const matches = skins.filter((skin) => {
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        skin.name.toLocaleLowerCase("en-CA").includes(normalizedSearchTerm) ||
        skin.skinName
          .toLocaleLowerCase("en-CA")
          .includes(normalizedSearchTerm) ||
        skin.weapon.toLocaleLowerCase("en-CA").includes(normalizedSearchTerm);
      const matchesWeapon =
        selectedWeapon === "" || skin.weapon === selectedWeapon;
      const matchesExterior =
        selectedExterior === "" || skin.exterior === selectedExterior;
      const matchesRarity =
        selectedRarity === "" || skin.rarity === selectedRarity;

      return (
        matchesSearch &&
        matchesWeapon &&
        matchesExterior &&
        matchesRarity
      );
    });

    const sortedSkins = [...matches];

    switch (sortOption) {
      case "price-asc":
        return sortedSkins.sort(
          (first, second) => first.startingPrice - second.startingPrice,
        );
      case "price-desc":
        return sortedSkins.sort(
          (first, second) => second.startingPrice - first.startingPrice,
        );
      case "change-desc":
        return sortedSkins.sort(
          (first, second) =>
            second.priceChange24h - first.priceChange24h,
        );
      case "change-asc":
        return sortedSkins.sort(
          (first, second) =>
            first.priceChange24h - second.priceChange24h,
        );
      default:
        return sortedSkins;
    }
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
    setSelectedWeapon("");
    setSelectedExterior("");
    setSelectedRarity("");
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
        weaponOptions={weaponOptions}
        exteriorOptions={exteriorOptions}
        rarityOptions={rarityOptions}
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
