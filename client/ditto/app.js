const API = "http://localhost:4000/ditto";

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

function parsePayload() {
  try {
    return JSON.parse(document.getElementById("payload").value || "{}");
  } catch {
    throw new Error("Identity payload must be valid JSON.");
  }
}

async function bind() {
  const userId = document.getElementById("userId").value.trim();
  if (!userId) {
    document.getElementById("output").textContent = JSON.stringify({ error: "Enter a user ID." }, null, 2);
    return;
  }
  try {
    const payload = parsePayload();
    await request("/bind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, payload })
    }, "Identity bound");
  } catch (error) {
    document.getElementById("output").textContent = JSON.stringify({ error: error.message }, null, 2);
  }
}

async function loadIdentity() {
  const userId = document.getElementById("userId").value.trim();
  if (!userId) {
    document.getElementById("output").textContent = JSON.stringify({ error: "Enter a user ID." }, null, 2);
    return;
  }
  await request(`/identity/${encodeURIComponent(userId)}`);
}
