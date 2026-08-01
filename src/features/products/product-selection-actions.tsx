"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkPlus, CheckCheck, Scale } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  PRODUCT_COMPARE_STORAGE_KEY,
  PRODUCT_SHORTLIST_STORAGE_KEY,
  readStoredIds,
  toggleStoredId,
  writeStoredIds,
} from "@/lib/catalog-storage";

type ProductSelectionActionsProps = {
  productId: string;
  compact?: boolean;
};

export function ProductSelectionActions({ productId, compact = false }: ProductSelectionActionsProps) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);

  useEffect(() => {
    setCompareIds(readStoredIds(PRODUCT_COMPARE_STORAGE_KEY));
    setShortlistIds(readStoredIds(PRODUCT_SHORTLIST_STORAGE_KEY));
  }, []);

  const compareSelected = compareIds.includes(productId);
  const shortlistSelected = shortlistIds.includes(productId);

  const syncCompare = (nextIds: string[]) => {
    if (!compareSelected && compareIds.length >= 3) {
      toast.error("You can compare up to 3 products");
      return;
    }

    setCompareIds(nextIds);
    writeStoredIds(PRODUCT_COMPARE_STORAGE_KEY, nextIds);
  };

  const syncShortlist = (nextIds: string[]) => {
    setShortlistIds(nextIds);
    writeStoredIds(PRODUCT_SHORTLIST_STORAGE_KEY, nextIds);
  };

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2"}>
      <Button
        type="button"
        variant={compareSelected ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => syncCompare(toggleStoredId(compareIds, productId))}
      >
        <Scale className="mr-2 h-4 w-4" />
        {compareSelected ? "In compare" : "Compare"}
      </Button>

      <Button
        type="button"
        variant={shortlistSelected ? "default" : "ghost"}
        size="sm"
        className="rounded-full"
        onClick={() => syncShortlist(toggleStoredId(shortlistIds, productId))}
      >
        {shortlistSelected ? <CheckCheck className="mr-2 h-4 w-4" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
        {shortlistSelected ? "Shortlisted" : "Shortlist"}
      </Button>

      {!compact ? (
        <Button asChild variant="outline" size="sm" className="rounded-full sm:col-span-2">
          <Link href="/products/compare">Open compare board</Link>
        </Button>
      ) : null}
    </div>
  );
}
