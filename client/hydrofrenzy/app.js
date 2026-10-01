const API = "http://localhost:4000/hydrofrenzy";

async function request(path, options, successMessage) {
  const output = document.getElementById("output");
  output.textContent = "Connecting...";
  try {
    const response = await fetch(`${API}${path}`, options);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
    output.textContent = JSON.stringify(result, null, 2);
    if (successMessage) notify(successMessage);
  } catch (error) {
    output.textContent = JSON.stringify({ error: error.message || "Could not reach the Continuity Engine." }, null, 2);
  }
}

async function scan() {
  const provider = document.getElementById("provider").value.trim();
  const amount = Number(document.getElementById("amount").value) || 0;
  await request("/stickers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, amount })
  }, "Household sticker recorded");
}

async function household() { await request("/household"); }
async function dignity() { await request("/dignity"); }
