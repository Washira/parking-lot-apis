class Forbidden extends Error {

  constructor(message) {
    super();
    this.name = 'Forbidden';
    this.status = 'error';
    this.statusCode = 403;
    this.message = message;
  }
}

module.exports = Forbidden;
