const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function randomString(length = 16): string {
  let result = "";
  const charactersLength = ALPHABET.length;
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
