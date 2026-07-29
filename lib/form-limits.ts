export const FORM_LIMITS = {
  umkmName: 120,
  personName: 120,
  rtRw: 3,
  villageName: 100,
  address: 500,
  phone: 20,
  socialHandle: 100,
  url: 2048,
  advantage: 255,
  password: 72,
  productName: 120,
  productDescription: 500,
  productPriceDigits: 10,
  categoryName: 100,
  villageDescription: 5000,
  email: 254,
  username: 50,
  imageDescription: 255,
  search: 100,
} as const;

export function characterHint(maxLength: number, format?: string) {
  return `${format ? `${format} • ` : ""}Maksimal ${maxLength} karakter`;
}

export function firstLimitError(
  values: Array<{ label: string; value: string | null | undefined; max: number }>,
) {
  const invalid = values.find(({ value, max }) => (value ?? "").length > max);
  return invalid
    ? `${invalid.label} maksimal ${invalid.max} karakter.`
    : null;
}
