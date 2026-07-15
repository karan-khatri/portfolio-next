import { SearchIcon } from "lucide-react";
import styles from "./search-input.module.scss";

// A plain GET form — no client JS needed. Submitting always lands on page 1
// of the (now-filtered) results since `page` simply isn't included here.
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
