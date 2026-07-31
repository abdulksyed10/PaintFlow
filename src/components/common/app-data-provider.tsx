"use client";

import { useEffect } from "react";

import { ensureDemoData } from "@/data/services/bootstrap";

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void ensureDemoData();
  }, []);

  return children;
}
