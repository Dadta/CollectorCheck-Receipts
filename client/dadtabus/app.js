const API = "http://localhost:4000/dadtabus";

async function request(path, payload, successMessage) {
  const output = document.getElementById("output");
  output.textContent = "Connecting...";
  try {
    const response = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
    output.textContent = JSON.stringify(result, null, 2);
    if (successMessage) notify(successMessage);
  } catch (error) {
    output.textContent = JSON.stringify({ error: error.message || "Could not reach the Continuity Engine." }, null, 2);
  }
}

function readPayload() {
  try {
    return JSON.parse(document.getElementById("payload").value || "{}");
  } catch {
    throw new Error("Payload must be valid JSON.");
  }
}

async function route() {
  try {
    await request("/route", readPayload(), "Continuity routed");
  } catch (error) {
    document.getElementById("output").textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}

async function micropay() {
  try {
    await request("/micropay", readPayload(), "Micropayment simulated");
  } catch (error) {
    document.getElementById("output").textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}
