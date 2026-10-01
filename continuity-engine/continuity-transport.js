module.exports = {
    transport(payload) {
        // TODO: call dadtabus /transport
        return {
            transported: true,
            timestamp: Date.now(),
            payload
        };
    },
    micropay(details) {
        // TODO: call dadtabus /micropay
        return {
            paid: true,
            timestamp: Date.now(),
            details
        };
    }
};
