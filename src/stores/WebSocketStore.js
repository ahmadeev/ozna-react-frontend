import {makeAutoObservable} from "mobx";

class WebSocketStore {
    constructor() {
        makeAutoObservable(this); // обсервбл поля
    }

    websockets = {};
    pingIntervals = {}; // id таймеров
    messageHandlers = {};

    getWebSocket(parameter) {
        return this.websockets[parameter] || null;
    }

    openWebSocket(parameter, wsUrl) {
        if (this.websockets[parameter]) {
            return this.websockets[parameter];
        }

        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            console.log(`WebSocket открыт для параметра ${parameter}`);
            this.startPing(parameter);
        }
        ws.onmessage = (e) => {
            console.log(`Получено сообщение для ${parameter}:`, e.data);
        }
        ws.onerror = (e) => {
            console.error(`Ошибка WebSocket (${parameter}):`, e);
        }
        ws.onclose = () => {
            console.log(`WebSocket закрыт для параметра ${parameter}`);
            this.cleanup(parameter);
        }

        this.websockets[parameter] = ws;

        return ws;
    }

    closeWebSocket(parameter) {
        this.websockets[parameter].close();
    }

    startPing(parameter, interval = 75_000) {
        this.stopPing(parameter);

        const ws = this.websockets[parameter];
        if (!ws) return;

        const ping = () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "ping" }));
                console.log(`Отправлен ping для ${parameter}`);
            }
        };

        this.pingIntervals[parameter] = setInterval(ping, interval);
        ping();
    }

    stopPing(parameter) {
        if (this.pingIntervals[parameter]) {
            clearInterval(this.pingIntervals[parameter]);
            delete this.pingIntervals[parameter];
        }
    }

    registerMessageHandler(parameter, handler) {
        this.messageHandlers[parameter] = handler;
    }

    sendMessage(parameter, message) {
        const ws = this.websockets[parameter];
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    handleMessage(parameter, data) {
        const handler = this.messageHandlers[parameter];
        if (handler) {
            try {
                const message = JSON.parse(data);
                if (message.type !== "pong") {
                    handler(message);
                }
            } catch (e) {
                console.error("Ошибка обработки сообщения:", e);
            }
        }
    }

    cleanup(parameter) {
        this.stopPing(parameter);
        delete this.websockets[parameter];
    }
}

export default new WebSocketStore();
