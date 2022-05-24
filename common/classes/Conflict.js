class Conflict extends Error {

  constructor(message) {
    super();
    this.name = 'Conflict';
    this.status = 'error';
    this.statusCode = 409;
    this.message = message;
  }
}

module.exports = Conflict;
