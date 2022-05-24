class NotFound extends Error {

  constructor(message) {
    super();
    this.name = 'NotFound';
    this.status = 'error';
    this.statusCode = 404;
    this.message = message;
  }
}

module.exports = NotFound;
