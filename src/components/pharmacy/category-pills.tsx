"use client";

import { motion } from "framer-motion";
import { Chip } from "@/components/ui/chip";

export function CategoryPills({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active?: string;
  onSelect: (value?: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip selected={!active} onClick={() => onSelect(undefined)}>
        همه
      </Chip>
      {categories.map((cat, idx) => (
        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
        >
          <Chip selected={active === cat} onClick={() => onSelect(cat)}>
            {cat}
          </Chip>
        </motion.div>
      ))}
    </div>
  );
}
