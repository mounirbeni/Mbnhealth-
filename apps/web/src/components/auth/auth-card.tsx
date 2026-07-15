"use client";

import type { ComponentProps } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Drop-in replacement for `Card` on auth pages: adds the shared entrance
 * motion and elevated surface treatment so all 8 auth screens (tenant +
 * patient) read as one consistent visual language. */
export function AuthCard({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
      <Card className={cn("surface-elevated", className)} {...props} />
    </motion.div>
  );
}
