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
  const data = await fetchAPI('XIT001', { year: '2025', quarter: '3', area: '11' }); // 埼玉
  const txs = data.data || [];

  // Get all unique field names
  const allKeys = new Set();
  txs.forEach(tx => Object.keys(tx).forEach(k => allKeys.add(k)));
  console.log('All field names:', [...allKeys].sort());

  // Sample 宅地(土地) transaction
  const landTx = txs.find(tx => tx.Type === '宅地(土地)');
  if (landTx) console.log('\nLand-only tx:', JSON.stringify(landTx, null, 2));

  // Sample 宅地(土地と建物) with area
  const houseTx = txs.find(tx => tx.Type === '宅地(土地と建物)' && tx.Region === '住宅地');
  if (houseTx) console.log('\nResidential tx:', JSON.stringify(houseTx, null, 2));
}

main().catch(console.error);
