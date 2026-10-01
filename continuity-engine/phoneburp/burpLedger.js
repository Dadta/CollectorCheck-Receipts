class BurpLedger {
    constructor() {
        this.events = [];
    }

    addEvent(event) {
        if (!event || typeof event !== "object" || !event.id || !Number.isSafeInteger(event.points) || event.points < 0) {
            throw new TypeError("A BurpEvent with an id and non-negative integer points is required.");
        }
        const storedEvent = { ...event, receipt: { ...event.receipt } };
        this.events.push(storedEvent);
        return { ...storedEvent, receipt: { ...storedEvent.receipt } };
    }

    getEvents() {
        return this.events.map(event => ({ ...event, receipt: { ...event.receipt } }));
    }

    getPointTotal() {
        return this.events.reduce((total, event) => total + event.points, 0);
    }
}

module.exports = BurpLedger;