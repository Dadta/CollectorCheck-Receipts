#!/usr/bin/env node

const commands = {
    burp: { run: require("./commands/burp"), arguments: 1 },
    verify: { run: require("./commands/verify"), arguments: 1 },
    identity: { run: require("./commands/identity"), arguments: 1 },
    ledger: { run: require("./commands/ledger"), arguments: 0 },
    archive: { run: require("./commands/archive"), arguments: 1 },
    pipeline: { run: require("./commands/pipeline"), arguments: 1 },
    status: { run: require("./commands/status"), arguments: 0 }
};

const usage = `Usage: node cli/ce.js <command> [argument]
  burp <receipt.json>       Generate a PhoneBurp event
  verify <artifact.json>    Submit to CollectorCheck /verify
  identity <identity.json>  Bind a Ditto identity
  ledger                    Show CLI ledger entries and tokens
  archive <artifactId>      Show a saved archive
  pipeline <receipt.json>   Run the full continuity pipeline
  status                    Show runtime and module health`;

async function main(args = process.argv.slice(2)) {
    const [command, ...parameters] = args;
    if (!command || command === "--help" || command === "-h") return usage;
    const handler = commands[command];
    if (!handler || parameters.length !== handler.arguments) {
        throw new TypeError(usage);
    }
    return handler.run(...parameters);
}

if (require.main === module) {
    main().then(result => {
        console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
    }).catch(error => {
        console.error(`ce: ${error.message}`);
        process.exitCode = 1;
    });
}

module.exports = { main };