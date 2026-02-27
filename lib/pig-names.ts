const PREFIXES = [
  "Operation",
  "Project",
  "Mission",
];

const ADJECTIVES = [
  "Golden", "Flying", "Mighty", "Sneaky", "Brilliant", "Daring",
  "Electric", "Turbo", "Cosmic", "Atomic", "Iron", "Velvet",
  "Silver", "Crimson", "Thunder", "Shadow", "Blazing", "Frosted",
  "Savage", "Noble", "Rogue", "Swift", "Lucky", "Bold",
  "Gentle", "Dizzy", "Jolly", "Rusty", "Fluffy", "Gritty",
];

const PIG_WORDS = [
  "Hamhock", "Bacon", "Truffle", "Snout", "Oinker", "Piglet",
  "Porky", "Curly", "Rooter", "Squealer", "Trotter", "Hogwash",
  "Snouter", "Hamlet", "Porkchop", "Bristle", "Mudslinger", "Oinkster",
  "Sowbelly", "Pigskin", "Hogshead", "Swindle", "Tuskador", "Snuffler",
  "Boarmaster", "Gruntsworth", "Oinksalot", "Hogsworth", "Mudbath", "Snorticus",
];

const FAMOUS_PIGS = [
  "Wilbur", "Babe", "Napoleon", "Peppa", "Arnold",
  "Pigsworth", "Waddles", "Hamm", "Pumbaa", "Porkins",
];

/**
 * Hash a string with a seed to produce distinct values for each word slot.
 */
function seededHash(str: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 2654435761);
    hash = (hash ^ (hash >>> 16)) >>> 0;
  }
  return hash;
}

/**
 * Generate a random pig-themed codename (not seeded).
 * Used for the default name on new trials before save.
 */
export function generateRandomPigName(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const useFamous = Math.random() < 0.2;
  const pig = useFamous
    ? FAMOUS_PIGS[Math.floor(Math.random() * FAMOUS_PIGS.length)]
    : PIG_WORDS[Math.floor(Math.random() * PIG_WORDS.length)];
  return `${prefix} ${adj} ${pig}`;
}

/**
 * Generate a deterministic pig-themed codename from a trial number.
 * Uses the trial number string as a seed so the same trial always
 * gets the same name.
 */
export function generatePigName(trialNumber: string): string {
  const h1 = seededHash(trialNumber, 7);
  const h2 = seededHash(trialNumber, 31);
  const h3 = seededHash(trialNumber, 127);

  const prefix = PREFIXES[h1 % PREFIXES.length];
  const adj = ADJECTIVES[h2 % ADJECTIVES.length];

  // 20% chance of a famous pig name
  const usesFamousPig = h3 % 5 === 0;
  const pig = usesFamousPig
    ? FAMOUS_PIGS[h3 % FAMOUS_PIGS.length]
    : PIG_WORDS[h3 % PIG_WORDS.length];

  return `${prefix} ${adj} ${pig}`;
}
