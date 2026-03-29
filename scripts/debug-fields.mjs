const API_BASE = 'https://www.reinfolib.mlit.go.jp/ex-api/external';
const API_KEY = '358076db69594cbbb9b279f88f23e41a';

async function fetchAPI(endpoint, params) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { 'Ocp-Apim-Subscription-Key': API_KEY }
  });
  return res.json();
}

async function main() {
  const data = await fetchAPI('XIT001', { year: '2025', quarter: '3', area: '13' });
  const txs = data.data || [];
  console.log('Total records:', txs.length);

  // Type values
  const types = {};
  txs.forEach(tx => { types[tx.Type] = (types[tx.Type] || 0) + 1; });
  console.log('\nType values:', types);

  // Sample a land transaction
  const sample = txs.find(tx => tx.Type && tx.Type.includes('土地'));
  if (sample) {
    console.log('\nSample land tx:', JSON.stringify(sample, null, 2));
  } else {
    console.log('\nFirst tx sample:', JSON.stringify(txs[0], null, 2));
  }
}

main().catch(console.error);
