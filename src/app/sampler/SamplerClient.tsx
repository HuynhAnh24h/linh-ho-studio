"use client";

import React from "react";
import { SoundKitItem, ComboOffer, ProfileData } from "@/lib/types";
import { ShopSection } from "@/components/ShopSection";

interface SamplerClientProps {
  kits: SoundKitItem[];
  comboOffer: ComboOffer;
  profile: ProfileData;
}

export function SamplerClient({ kits, comboOffer, profile }: SamplerClientProps) {
  return (
    <div className="space-y-12">
      <ShopSection
        kits={kits}
        comboOffer={comboOffer}
        profile={profile}
      />
    </div>
  );
}
