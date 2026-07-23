import { prisma } from "@portfolio/db/server";
import { MessagesList } from "@/components/admin/messages-list";
import { deleteMessageAction, toggleMessageReadAction } from "./actions";
import styles from "./page.module.scss";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Messages</h1>
      <MessagesList messages={messages} onDelete={deleteMessageAction} onToggleRead={toggleMessageReadAction} />
    </div>
  );
}
