const CHOSUNG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

export function toChosung(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code < HANGUL_START || code > HANGUL_END) return ch;
      return CHOSUNG[Math.floor((code - HANGUL_START) / 588)];
    })
    .join("");
}

function isChosungOnly(text: string): boolean {
  return Array.from(text).every((ch) => CHOSUNG.includes(ch));
}

/** 일반 부분 일치 + 초성 검색 ("ㅅㄱㅊ" → 시금치) */
export function matchesKorean(query: string, target: string): boolean {
  const q = query.replace(/\s/g, "");
  if (!q) return true;
  const t = target.replace(/\s/g, "");
  if (t.includes(q)) return true;
  return isChosungOnly(q) && toChosung(t).includes(q);
}

function hasFinalConsonant(word: string): boolean {
  const code = word.charCodeAt(word.length - 1);
  if (code < HANGUL_START || code > HANGUL_END) return false;
  return (code - HANGUL_START) % 28 !== 0;
}

/** 조사 붙이기: josa("시금치", "이", "가") → "시금치가" */
export function josa(word: string, withFinal: string, withoutFinal: string): string {
  return word + (hasFinalConsonant(word) ? withFinal : withoutFinal);
}
