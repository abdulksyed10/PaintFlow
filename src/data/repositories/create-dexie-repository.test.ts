import { beforeEach, describe, expect, it } from "vitest";

import { localDatabase } from "@/data/db";
import { productRepository } from "@/data/repositories";

beforeEach(async () => {
  await localDatabase.delete();
  await localDatabase.open();
});

describe("productRepository", () => {
  it("creates, reads, updates, and removes records", async () => {
    const createdProduct = await productRepository.create({
      name: "Test Product",
      slug: "test-product",
      brand: "Test Brand",
      category: "Test Category",
      size: "1",
      unit: "L",
      price: 100,
      stock: 5,
      tintable: false,
      status: "active",
    });

    expect(createdProduct.id).toBeDefined();
    expect(await productRepository.getById(createdProduct.id)).toMatchObject({
      name: "Test Product",
    });

    const updatedProduct = await productRepository.update(createdProduct.id, {
      stock: 12,
      isFeatured: true,
    });

    expect(updatedProduct.stock).toBe(12);
    expect(updatedProduct.isFeatured).toBe(true);

    await productRepository.remove(createdProduct.id);
    await expect(productRepository.getById(createdProduct.id)).resolves.toBeUndefined();
  });
});
