export type SourceKind = "hackernews" | "devto" | "github-trending" | "reddit-rss";

export interface TrendSource {
  id: string;
  kind: SourceKind;
  label: string;
  url: string;
  limit: number;
  enabled: boolean;
}

export const TREND_SOURCES: TrendSource[] = [
  {
    id: "hn-front-page",
    kind: "hackernews",
    label: "Hacker News",
    url: "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30",
    limit: 30,
    enabled: true,
  },
  {
    id: "devto-week",
    kind: "devto",
    label: "dev.to (top this week)",
    url: "https://dev.to/api/articles?top=7&per_page=30",
    limit: 30,
    enabled: true,
  },
  {
    id: "github-trending",
    kind: "github-trending",
    label: "GitHub Trending",
    url: "https://github.com/trending?since=weekly",
    limit: 20,
    enabled: true,
  },
  {
    id: "reddit-programming",
    kind: "reddit-rss",
    label: "r/programming",
    url: "https://www.reddit.com/r/programming/top/.rss?t=week&limit=25",
    limit: 25,
    enabled: true,
  },
  {
    id: "reddit-webdev",
    kind: "reddit-rss",
    label: "r/webdev",
    url: "https://www.reddit.com/r/webdev/top/.rss?t=week&limit=25",
    limit: 25,
    enabled: true,
  },
  {
    id: "reddit-machinelearning",
    kind: "reddit-rss",
    label: "r/MachineLearning",
    url: "https://www.reddit.com/r/MachineLearning/top/.rss?t=week&limit=25",
    limit: 25,
    enabled: true,
  },
];

export const GITHUB_SEARCH_FALLBACK_URL = "https://api.github.com/search/repositories";
