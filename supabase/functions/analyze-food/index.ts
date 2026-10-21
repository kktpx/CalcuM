// Supabase Edge Function: estimates nutrition from a food photo with Gemini.
// The Gemini key lives only here: `supabase secrets set GEMINI_API_KEY=...`
// Deploy: `supabase functions deploy analyze-food` (JWT verification stays on,
// so only signed-in users can call it).

const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash';
const MAX_IMAGE_CHARS = 8_000_000; // ~6 MB of base64

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const PROMPT =
  'Identify the food in this photo and estimate the nutrition for the whole portion shown. ' +
  'Reply in JSON only. Use whole numbers: calories in kcal, protein/carbs/fat in grams. ' +
  'If the photo does not contain food, set name to an empty string and all numbers to 0.';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return json({ error: 'Server is not configured' }, 500);

  let body: { image?: unknown; mimeType?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const { image, mimeType } = body;
  if (typeof image !== 'string' || image.length === 0 || image.length > MAX_IMAGE_CHARS) {
    return json({ error: 'Invalid image' }, 400);
  }
  const mime = typeof mimeType === 'string' && /^image\/(jpeg|png|webp|heic)$/.test(mimeType) ? mimeType : 'image/jpeg';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: image } }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              servingSize: { type: 'STRING' },
              calories: { type: 'INTEGER' },
              protein: { type: 'INTEGER' },
              carbs: { type: 'INTEGER' },
              fat: { type: 'INTEGER' },
            },
            required: ['name', 'servingSize', 'calories', 'protein', 'carbs', 'fat'],
          },
        },
      }),
    }
  );
  if (!res.ok) {
    // Visible in Supabase Dashboard > Edge Functions > analyze-food > Logs.
    console.error('Gemini error', res.status, await res.text());
    return json({ error: 'Analysis failed', upstream: res.status }, 502);
  }

  try {
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return json(JSON.parse(text));
  } catch (e) {
    console.error('Bad Gemini response', e);
    return json({ error: 'Analysis failed' }, 502);
  }
});
