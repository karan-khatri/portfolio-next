import { ImageResponse } from "next/og";
import { getBrandLetter, BrandLetterMark } from "@/lib/brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const letter = await getBrandLetter();
  return new ImageResponse(<BrandLetterMark letter={letter} fontSize={96} />, { ...size });
}
