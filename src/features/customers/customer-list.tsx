"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { repositories } from "@/data/repositories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerList() {
  const customers = useLiveQuery(() => repositories.customers.getAll(), [], []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await repositories.customers.remove(id);
      toast.success("Customer deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete customer");
    }
  };

  return (
    <Card className="rounded-2xl border-black/5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold tracking-tight">Customers</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Manage billing contacts and opening balances locally.</p>
        </div>

        <Button asChild>
          <Link href="/admin/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Customer
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-black/5 text-neutral-500">
            <tr>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Phone</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Balance</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-black/5 last:border-b-0">
                <td className="px-3 py-4">
                  <div>
                    <p className="font-medium text-neutral-950">{customer.name}</p>
                    <p className="text-xs text-neutral-500">{customer.email ?? "No email"}</p>
                  </div>
                </td>
                <td className="px-3 py-4 text-neutral-600">{customer.phone}</td>
                <td className="px-3 py-4 text-neutral-600">{customer.customerType ?? "-"}</td>
                <td className="px-3 py-4 text-neutral-600">{customer.openingBalance}</td>
                <td className="px-3 py-4">
                  <Badge variant={customer.isActive ? "default" : "secondary"}>
                    {customer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/customers/${customer.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-neutral-500" colSpan={6}>
                  No customers yet. Create the first one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
