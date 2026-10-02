const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const requireEngine = createRequire(require.resolve("../continuity-engine/package.json"));
const express = requireEngine("express");
const ContinuityDispatcher = require("../runtime/dispatcher");
const { getModuleStatus } = require("../runtime/moduleRegistry");
const { getLogs, logEvent } = require("../runtime/continuityLog");
const ContinuityLedger = require("../continuity-engine/dadtabus/ledger");
const flowMap = require("../pipeline/flowMap");

const views = path.join(__dirname, "views");

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]);
}

function safeJson(value) {
    const seen = new WeakSet();
    try {
        return JSON.stringify(value, (key, item) => {
            if (typeof item === "bigint") return item.toString();
            if (item && typeof item === "object") {
                if (seen.has(item)) return "[Circular]";
                seen.add(item);
            }
            return item;
        }, 2) ?? "No data";
    } catch (error) {
        return "Snapshot unavailable.";
    }
}

function safeLogs() {
    try {
        return getLogs();
    } catch (error) {
        return [{ timestamp: Date.now(), type: "Log data unavailable" }];
    }
}

function render(view, data = {}) {
    const template = fs.readFileSync(path.join(views, `${view}.html`), "utf8");
    const content = template.replace(/{{{(\w+)}}}|{{(\w+)}}/g, (match, rawKey, key) =>
        rawKey ? (data[rawKey] ?? "") : escapeHtml(data[key]));
    const layout = fs.readFileSync(path.join(views, "layout.html"), "utf8");
    return layout.replace(/{{{content}}}|{{title}}/g, match =>
        match === "{{{content}}}" ? content : escapeHtml(data.title));
}

