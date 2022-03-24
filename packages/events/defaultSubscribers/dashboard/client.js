const {
  connectToMessageBusWithRetries,
  createMessage,
  getMessageBusPorts,
  sendAndAwait
} = require("@truffle/dashboard-message-bus");

const {
  MessageBusConnectionError
} = require("@truffle/dashboard-message-bus-common");

module.exports = class DashboardMessageBusClient {
  constructor(config) {
    this.config = config.dashboard || {
      host: "localhost",
      port: 24012
    };
  }

  async _getSocket() {
    if (this._socket) {
      return this._socket;
    }

    const { publishPort } = await getMessageBusPorts(
      this.config.port,
      this.config.host
    );

    this._socket = await connectToMessageBusWithRetries(
      publishPort,
      this.config.host
    );

    return this._socket;
  }

  async sendAndAwait({ type, payload }) {
    try {
      const socket = await this._getSocket();
      const message = createMessage(type, payload);

      return await sendAndAwait(socket, message);
    } catch (err) {
      if (!(err instanceof MessageBusConnectionError)) {
        throw err;
      } else return;
    }
  }
};
