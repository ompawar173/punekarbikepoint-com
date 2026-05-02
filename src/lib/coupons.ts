import type { Coupon } from "@/hooks/useCoupons";

export interface DiscountInfo {
  coupon: Coupon;
  label: string; // e.g. "20% OFF" or "₹5,000 OFF"
  discountAmount: number;
  finalPrice: number;
}

export const computeDiscount = (price: number, coupon: Coupon | undefined): DiscountInfo | null => {
  if (!coupon) return null;
  const value = Number(coupon.discount_value || 0);
  if (value <= 0) return null;
  let discountAmount = 0;
  let label = "";
  if (coupon.discount_type === "percentage") {
    discountAmount = Math.round((price * value) / 100);
    label = `${value}% OFF`;
  } else {
    discountAmount = Math.round(value);
    label = `₹${discountAmount.toLocaleString("en-IN")} OFF`;
  }
  const finalPrice = Math.max(0, price - discountAmount);
  return { coupon, label, discountAmount, finalPrice };
};
