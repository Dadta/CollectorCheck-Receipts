const API = "http://localhost:4000/archivesavior";

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

async function provenance() { await request("/provenance-lessons"); }
async function artifact() { await request("/artifact-lessons"); }

async function valuation() {
  const estimatedValue = Number(document.getElementById("value").value) || 0;
  const age = Number(document.getElementById("age").value) || 0;
  await request("/future-valuation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estimatedValue, age })
  }, "Valuation estimate ready");
}
