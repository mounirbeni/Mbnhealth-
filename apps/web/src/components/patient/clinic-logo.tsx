"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

interface ClinicLogoProps {
  logoUrl?: string | null;
  name: string;
  color?: string | null;
  size?: number;
  rounded?: "xl" | "2xl";
}

export function ClinicLogo({ logoUrl, name, color, size = 56, rounded = "xl" }: ClinicLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const accent = color ?? "#0EA5E9";
  const radiusClass = rounded === "2xl" ? "rounded-2xl" : "rounded-xl";

  if (logoUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        className={`shrink-0 border border-border object-cover ${radiusClass}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center text-white shadow-sm ${radiusClass}`}
      style={{ backgroundColor: accent, width: size, height: size }}
    >
      <Building2 className="h-1/2 w-1/2" />
    </div>
  );
}
