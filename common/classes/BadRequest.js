class BadRequest extends Error {

  constructor(message) {
    super();
    this.name = 'BadRequest';
    this.status = 'error';
    this.statusCode = 400;
    this.message = message;
  }
}

module.exports = BadRequest;
