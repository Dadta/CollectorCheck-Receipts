const API = "http://localhost:4000/castlefrenzy";

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

async function addRoom() {
  const name = document.getElementById("roomName").value.trim();
  if (!name) {
    document.getElementById("output").textContent = JSON.stringify({ error: "Enter a room name." }, null, 2);
    return;
  }
  await request("/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  }, "Castle room added");
}

async function loadRooms() {
  await request("/rooms");
}
