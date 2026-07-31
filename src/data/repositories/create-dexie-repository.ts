import type { Table } from "dexie";

import type { EntityMetadata } from "@/data/models";

export interface CrudRepository<TEntity extends { id: string }> {
  getAll(): Promise<TEntity[]>;
  getById(id: string): Promise<TEntity | undefined>;
  create(input: CreateInput<TEntity>): Promise<TEntity>;
  update(id: string, input: UpdateInput<TEntity>): Promise<TEntity>;
  remove(id: string): Promise<void>;
}

export type CreateInput<TEntity> = Omit<TEntity, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
} & Partial<EntityMetadata>;

export type UpdateInput<TEntity> = Partial<Omit<TEntity, "id" | "createdAt" | "updatedAt">>;

function now() {
  return new Date().toISOString();
}

function withDefaults<TEntity extends { id: string } & EntityMetadata>(
  input: CreateInput<TEntity>,
  fallbackId: string
) {
  const timestamp = now();

  return {
    ...input,
    id: input.id ?? fallbackId,
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp,
    isActive: input.isActive ?? true,
  } as TEntity;
}

export function createDexieRepository<TEntity extends { id: string } & EntityMetadata>(
  table: Table<TEntity, string>
): CrudRepository<TEntity> {
  return {
    async getAll() {
      return table.toArray();
    },
    async getById(id: string) {
      return table.get(id);
    },
    async create(input: CreateInput<TEntity>) {
      const record = withDefaults<TEntity>(input, crypto.randomUUID());

      await table.add(record);
      return record;
    },
    async update(id: string, input: UpdateInput<TEntity>) {
      const existingRecord = await table.get(id);

      if (!existingRecord) {
        throw new Error(`Record with id ${id} was not found.`);
      }

      const updatedRecord = {
        ...existingRecord,
        ...input,
        id,
        createdAt: existingRecord.createdAt ?? now(),
        updatedAt: now(),
        isActive: input.isActive ?? existingRecord.isActive ?? true,
      } as TEntity;

      await table.put(updatedRecord);
      return updatedRecord;
    },
    async remove(id: string) {
      await table.delete(id);
    },
  };
}