function createDashboardApp() {
    const app = express();
    const runs = [];
    const dispatcher = new ContinuityDispatcher();
    let ledgerCache = { runCount: -1, balance: 0, rows: "" };
    app.use("/styles.css", express.static(path.join(__dirname, "public", "styles.css")));
    app.use(express.urlencoded({ extended: false, limit: "16kb" }));

    function ledgerSummary() {
        if (ledgerCache.runCount === runs.length) return ledgerCache;
        const ledger = new ContinuityLedger({ entries: runs.map(run => run.entry) });
        ledgerCache = {
            runCount: runs.length,
            balance: ledger.getBalance(),
            rows: ledger.getEntries().slice().reverse().map(entry =>
                `<tr><td>${escapeHtml(new Date(entry.timestamp).toLocaleString())}</td><td>${escapeHtml(entry.type)}</td><td>${escapeHtml(entry.sourceModule)}</td><td>${escapeHtml(entry.amount)}</td><td><code>${escapeHtml(entry.id)}</code></td></tr>`).join("") || '<tr><td colspan="5">No ledger entries yet.</td></tr>'
        };
        return ledgerCache;
    }

    function pipelinePage(error = "") {
        const latest = runs.at(-1);
        const steps = latest ? latest.summary.stages.map(stage => {
            return `<li class="stage-${escapeHtml(stage.status)}"><span>${escapeHtml(stage.module)}</span><time>${escapeHtml(new Date(stage.startedAt).toLocaleString())}</time><small>${escapeHtml(stage.status)} · ${escapeHtml(stage.durationMs.toFixed(2))} ms</small></li>`;
        }).join("") : "<li>No pipeline runs yet.</li>";
        return render("pipeline", {
            title: "Pipeline",
            error: error ? `<p class="alert" role="alert">${escapeHtml(error)}</p>` : "",
            steps,
            completed: latest ? escapeHtml(new Date(latest.finishedAt).toLocaleString()) : "Not yet run",
            detail: latest ? `<a href="/identity/${encodeURIComponent(latest.identity.id)}">Identity</a> &middot; <a href="/artifact/${encodeURIComponent(latest.artifact.id)}">Artifact</a> &middot; <a href="/ledger">Ledger</a>` : ""
        });
    }

    app.get("/", (req, res) => {
        const modules = getModuleStatus();
        const healthyCount = Object.values(modules).filter(module => module.healthy).length;
        const indicator = healthyCount === Object.keys(modules).length ? "green" : healthyCount ? "yellow" : "red";
        res.send(render("dashboard", {
            title: "Overview",
            healthIndicator: `<span class="health-indicator ${indicator}" role="status">${indicator === "green" ? "Healthy" : indicator === "yellow" ? "Degraded" : "Unavailable"}</span>`,
            flow: flowMap.nodes.map(node => `<li><strong>${escapeHtml(node.module)}</strong><span>${escapeHtml(node.responsibility)}</span></li>`).join(""),
            health: Object.entries(modules).map(([name, module]) =>
                `<li><span>${escapeHtml(name)}</span><strong class="${module.healthy ? "ok" : "bad"}">${module.healthy ? "Ready" : "Unavailable"}</strong></li>`).join(""),
            events: safeLogs().slice(-5).reverse().map(event =>
                `<li><time>${escapeHtml(new Date(event.timestamp).toLocaleString())}</time><span>${escapeHtml(event.type)}</span></li>`).join("") || "<li>No continuity events yet.</li>"
        }));
    });

    app.get("/modules", (req, res) => {
        const modules = getModuleStatus();
        res.send(render("modules", {
            title: "Modules",
            rows: flowMap.nodes.map(node => {
                const module = modules[node.module.replace(" ", "")];
                return `<tr><th scope="row">${escapeHtml(node.module)}</th><td>${escapeHtml(node.responsibility)}</td><td>${escapeHtml(module?.version)}</td><td class="${module?.healthy ? "ok" : "bad"}">${module?.healthy ? "Ready" : "Unavailable"}</td></tr>`;
            }).join("")
        }));
    });

    app.get("/ledger", (req, res) => {
        const ledger = ledgerSummary();
        res.send(render("ledger", {
            title: "Ledger",
            balance: ledger.balance,
            rows: ledger.rows
        }));
    });

    app.get("/identities", (req, res) => {
        res.send(render("identity", {
            title: "Identity",
            heading: "Identities",
            summary: "Select an identity to see continuity records and provenance.",
            profile: "",
            records: runs.slice().reverse().map(run => `<li><a href="/identity/${encodeURIComponent(run.identity.id)}">${escapeHtml(run.identity.name || run.identity.id)}</a></li>`).join("") || "<li>No identities yet.</li>",
            provenance: ""
        }));
    });

    app.get("/identity/:id", (req, res) => {
        const run = runs.findLast(item => String(item.identity.id) === req.params.id);
        if (!run) return res.status(404).send(render("identity", {
            title: "Identity not found", heading: "Identity not found", summary: "No matching identity in this dashboard session.", profile: "", records: "", provenance: ""
        }));
        const { identity } = run;
        const summary = identity.getContinuitySummary();
        const profile = run.profile.getProfileSummary();
        res.send(render("identity", {
            title: "Identity",
            heading: identity.name || "Identity",
            summary: `${summary.totalRecords} continuity records · ${identity.provenance.length} provenance bindings`,
            profile: `<section class="profile-summary"><h2>Continuity profile</h2><p><strong>${escapeHtml(profile.continuityScore.score)}/100</strong> · ${escapeHtml(profile.continuityScore.rating)} · ${escapeHtml(profile.riskProfile.burpPoints)} BurpPoints</p></section>`,
            records: identity.continuityRecords.map(record =>
                `<li><strong>${escapeHtml(record.type)}</strong><code>${escapeHtml(record.id)}</code></li>`).join("") || "<li>No continuity records yet.</li>",
            provenance: identity.provenance.map(item =>
                `<li><a href="/artifact/${encodeURIComponent(String(item.artifactId))}">${escapeHtml(item.artifactName || item.artifactId)}</a> · ${escapeHtml(item.provenance?.length ?? 0)} provenance steps</li>`).join("") || "<li>No provenance bindings yet.</li>"
        }));
    });

    app.get("/artifacts", (req, res) => {
        res.send(render("artifact", {
            title: "Artifacts", heading: "Artifacts", status: "Select an artifact to see verification and archive details.",
            provenance: runs.slice().reverse().map(run => `<li><a href="/artifact/${encodeURIComponent(run.artifact.id)}">${escapeHtml(run.artifact.name)}</a></li>`).join("") || "<li>No artifacts yet.</li>",
            snapshots: ""
        }));
    });

    app.get("/artifact/:id", (req, res) => {
        const run = runs.findLast(item => String(item.artifact.id) === req.params.id);
        if (!run) return res.status(404).send(render("artifact", {
            title: "Artifact not found", heading: "Artifact not found", status: "No matching artifact in this dashboard session.", provenance: "", snapshots: ""
        }));
        res.send(render("artifact", {
            title: "Artifact", heading: run.artifact.name,
            status: `${run.verification.status} · ${run.verification.verified ? "Verified" : "Not verified"} · Archive ${run.archive.id}`,
            provenance: run.archive.provenanceChain.map(step =>
                `<li><time>${escapeHtml(new Date(step.timestamp).toLocaleString())}</time><span>${escapeHtml(step.actor)} · ${escapeHtml(step.action)}</span></li>`).join("") || "<li>No provenance steps yet.</li>",
            snapshots: run.archive.continuitySnapshots.map(snapshot =>
                `<li><time>${escapeHtml(new Date(snapshot.timestamp).toLocaleString())}</time><span>${escapeHtml(snapshot.type)}</span><pre>${escapeHtml(safeJson(snapshot.payload))}</pre></li>`).join("") || "<li>No snapshots yet.</li>"
        }));
    });

    app.get("/pipeline", (req, res) => res.send(pipelinePage()));

    app.post("/pipeline/run", (req, res) => {
        const merchant = req.body?.merchant?.trim();
        const total = req.body?.total?.trim();
        if (!merchant || !total) return res.status(400).send(pipelinePage("Merchant and total are required."));
        try {
            const receipt = { merchant, total, category: req.body.category?.trim() || "uncategorized" };
            const identityName = req.body.identityName?.trim();
            const result = identityName
                ? dispatcher.dispatchIdentityEvent({ receipt, identity: { name: identityName } })
                : dispatcher.dispatchBurpEvent({ receipt });
            runs.push({ ...result, finishedAt: Date.now() });
            logEvent({ type: "pipeline-complete", burpEventId: result.burpEvent.id, tokenId: result.token.id });
            res.redirect(303, "/pipeline");
        } catch (error) {
            res.status(error instanceof TypeError ? 400 : 500).send(pipelinePage(
                error instanceof TypeError ? error.message : "The pipeline could not be run."
            ));
        }
    });

    app.get("/logs", (req, res) => {
        res.send(render("logs", {
            title: "Logs",
            rows: safeLogs().slice().reverse().map(event =>
                `<tr><td>${escapeHtml(new Date(event.timestamp).toLocaleString())}</td><td>${escapeHtml(event.type)}</td><td><code>${escapeHtml(event.burpEventId)}</code></td><td><code>${escapeHtml(event.tokenId)}</code></td></tr>`).join("") || '<tr><td colspan="4">No continuity events yet.</td></tr>'
        }));
    });

    return app;
}

if (require.main === module) {
    const port = Number(process.env.DASHBOARD_PORT ?? 4003);
    createDashboardApp().listen(port, "127.0.0.1", () => console.log(`Continuity dashboard listening on http://127.0.0.1:${port}`));
}

module.exports = { createDashboardApp };