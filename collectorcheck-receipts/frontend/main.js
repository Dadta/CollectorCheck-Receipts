const app = document.getElementById('app');

app.innerHTML = `
  <h1>CollectorCheck Receipts MVP</h1>
  <button id="scanBtn">Scan Receipt</button>
  <button id="billerBtn">Sync Billers</button>
  <button id="summaryBtn">View Gig Summary</button>
  <div id="output" style="margin-top:20px; font-family:monospace;"></div>
`;

const output = document.getElementById('output');

function show(data) {
  output.textContent = JSON.stringify(data, null, 2);
}

document.getElementById('scanBtn').onclick = async () => {
  const res = await fetch('/api/receipts/scan', { method: 'POST' });
  const data = await res.json();
  show(data);
};

document.getElementById('billerBtn').onclick = async () => {
  const res = await fetch('/api/billers/sync');
  const data = await res.json();
  show(data);
};

document.getElementById('summaryBtn').onclick = async () => {
  const res = await fetch('/api/summary/gig');
  const data = await res.json();
  show(data);
};