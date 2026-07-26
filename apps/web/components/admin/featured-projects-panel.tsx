"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";
import { LuGripVertical, LuStarOff } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  reorderFeaturedProjectsAction,
  unfeatureProjectAction,
} from "@/app/admin/(protected)/projects/actions";
import styles from "./featured-projects-panel.module.scss";

export interface FeaturedProjectItem {
  id: string;
  title: string;
  slug: string;
}

function FeaturedRow({ item, onRemoved }: { item: FeaturedProjectItem; onRemoved: () => void }) {
  const controls = useDragControls();
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await unfeatureProjectAction(item.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Removed from featured");
        onRemoved();
      }
    });
  }

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} className={styles.row}>
      <button
        type="button"
        onPointerDown={(event) => controls.start(event)}
        className={styles.dragHandle}
        aria-label="Drag to reorder"
      >
        <LuGripVertical className={styles.dragIcon} />
      </button>
      <Link href={`/admin/projects/${item.id}`} className={styles.title}>
        {item.title}
      </Link>
      <span className={styles.slug}>/projects/{item.slug}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={pending}
        onClick={handleRemove}
        aria-label="Remove from featured"
      >
        <LuStarOff />
      </Button>
    </Reorder.Item>
  );
}

export function FeaturedProjectsPanel({ items }: { items: FeaturedProjectItem[] }) {
  const router = useRouter();
  const [orderedItems, setOrderedItems] = useState(items);

  useEffect(() => setOrderedItems(items), [items]);

  function handleReorder(next: FeaturedProjectItem[]) {
    setOrderedItems(next);
    void reorderFeaturedProjectsAction(next.map((item) => item.id)).then((result) => {
      if (result?.error) toast.error(result.error);
    });
  }

  if (orderedItems.length === 0) {
    return (
      <Card className={styles.card}>
        <CardContent>
          <p className={styles.empty}>
            No featured projects yet — toggle &ldquo;Featured&rdquo; on a project to add it here, then
            drag to order it.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <CardContent className={styles.content}>
        <p className={styles.hint}>
          Drag to set the order used by the Home page&rsquo;s Featured and Slider display modes.
        </p>
        <Reorder.Group
          axis="y"
          values={orderedItems}
          onReorder={handleReorder}
          className={styles.list}
        >
          {orderedItems.map((item) => (
            <FeaturedRow key={item.id} item={item} onRemoved={() => router.refresh()} />
          ))}
        </Reorder.Group>
      </CardContent>
    </Card>
  );
}
