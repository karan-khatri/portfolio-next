import { ImageResponse } from "next/og";
import { getBrandLetter, BrandLetterMark } from "@/lib/brand-icon";

export async function GET() {
  const letter = await getBrandLetter();
  return new ImageResponse(<BrandLetterMark letter={letter} fontSize={280} />, {
    width: 512,
    height: 512,
  });
}
