const db = require("../../../continuity-engine/persistence/db");

module.exports = {
    init() {
        const data = db.load();
        db.ensureCollection(data, "pufftokens");
        db.ensureCollection(data, "quests");
        db.save(data);
        return "burpfrenzy ready";
    },

    getQuests() {
        return [
            { id: 1, task: "Scan 1 receipt", reward: 5 },
            { id: 2, task: "Add 1 artifact", reward: 10 },
            { id: 3, task: "Scan 1 household sticker", reward: 3 }
        ];
    },

    completeQuest(questId) {
        const data = db.load();
        db.ensureCollection(data, "pufftokens");
        db.ensureCollection(data, "quests");
        const quest = this.getQuests().find((item) => item.id === Number(questId));

        if (!quest) return { error: "Quest not found" };

        data.pufftokens.push({ id: Date.now(), amount: quest.reward });
        data.quests.push({ questId: quest.id, completedAt: Date.now() });
        db.save(data);
        return { completed: true, reward: quest.reward };
    },

    award(amount) {
        const data = db.load();
        db.ensureCollection(data, "pufftokens");
        data.pufftokens.push({
            id: Date.now(),
            amount
        });
        db.save(data);
        return { awarded: true };
    },

    getTokens() {
        const data = db.load();
        return data.pufftokens || [];
    }
};
