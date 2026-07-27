import { ImageResponse } from "next/og";
import { getBrandLetter, BrandLetterMark } from "@/lib/brand-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const letter = await getBrandLetter();
  return new ImageResponse(<BrandLetterMark letter={letter} fontSize={20} />, { ...size });
}
