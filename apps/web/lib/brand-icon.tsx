import { getSiteSettings } from "@portfolio/db/server";

export async function getBrandLetter(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.title.trim().charAt(0).toUpperCase() || "P";
}

export function BrandLetterMark({ letter, fontSize }: { letter: string; fontSize: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b0f14",
        color: "#2dd4bf",
        fontFamily: "monospace",
        fontWeight: 700,
        fontSize,
      }}
    >
      {letter}
    </div>
  );
}
