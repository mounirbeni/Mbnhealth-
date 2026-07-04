import { PrismaClient } from "../generated/client";

export * from "../generated/client";
export * from "./permissions";
export * from "./plan-limits";

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

export function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}
