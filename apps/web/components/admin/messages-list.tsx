"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LuTrash2, LuMail, LuMailOpen } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import styles from "./messages-list.module.scss";

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface ActionResult {
  error?: string;
}

export function MessagesList({
  messages,
  onDelete,
  onToggleRead,
}: {
  messages: ContactMessageItem[];
  onDelete: (id: string) => Promise<ActionResult>;
  onToggleRead: (id: string, read: boolean) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await onDelete(id);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  function handleToggleRead(id: string, read: boolean) {
    startTransition(async () => {
      const result = await onToggleRead(id, read);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  if (messages.length === 0) {
    return <p className={styles.empty}>No messages yet.</p>;
  }

  return (
    <div className={styles.list}>
      {messages.map((item) => (
        <div key={item.id} className={styles.card} data-unread={!item.read || undefined}>
          <div className={styles.header}>
            <div>
              <span className={styles.name}>{item.name}</span>
              <a href={`mailto:${item.email}`} className={styles.email}>
                {item.email}
              </a>
            </div>
            <span className={styles.date} title={item.createdAt.toLocaleString()}>
              {item.createdAt.toLocaleString()}
            </span>
          </div>
          <p className={styles.body}>{item.message}</p>
          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => handleToggleRead(item.id, !item.read)}
            >
              {item.read ? <LuMail /> : <LuMailOpen />}
              {item.read ? "Mark unread" : "Mark read"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => handleDelete(item.id)}
              aria-label="Delete"
            >
              <LuTrash2 />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
