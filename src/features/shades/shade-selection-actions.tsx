"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SHADE_COMPARE_STORAGE_KEY, readStoredIds, toggleStoredId, writeStoredIds } from "@/lib/catalog-storage";

type ShadeSelectionActionsProps = {
  shadeId: string;
};

export function ShadeSelectionActions({ shadeId }: ShadeSelectionActionsProps) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    setCompareIds(readStoredIds(SHADE_COMPARE_STORAGE_KEY));
  }, []);

  const compareSelected = compareIds.includes(shadeId);

  const syncCompare = (nextIds: string[]) => {
    if (!compareSelected && compareIds.length >= 3) {
      toast.error("You can compare up to 3 shades");
      return;
    }

    setCompareIds(nextIds);
    writeStoredIds(SHADE_COMPARE_STORAGE_KEY, nextIds);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={compareSelected ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => syncCompare(toggleStoredId(compareIds, shadeId))}
      >
        <Scale className="mr-2 h-4 w-4" />
        {compareSelected ? "In compare" : "Compare"}
      </Button>

      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link href="/shades/compare">Open compare board</Link>
      </Button>
    </div>
  );
}
