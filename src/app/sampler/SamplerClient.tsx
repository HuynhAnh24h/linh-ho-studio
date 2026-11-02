"use client";

import React, { useState } from "react";
import { SoundKitItem, ComboOffer, ProfileData } from "@/lib/types";
import { SamplerSection } from "@/components/SamplerSection";
import { ShopSection } from "@/components/ShopSection";

interface SamplerClientProps {
  kits: SoundKitItem[];
  comboOffer: ComboOffer;
  profile: ProfileData;
}

export function SamplerClient({ kits, comboOffer, profile }: SamplerClientProps) {
  const [selectedKitId, setSelectedKitId] = useState<string>(kits[0]?.id || "");

  const handleSelectKitToBuy = (kitId: string) => {
    setSelectedKitId(kitId);
    // Smooth scroll to shop section
    const shopEl = document.getElementById("shop");
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      <SamplerSection
        kits={kits}
        onSelectKitToBuy={handleSelectKitToBuy}
      />
      <div id="shop">
        <ShopSection
          kits={kits}
          comboOffer={comboOffer}
          profile={profile}
          preselectedKitId={selectedKitId}
        />
      </div>
    </div>
  );
}
