"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupplierList() {
  const suppliers = useLiveQuery(() => repositories.suppliers.getAll(), [], []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this supplier?")) return;

    try {
      await repositories.suppliers.remove(id);
      toast.success("Supplier deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete supplier");
    }
  };

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight">Suppliers</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Manage vendor contacts and purchase account balances locally.</p>
        </div>

        <Button asChild>
          <Link href="/admin/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Supplier
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-black/5 text-neutral-500">
            <tr>
              <th className="px-3 py-3 font-medium">Company</th>
              <th className="px-3 py-3 font-medium">Contact</th>
              <th className="px-3 py-3 font-medium">Phone</th>
              <th className="px-3 py-3 font-medium">Balance</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b border-black/5 last:border-b-0">
                <td className="px-3 py-4">
                  <div>
                    <p className="font-medium text-neutral-950">{supplier.companyName}</p>
                    <p className="text-xs text-neutral-500">{supplier.email ?? "No email"}</p>
                  </div>
                </td>
                <td className="px-3 py-4 text-neutral-600">{supplier.contactPerson ?? "-"}</td>
                <td className="px-3 py-4 text-neutral-600">{supplier.phone}</td>
                <td className="px-3 py-4 text-neutral-600">{supplier.openingBalance}</td>
                <td className="px-3 py-4">
                  <Badge variant={supplier.isActive ? "default" : "secondary"}>
                    {supplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/suppliers/${supplier.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-neutral-500" colSpan={6}>
                  No suppliers yet. Create the first one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
