export const formatPrice = (price) => {
  if (typeof price !== "number") return "";

  return price.toLocaleString();
};
