// ============================================
// EVENT BUS - Centralized System Communication
// ============================================
// Lightweight event system for decoupled communication
// between all game systems

const EventBus = (function() {
    'use strict';

    const handlers = new Map();
    const onceHandlers = new Map();
    const eventHistory = [];
    const MAX_HISTORY = 100;

    function on(event, callback, priority = 0) {
        if (!handlers.has(event)) {
            handlers.set(event, []);
        }
        handlers.get(event).push({ callback, priority });
        handlers.get(event).sort((a, b) => b.priority - a.priority);
        return function off() {
            off(event, callback);
        };
    }

    function once(event, callback, priority = 0) {
        if (!onceHandlers.has(event)) {
            onceHandlers.set(event, []);
        }
        onceHandlers.get(event).push({ callback, priority });
        onceHandlers.get(event).sort((a, b) => b.priority - a.priority);
    }

    function off(event, callback) {
        if (handlers.has(event)) {
            const list = handlers.get(event);
            const idx = list.findIndex(h => h.callback === callback);
            if (idx !== -1) {
                list.splice(idx, 1);
            }
        }
        if (onceHandlers.has(event)) {
            const list = onceHandlers.get(event);
            const idx = list.findIndex(h => h.callback === callback);
            if (idx !== -1) {
                list.splice(idx, 1);
            }
        }
    }

    function emit(event, data = null) {
        const timestamp = Date.now();
        const eventEntry = { event, data, timestamp };
        eventHistory.push(eventEntry);
        if (eventHistory.length > MAX_HISTORY) {
            eventHistory.shift();
        }

        if (handlers.has(event)) {
            for (const handler of handlers.get(event)) {
                try {
                    handler.callback(data);
                } catch (err) {
                    console.error(`Event handler error for '${event}':`, err);
                }
            }
        }

        if (onceHandlers.has(event)) {
            const list = onceHandlers.get(event);
            for (const handler of list) {
                try {
                    handler.callback(data);
                } catch (err) {
                    console.error(`Once event handler error for '${event}':`, err);
                }
            }
            onceHandlers.delete(event);
        }
    }

    function getHistory(filter = null) {
        if (!filter) {
            return [...eventHistory];
        }
        return eventHistory.filter(e => e.event.includes(filter));
    }

    function clearHistory() {
        eventHistory.length = 0;
    }

    function getRegisteredEvents() {
        return Array.from(handlers.keys());
    }

    function hasHandlers(event) {
        return handlers.has(event) && handlers.get(event).length > 0;
    }

    return {
        on,
        once,
        off,
        emit,
        getHistory,
        clearHistory,
        getRegisteredEvents,
        hasHandlers
    };
})();

window.EventBus = EventBus;
