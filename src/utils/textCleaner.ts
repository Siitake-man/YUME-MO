/**
 * テキスト整形 & 重複ループ除去ユーティリティ
 * Android Chrome / Web Speech API 特有の連続リピートバグや、
 * 寝起き特有の言い直し・反復・認識揺れを高度に除去・補正します。
 */

/**
 * 連続して繰り返されるフレーズ（4文字以上、または文・節単位）を検出して1回にまとめる
 */
export function cleanAndDeduplicateTranscript(
  rawText: string,
  frequentKeywords: string[] = []
): string {
  if (!rawText || typeof rawText !== 'string') return '';
  let text = rawText.trim();

  // 1. 基本的な余白・改行の正規化
  text = text.replace(/[\t ]+/g, ' ');
  text = text.replace(/\n\s*\n+/g, '\n');

  // 2. 連続フレーズ重複の検出・除去（長文から短文へスキャン）
  // 例：「しおちゃんと水族館に行って新しいを見るしおちゃんと水族館に行って新しいを見る...」
  // 最大120文字から最小4文字までの長さで連続重複を検知
  const maxChunkLen = Math.min(120, Math.floor(text.length / 2));
  for (let len = maxChunkLen; len >= 4; len--) {
    let i = 0;
    while (i <= text.length - len * 2) {
      const chunk = text.slice(i, i + len);

      // 句読点やスペースのみの場合はスキップ
      if (/^[、。\s\n！？!?・…]+$/.test(chunk)) {
        i++;
        continue;
      }

      // 何回連続して繰り返されているかカウント
      let repeats = 1;
      while (
        i + (repeats + 1) * len <= text.length &&
        text.slice(i + repeats * len, i + (repeats + 1) * len) === chunk
      ) {
        repeats++;
      }

      if (repeats > 1) {
        // 連続した繰り返しを1つだけ残してカット
        text = text.slice(0, i + len) + text.slice(i + repeats * len);
        // 同じ箇所から再評価（入れ子になった重複にも対応）
      } else {
        i++;
      }
    }
  }

  // 3. 句読点（、や。）区切り、または空白区切りの同一節・同一文の連続重複を除去
  const segments = text.split(/([、。\n\s]+)/);
  const cleanedSegments: string[] = [];
  let lastNonDelimiter = '';

  for (let s of segments) {
    const isDelimiter = /^[、。\n\s]+$/.test(s);
    if (isDelimiter) {
      cleanedSegments.push(s);
    } else {
      const trimmed = s.trim();
      // 直前と同一の内容（3文字以上）が連続していたらスキップ
      if (trimmed.length >= 3 && trimmed === lastNonDelimiter) {
        // デリミタが直前に挿入されていたらそれも1つ削る
        if (cleanedSegments.length > 0 && /^[、。\s]+$/.test(cleanedSegments[cleanedSegments.length - 1])) {
          cleanedSegments.pop();
        }
        continue;
      }
      lastNonDelimiter = trimmed;
      cleanedSegments.push(s);
    }
  }
  text = cleanedSegments.join('');

  // 4. 声紋プロファイルの頻出キーワード辞書による揺らぎ補正
  if (frequentKeywords && frequentKeywords.length > 0) {
    for (const kw of frequentKeywords) {
      const cleanKw = kw.trim();
      if (!cleanKw || cleanKw.length < 2) continue;

      // スペースが入って分断された単語を結合 (例: "しお ちゃん" -> "しおちゃん")
      const spacedRegex = new RegExp(
        cleanKw.split('').map(c => c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('\\s+'),
        'g'
      );
      text = text.replace(spacedRegex, cleanKw);

      // ひらがな・カタカナ・漢字の典型的な誤認識パターン補正
      if (cleanKw === 'しおちゃん') {
        text = text.replace(/塩ちゃん|シオちゃん|潮ちゃん|しおチャン/g, 'しおちゃん');
      }
    }
  }

  // 5. 末尾の不要な重複句読点の整理
  text = text.replace(/[、。]{2,}/g, '。');

  return text.trim();
}

/**
 * テキストに著しい重複（3回以上の同一文句）が含まれているかチェック
 */
export function hasExcessiveRepetition(text: string): boolean {
  if (!text || text.length < 15) return false;
  
  // 5文字以上のフレーズが3回以上出現するか
  for (let len = 5; len <= 30; len++) {
    for (let i = 0; i <= text.length - len * 3; i += 2) {
      const chunk = text.slice(i, i + len);
      if (/^[、。\s]+$/.test(chunk)) continue;
      const count = (text.split(chunk).length - 1);
      if (count >= 3) {
        return true;
      }
    }
  }
  return false;
}
