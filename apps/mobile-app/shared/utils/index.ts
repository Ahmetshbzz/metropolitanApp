export function formatPrice(price: number, currency: string = "PLN"): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?[1-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
