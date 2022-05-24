class Unauthorized extends Error {

  constructor(message) {
    super();
    this.name = 'Unauthorized';
    this.status = 'error';
    this.statusCode = 401;
    this.message = message;
  }
}

module.exports = Unauthorized;
