const patternMatch = /\b[a-zA-Z]/g;

export const splitName = (name: string) => {
  const matches = name.match(patternMatch);
  if (!matches) return "";
  const finalConcat = matches.join("");

  return finalConcat.slice(0, 4).toUpperCase();
};
