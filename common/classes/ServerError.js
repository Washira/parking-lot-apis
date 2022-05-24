class ServerError extends Error {

  constructor(message) {
    super();
    this.status = 'error';
    this.statusCode = 500;
    this.message = message;
  }
}

module.exports = ServerError;
