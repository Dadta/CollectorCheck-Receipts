const API = "http://localhost:4000";
let autoUpdate = null;
let updateInProgress = false;
let autoUpdateGeneration = 0;
let lastState = null;
let cinematicTimeout = null;
const CLIENTS = new Set([
  "phoneburp",
  "castlefrenzy",
  "hydrofrenzy",
  "archivesavior",
  "collectorcheck",
  "ditto",
  "dadtabus"
]);

function startAutoUpdate(fn, interval = 3000) {
  stopAutoUpdate();
  const generation = autoUpdateGeneration;
  autoUpdate = window.setInterval(async () => {
    if (updateInProgress) return;
    updateInProgress = true;
    try {
      const result = await fn();
      if (generation !== autoUpdateGeneration) return;
      if (typeof window.notify === "function") window.notify("Live update tick");
      playSound("sound-tick");
      animatePanel("live-flash");
      pushEvent("live-update", result || {});
    } finally {
      updateInProgress = false;
    }
  }, interval);
  const indicator = document.getElementById("liveIndicator");
  if (indicator) indicator.textContent = "LIVE MODE ACTIVE";
}

function stopAutoUpdate() {
  if (autoUpdate !== null) window.clearInterval(autoUpdate);
  autoUpdate = null;
  autoUpdateGeneration += 1;
  const indicator = document.getElementById("liveIndicator");
  if (indicator) indicator.textContent = "";
}

function animatePanel(className) {
  const panel = document.getElementById("panel");
  const animationClasses = [
    "burp-anim",
    "token-burst",
    "room-unlock",
    "bill-glow",
    "artifact-drop",
    "identity-pulse",
    "transport-beam",
    "live-flash"
  ];
  if (className === "live-flash") {
    panel.classList.remove(className);
  } else {
    panel.classList.remove(...animationClasses.filter((animationClass) => animationClass !== className));
  }
  void panel.offsetWidth;
  panel.classList.add(className);
}

function playCinematic(text, duration = 2000) {
  const overlay = document.getElementById("cinematic-overlay");
  if (!overlay) return;

  if (cinematicTimeout !== null) window.clearTimeout(cinematicTimeout);
  overlay.textContent = text;
  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.remove("is-active");
  void overlay.offsetWidth;
  overlay.classList.add("is-active");
  cinematicTimeout = window.setTimeout(() => {
    overlay.classList.remove("is-active");
    overlay.setAttribute("aria-hidden", "true");
    cinematicTimeout = null;
  }, duration);
}

function pushEvent(type, data) {
  const feed = document.getElementById("eventFeed");
  if (!feed) return;

  const event = document.createElement("div");
  event.className = "event";
  event.textContent = `[${new Date().toLocaleTimeString()}] ${type}: ${JSON.stringify(data)}`;
  feed.prepend(event);
  while (feed.children.length > 50) feed.lastElementChild.remove();
}

function playSound(name) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const tones = {
    "sound-tick": { frequency: 880, duration: 0.075, volume: 0.035 },
    "sound-burp": { frequency: 220, duration: 0.13, volume: 0.045 },
    "sound-artifact": { frequency: 520, duration: 0.11, volume: 0.04 },
    "sound-bill": { frequency: 660, duration: 0.1, volume: 0.035 },
    "sound-token": { frequency: 1040, duration: 0.12, volume: 0.035 },
    "sound-room": { frequency: 440, duration: 0.16, volume: 0.04 },
      "sound-notify": { frequency: 740, duration: 0.11, volume: 0.035 },
      "sound-identity": { frequency: 610, duration: 0.14, volume: 0.035 }
  };
  const tone = tones[name];
  if (!tone) return;

  try {
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.value = tone.frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(tone.volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + tone.duration + 0.01);
    oscillator.onended = () => void context.close();
  } catch {
    return;
  }
}

function setPanel(title, data) {
  const panel = document.getElementById("panel");
  const heading = document.createElement("h2");
  const output = document.createElement("pre");
  const kicker = document.createElement("p");

  panel.replaceChildren();
  panel.setAttribute("aria-busy", "false");
  kicker.className = "panel-kicker";
  kicker.textContent = "Continuity report";
  heading.textContent = title;
  output.textContent = JSON.stringify(data, null, 2);
  panel.append(kicker, heading, output);
}

function setLoading(message) {
  const panel = document.getElementById("panel");
  panel.setAttribute("aria-busy", "true");
  const output = document.createElement("p");
  output.className = "panel-copy";
  output.textContent = message;
  panel.replaceChildren(output);
}

