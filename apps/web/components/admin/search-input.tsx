import { SearchIcon } from "lucide-react";
import styles from "./search-input.module.scss";

export function SearchInput({
  basePath,
  initialQuery,
  placeholder,
}: {
  basePath: string;
  initialQuery: string;
  placeholder: string;
}) {
  return (
    <form action={basePath} method="GET" className={styles.form}>
      <SearchIcon className={styles.icon} />
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder={placeholder}
        className={styles.input}
      />
    </form>
  );
}
