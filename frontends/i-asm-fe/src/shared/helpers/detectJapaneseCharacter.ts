function containsKanji(str: string): boolean {
  // Regular expression for Kanji Unicode range (approx. U+4E00 to U+9FAF)
  const kanjiRegex = /[\u4E00-\u9FAF]/;
  return kanjiRegex.test(str);
}

// Extract all Kanji characters from a string
function extractKanji(str: string): string[] {
  // Match all Kanji characters globally
  return str.match(/[\u4E00-\u9FAF]/g) || [];
}

// Check if a single character is Kanji
function isKanji(char: string): boolean {
  if (char.length !== 1) return false; // Ensure single character input
  return /^[\u4E00-\u9FAF]$/.test(char);
}

// Check if a string contains Hiragana
function containsHiragana(str: string): boolean {
  const hiraganaRegex = /[\u3040-\u309F]/; // Unicode range for Hiragana
  return hiraganaRegex.test(str);
}

// Extract all Hiragana characters
function extractHiragana(str: string): string[] {
  return str.match(/[\u3040-\u309F]/g) || [];
}

// Check if a single character is Hiragana
function isHiragana(char: string): boolean {
  return char.length === 1 && /^[\u3040-\u309F]$/.test(char);
}

// Check if a string contains Katakana
function containsKatakana(str: string): boolean {
  const katakanaRegex = /[\u30A0-\u30FF]/; // Unicode range for standard Katakana
  return katakanaRegex.test(str);
}

// Extract all Katakana characters
function extractKatakana(str: string): string[] {
  return str.match(/[\u30A0-\u30FF]/g) || [];
}

// Check if a single character is Katakana
function isKatakana(char: string): boolean {
  return char.length === 1 && /^[\u30A0-\u30FF]$/.test(char);
}

// Check if a string contains any Kana (Hiragana or Katakana)
function containsKana(str: string): boolean {
  const kanaRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
  return kanaRegex.test(str);
}

// Extract all Kana characters
function extractKana(str: string): string[] {
  return str.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || [];
}

// Check if a character is either Hiragana or Katakana
function isKana(char: string): boolean {
  return isHiragana(char) || isKatakana(char);
}

function halfWidthToFullWidth(str: string) {
  return str.replace(/[\uFF66-\uFF9F]/g, match =>
    String.fromCharCode(match.charCodeAt(0) - 0xfee0)
  );
}

function katakanaToHiragana(str: string) {
  return str.replace(/[\u30A1-\u30FA]/g, match =>
    String.fromCharCode(match.charCodeAt(0) - 0x60)
  );
}

function convertJapaneseText(str: string) {
  // Normalize the text to avoid encoding issues
  const normalized = str.normalize("NFKC");
  return katakanaToHiragana(normalized);
}

export {
  containsKanji,
  extractKanji,
  isKanji,
  containsHiragana,
  extractHiragana,
  isHiragana,
  containsKatakana,
  extractKatakana,
  isKatakana,
  containsKana,
  extractKana,
  isKana,
  halfWidthToFullWidth,
  katakanaToHiragana,
  convertJapaneseText
};
