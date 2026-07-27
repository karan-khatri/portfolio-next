import { ImageResponse } from "next/og";
import { getBrandLetter, BrandLetterMark } from "@/lib/brand-icon";

export async function GET() {
  const letter = await getBrandLetter();
  return new ImageResponse(<BrandLetterMark letter={letter} fontSize={104} />, {
    width: 192,
    height: 192,
  });
}
