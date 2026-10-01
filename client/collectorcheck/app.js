const API = "http://localhost:4000/collectorcheck";

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

async function add() {
  const name = document.getElementById("name").value.trim();
  const type = document.getElementById("type").value.trim();
  const estimatedValue = Number(document.getElementById("value").value) || 0;
  const age = Number(document.getElementById("age").value) || 0;
  await request("/vault", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type, estimatedValue, age })
  }, "Artifact added to vault");
}

async function provenance() { await request("/provenance"); }
