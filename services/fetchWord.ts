import axios from 'axios';

const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const DATAMUSE = 'https://api.datamuse.com/words';
const GOOGLE_TRANSLATE = 'https://translate.googleapis.com/translate_a/single';

// ------------------------------
// 📌 Fetch Dictionary (with ALL examples from Google Translate)
// ------------------------------
export async function fetchDict(word: string) {
  try {
    const { data } = await axios.get(`${DICT_API}${encodeURIComponent(word)}`);
    const entry = Array.isArray(data) && data[0];

    // All definitions
    const definitions = entry?.meanings?.[0]?.definitions || [];

    // Default meaning → first definition
    const meaning = definitions?.[0]?.definition || '';

    // Part of speech
    const partOfSpeech = entry?.meanings?.[0]?.partOfSpeech || '';

    // Pronunciation audio (first non-empty)
    const pronunciation =
      entry?.phonetics?.find((p: any) => p.audio && p.audio.trim() !== '')?.audio || '';

    // ------------------------------
    // Fetch examples from Google Translate
    // ------------------------------
    let examples = ''; // ✅ declare only once here
    try {
      const googleRes = await axios.get(GOOGLE_TRANSLATE, {
        params: {
          client: 'gtx',
          sl: 'en',
          tl: 'bn',
          dt: 'ex', // examples
          q: word,
        },
      });

      // Google Translate examples are nested arrays
      const nestedArrays = googleRes.data.filter(Array.isArray);
      if (nestedArrays.length > 1 && Array.isArray(nestedArrays[1])) {
        examples = nestedArrays[1]
          .flat()
          .map((ex: any) => ex[0])
          .filter(Boolean)
          .join(', ');
      }
    } catch (err) {
      examples = ''; // fallback if Google fails
    }

    return { meaning, example: examples, partOfSpeech, pronunciation };
  } catch (err) {
    return { meaning: '', example: '', partOfSpeech: '', pronunciation: '' };
  }
}

// ------------------------------
// 📌 Fetch Synonyms & Antonyms
// ------------------------------
export async function fetchSynAnt(word: string) {
  try {
    const [synRes, antRes] = await Promise.all([
      axios.get(`${DATAMUSE}?rel_syn=${encodeURIComponent(word)}&max=10`),
      axios.get(`${DATAMUSE}?rel_ant=${encodeURIComponent(word)}&max=10`),
    ]);

    return {
      synonyms: Array.isArray(synRes.data) ? synRes.data.map((d: any) => d.word) : [],
      antonyms: Array.isArray(antRes.data) ? antRes.data.map((d: any) => d.word) : [],
    };
  } catch {
    return { synonyms: [], antonyms: [] };
  }
}

// ------------------------------
// 📌 Bangla Translation (Google free API)
// ------------------------------
export async function translateBN(word: string) {
  try {
    const googleRes = await axios.get(GOOGLE_TRANSLATE, {
      params: {
        client: 'gtx',
        sl: 'en',
        tl: 'bn',
        dt: 't',
        q: word,
      },
    });

    const translated = googleRes.data?.[0]?.[0]?.[0];
    return translated || 'অর্থ পাওয়া যায়নি';
  } catch (err) {
    return 'অর্থ খুঁজে পাওয়া যায়নি';
  }
}