function setError(message) {
  setPanel("Request unavailable", { error: message });
  document.getElementById("panel").classList.add("has-error");
}

async function request(path, options) {
  setLoading("Connecting to the Continuity Engine...");
  try {
    const response = await fetch(`${API}${path}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    document.getElementById("panel").classList.remove("has-error");
    return data;
  } catch (error) {
    setError(error instanceof Error ? error.message : "Could not reach the Continuity Engine.");
    return null;
  }
}

async function loadScore() {
  const data = await request("/continuity-score");
  if (data) setPanel("Continuity Score", data);
}

async function loadBinder() {
  const userId = window.prompt("Enter User ID:");
  if (!userId || !userId.trim()) return;
  const data = await request("/binder-export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: userId.trim() })
  });
  if (data) setPanel("Binder Export", data);
}

function openClient(name) {
  if (!CLIENTS.has(name)) return;
  window.location.href = `/clients/${name}/`;
}

async function loadWidget(title, path, options) {
  const data = await request(path, options);
  if (data !== null) {
    setPanel(title, data);
    return data;
  }
  return null;
}

async function widgetReceipts() {
  const data = await loadWidget("Receipts", "/phoneburp-base/receipts");
  if (data !== null) animatePanel("burp-anim");
  return data;
}

async function widgetArtifacts() {
  const data = await loadWidget("Artifacts & Provenance", "/collectorcheck/provenance");
  if (data !== null) animatePanel("artifact-drop");
  return data;
}

async function widgetHousehold() {
  const data = await loadWidget("Household Continuity", "/hydrofrenzy/household");
  if (data !== null) animatePanel("bill-glow");
  return data;
}

async function widgetPuffTokens() {
  const data = await loadWidget("PuffTokens", "/burpfrenzy/tokens");
  if (data !== null) animatePanel("token-burst");
  return data;
}

async function widgetCastleRooms() {
  const data = await loadWidget("Castle Rooms", "/castlefrenzy/rooms");
  if (data !== null) animatePanel("room-unlock");
  return data;
}

async function widgetIdentity() {
  const userId = window.prompt("Enter User ID:");
  if (!userId || !userId.trim()) return;
  if (await loadWidget("Identity", `/ditto/identity/${encodeURIComponent(userId.trim())}`)) {
    animatePanel("identity-pulse");
  }
}

async function widgetTransport() {
  const data = await loadWidget("Transport Log", "/dadtabus/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test: "continuity" })
  });
  if (data !== null) {
    animatePanel("transport-beam");
    setAssistantOutput("A continuity payload was routed — system flow maintained.");
    setNarrativeOutput("A continuity payload travels through Dadtabus — the flow of your system remains strong.");
    animatePanel("artifact-drop");
    playSound("sound-identity");
    playCinematic("A continuity payload travels through Dadtabus...");
    pushEvent("transport-routed", data);
  }
  return data;
}

function setAssistantOutput(message) {
  const output = document.getElementById("assistant-output");
  if (output) output.textContent = message;
}

async function askAssistant() {
  const input = document.getElementById("assistant-input");
  const query = input.value.trim();
  if (!query) return;

  setAssistantOutput("Checking your continuity data...");
  try {
    const response = await continuityAI(query);
    setAssistantOutput(response);
    if (typeof window.notify === "function") window.notify("Assistant responded");
    playSound("sound-notify");
    animatePanel("identity-pulse");
  } catch (error) {
    setAssistantOutput(error instanceof Error ? error.message : "The assistant could not read continuity data.");
  }
}

async function continuityAI(query) {
  const { score, receipts, artifacts, household, tokens, rooms } = await loadContinuitySnapshot();
  const normalizedQuery = query.toLowerCase();

  if (normalizedQuery.includes("receipt") || normalizedQuery.includes("spend")) {
    const categories = new Map();
    receipts.forEach((receipt) => {
      const category = receipt.category || "general";
      categories.set(category, (categories.get(category) || 0) + 1);
    });
    const strongestCategory = [...categories.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "general";
    return `You have ${receipts.length} receipts. Your strongest spending category is likely "${strongestCategory}". Consider scanning more receipts to improve continuity.`;
  }

  if (normalizedQuery.includes("artifact") || normalizedQuery.includes("collection")) {
    const mostValuable = artifacts.reduce((best, record) => {
      const value = Number(record.details?.estimatedValue) || 0;
      return !best || value > best.value ? { record, value } : best;
    }, null);
    const artifactName = mostValuable?.record.details?.name || "unknown";
    return `You have ${artifacts.length} provenance entries. Your most valuable artifact appears to be "${artifactName}". Adding more artifacts will strengthen your CollectorCheck binder.`;
  }

  if (normalizedQuery.includes("household") || normalizedQuery.includes("bill")) {
    return `You have ${household.length} household continuity entries. Your dignity score is ${household.length * 2}. Keeping bills updated improves household continuity.`;
  }

  if (normalizedQuery.includes("token") || normalizedQuery.includes("quest")) {
    return `You have earned ${tokens.length} PuffTokens. Completing BurpFrenzy quests will accelerate your continuity progression.`;
  }

  if (normalizedQuery.includes("castle") || normalizedQuery.includes("identity")) {
    return `Your castle has ${rooms.length} rooms. Unlocking more rooms strengthens your identity continuity.`;
  }

  if (normalizedQuery.includes("score")) {
    return `Your continuity score is ${score.total}. Receipts, artifacts, household entries, PuffTokens, and identity all contribute.`;
  }

  if (normalizedQuery.includes("transport") || normalizedQuery.includes("route")) {
    return "Dadtabus routing is active. Transporting continuity payloads helps maintain system flow.";
  }

  return `Your continuity system is stable. Score: ${score.total}. Ask about receipts, artifacts, household, PuffTokens, castle rooms, or transport for deeper insights.`;
}

async function loadContinuitySnapshot() {
  const paths = [
    "/continuity-score",
    "/phoneburp-base/receipts",
    "/collectorcheck/provenance",
    "/hydrofrenzy/household",
    "/burpfrenzy/tokens",
    "/castlefrenzy/rooms"
  ];
  const responses = await Promise.all(paths.map((path) => fetch(`${API}${path}`)));
  const failed = responses.find((response) => !response.ok);
  if (failed) throw new Error(`Continuity data request failed (${failed.status}).`);
  const [score, receipts, artifacts, household, tokens, castleData] = await Promise.all(
    responses.map((response) => response.json()),
  );

  return {
    score,
    receipts,
    artifacts,
    household,
    tokens,
    rooms: castleData.rooms || []
  };
}

function setNarrativeOutput(narrative) {
  const output = document.getElementById("narrative-output");
  if (output) output.textContent = narrative;
}

function continuityNarrative(score, receipts, artifacts, household, tokens, rooms) {
  return `
In the ongoing chronicle of your continuity, the system stirs with new motion.

Your continuity score stands at ${score.total}, woven from ${receipts.length} receipts, ${artifacts.length} artifacts, ${household.length} household entries, ${tokens.length} PuffTokens, and ${rooms.length} castle rooms.

Receipts whisper of your daily travels — each vendor a small chapter in your economic journey.

Artifacts rest in the vault like relics of past triumphs, each one carrying a thread of provenance that strengthens your future.

Household entries form the quiet backbone of stability, each bill a marker of dignity maintained.

PuffTokens sparkle like small victories, earned through quests and continuity actions.

Castle rooms rise as chambers of identity, expanding your presence in the continuity realm.

Together, these elements form the living story of your continuity — a narrative that grows with every action you take.
    `.trim();
}

async function generateNarrative() {
  setNarrativeOutput("Gathering continuity details...");
  try {
    const snapshot = await loadContinuitySnapshot();
    setNarrativeOutput(continuityNarrative(
      snapshot.score,
      snapshot.receipts,
      snapshot.artifacts,
      snapshot.household,
      snapshot.tokens,
      snapshot.rooms,
    ));
    if (typeof window.notify === "function") window.notify("Narrative generated");
    playSound("sound-identity");
    animatePanel("identity-pulse");
  } catch (error) {
    setNarrativeOutput(error instanceof Error ? error.message : "Could not generate a continuity narrative.");
  }
}

function startNarrativeLive() {
  startAutoUpdate(async () => {
    const snapshot = await loadContinuitySnapshot();
    setNarrativeOutput(continuityNarrative(
      snapshot.score,
      snapshot.receipts,
      snapshot.artifacts,
      snapshot.household,
      snapshot.tokens,
      snapshot.rooms,
    ));
    return { narrative: "updated", score: snapshot.score.total };
  }, 5000);

  if (typeof window.notify === "function") window.notify("Narrative Live Mode enabled");
  playSound("sound-identity");
}

function renderChart(title, entries, summary) {
  const panel = document.getElementById("panel");
  const kicker = document.createElement("p");
  const heading = document.createElement("h2");
  const summaryLine = document.createElement("p");
  const chart = document.createElement("div");

  panel.replaceChildren();
  panel.setAttribute("aria-busy", "false");
  panel.classList.remove("has-error");
  kicker.className = "panel-kicker";
  kicker.textContent = "Live telemetry";
  heading.textContent = title;
  summaryLine.className = "chart-summary";
  summaryLine.textContent = summary;
  chart.className = "chartRows";
  chart.setAttribute("role", "list");

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "panel-copy";
    empty.textContent = "No records yet.";
    chart.append(empty);
  } else {
    const maximum = Math.max(1, ...entries.map((entry) => Math.max(0, Number(entry.value) || 0)));
    entries.forEach((entry) => {
      const row = document.createElement("div");
      const label = document.createElement("span");
      const track = document.createElement("span");
      const fill = document.createElement("span");
      const value = document.createElement("span");
      const numericValue = Math.max(0, Number(entry.value) || 0);

      row.className = "chartRow";
      row.setAttribute("role", "listitem");
      label.className = "chartLabel";
      label.textContent = entry.label;
      track.className = "chartTrack";
      track.setAttribute("aria-hidden", "true");
      fill.className = "chartFill";
      fill.style.width = `${(numericValue / maximum) * 100}%`;
      track.append(fill);
      value.className = "chartValue";
      value.textContent = entry.displayValue ?? String(numericValue);
      row.append(label, track, value);
      chart.append(row);
    });
  }

  panel.append(kicker, heading, summaryLine, chart);
}

function displayDate(value) {
  if (!value) return "Undated";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Undated" : date.toLocaleDateString();
}

async function chartContinuityScore() {
  const data = await request("/continuity-score");
  if (!data) return;
  const entries = Object.entries(data.breakdown || {}).map(([label, value]) => ({
    label,
    value,
    displayValue: String(value)
  }));
  renderChart("Continuity Score", entries, `Total score: ${data.total ?? 0}`);
  return data;
}

async function chartReceipts() {
  const receipts = await request("/phoneburp-base/receipts");
  if (!receipts) return;
  const categories = new Map();
  receipts.forEach((receipt) => {
    const category = receipt.category || "uncategorized";
    categories.set(category, (categories.get(category) || 0) + 1);
  });
  const entries = [...categories].map(([label, value]) => ({ label, value, displayValue: String(value) }));
  renderChart("Receipts by Category", entries, `${receipts.length} receipt${receipts.length === 1 ? "" : "s"}`);
  animatePanel("burp-anim");
  return receipts;
}

async function chartArtifacts() {
  const provenance = await request("/collectorcheck/provenance");
  if (!provenance) return;
  const entries = provenance.map((record, index) => {
    const artifact = record.details || {};
    const value = Number(artifact.estimatedValue) || 0;
    return {
      label: artifact.name || `Artifact ${record.artifactId || index + 1}`,
      value,
      displayValue: value.toLocaleString(undefined, { style: "currency", currency: "USD" })
    };
  });
  renderChart("Artifact Valuation", entries, `${provenance.length} provenance record${provenance.length === 1 ? "" : "s"}`);
  animatePanel("artifact-drop");
  return provenance;
}

async function chartHousehold() {
  const household = await request("/hydrofrenzy/household");
  if (!household) return;
  const entries = household.map((bill, index) => {
    const amount = Number(bill.amount) || 0;
    return {
      label: `${displayDate(bill.timestamp)} · ${bill.provider || `Bill ${index + 1}`}`,
      value: amount,
      displayValue: amount.toLocaleString(undefined, { style: "currency", currency: "USD" })
    };
  });
  renderChart("Household Timeline", entries, `${household.length} household record${household.length === 1 ? "" : "s"}`);
  animatePanel("bill-glow");
  return household;
}

async function chartPuffTokens() {
  const tokens = await request("/burpfrenzy/tokens");
  if (!tokens) return;
  let accumulated = 0;
  const entries = tokens.map((token, index) => {
    accumulated += Number(token.amount) || 0;
    return {
      label: `Award ${index + 1} · ${displayDate(token.id)}`,
      value: accumulated,
      displayValue: `${accumulated} PuffTokens`
    };
  });
  renderChart("PuffToken Accumulation", entries, `${accumulated} PuffTokens total`);
  animatePanel("token-burst");
  return tokens;
}

async function chartCastleRooms() {
  const data = await request("/castlefrenzy/rooms");
  if (!data) return;
  const rooms = data.rooms || [];
  const entries = rooms.map((room, index) => ({
    label: `${displayDate(room.created)} · ${room.name || `Room ${index + 1}`}`,
    value: index + 1,
    displayValue: `${index + 1} room${index === 0 ? "" : "s"}`
  }));
  renderChart("Castle Room Growth", entries, `${rooms.length} room${rooms.length === 1 ? "" : "s"}`);
  animatePanel("room-unlock");
  return rooms;
}

async function detectEvents() {
  const paths = [
    "/phoneburp-base/receipts",
    "/collectorcheck/provenance",
    "/hydrofrenzy/household",
    "/burpfrenzy/tokens",
    "/castlefrenzy/rooms"
  ];

  try {
    const responses = await Promise.all(paths.map((path) => fetch(`${API}${path}`)));
    const invalidResponse = responses.find((response) => !response.ok);
    if (invalidResponse) throw new Error(`Event scan failed (${invalidResponse.status})`);
    const [receipts, artifacts, household, pufftokens, castleData] = await Promise.all(
      responses.map((response) => response.json()),
    );
    const currentState = {
      receipts: receipts.length,
      artifacts: artifacts.length,
      household: household.length,
      pufftokens: pufftokens.length,
      rooms: (castleData.rooms || []).length
    };

    if (lastState === null) {
      lastState = currentState;
      pushEvent("event-monitor-ready", currentState);
      return currentState;
    }

    const eventRules = [
      ["receipts", "receipt-ingested", "New receipt ingested", "sound-burp", "burp-anim", "I detected a new receipt — your spending continuity just improved.", "A new receipt enters the continuity stream..."],
      ["artifacts", "artifact-added", "New artifact added", "sound-artifact", "artifact-drop", "A new artifact was added — provenance continuity strengthened.", "An artifact emerges from the vault..."],
      ["household", "household-bill", "New household bill scanned", "sound-bill", "bill-glow", "A new household bill was scanned — dignity continuity increased.", "A household bill stabilizes the foundation..."],
      ["pufftokens", "pufftoken-earned", "PuffToken reward earned", "sound-token", "token-burst", "You earned PuffTokens — continuity progression accelerated.", "A PuffToken spark ignites your progression..."],
      ["rooms", "castle-room", "Castle room unlocked", "sound-room", "room-unlock", "A new castle room unlocked — identity continuity expanded.", "A new chamber opens in your identity castle..."]
    ];

    eventRules.forEach(([key, eventType, message, sound, animation, assistantMessage, cinematicText]) => {
      if (currentState[key] > lastState[key]) {
        if (typeof window.notify === "function") window.notify(message);
        playSound(sound);
        animatePanel(animation);
        pushEvent(eventType, { previous: lastState[key], current: currentState[key] });
        setAssistantOutput(assistantMessage);
        setNarrativeOutput(assistantMessage);
        animatePanel("artifact-drop");
        playSound("sound-identity");
        playCinematic(cinematicText);
      }
    });

    lastState = currentState;
    return currentState;
  } catch (error) {
    pushEvent("event-scan-error", { message: error.message || "Unable to read module state" });
    return null;
  }
}

async function liveScore() {
  await chartContinuityScore();
  startAutoUpdate(chartContinuityScore, 5000);
}

async function liveReceipts() {
  await chartReceipts();
  startAutoUpdate(chartReceipts, 5000);
}

async function liveArtifacts() {
  await chartArtifacts();
  startAutoUpdate(chartArtifacts, 5000);
}

async function liveHousehold() {
  await chartHousehold();
  startAutoUpdate(chartHousehold, 5000);
}

async function livePuffTokens() {
  await chartPuffTokens();
  startAutoUpdate(chartPuffTokens, 5000);
}

async function liveCastleRooms() {
  await chartCastleRooms();
  startAutoUpdate(chartCastleRooms, 5000);
}

async function liveTransport() {
  await widgetTransport();
  startAutoUpdate(widgetTransport, 5000);
}

async function liveEverything() {
  const events = await detectEvents();
  const score = await chartContinuityScore();
  const receipts = await chartReceipts();
  const artifacts = await chartArtifacts();
  const household = await chartHousehold();
  const pufftokens = await chartPuffTokens();
  const castleRooms = await chartCastleRooms();
  return {
    events,
    score: score?.total ?? null,
    counts: {
      receipts: receipts?.length ?? 0,
      artifacts: artifacts?.length ?? 0,
      household: household?.length ?? 0,
      pufftokens: pufftokens?.length ?? 0,
      rooms: castleRooms?.length ?? 0
    }
  };
}

function assistantLive() {
  startAutoUpdate(async () => {
    const state = await detectEvents();
    return { assistant: "live", state };
  }, 3000);
  if (typeof window.notify === "function") window.notify("Assistant Live Mode enabled");
  playSound("sound-identity");
}
