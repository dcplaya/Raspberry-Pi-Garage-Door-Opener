var convict = require('convict');

var config = convict({
  env: {
     doc: "The applicaton environment.",
     format: ["production", "development", "test"],
     default: "development",
     env: "NODE_ENV"
  },
  server: {
    ip: {
      doc: "IP address to bind",
      format: "ipaddress",
      default: '0.0.0.0'
    },
    port: {
      doc: "port to bind",
      format: "port",
      default: 8080
    },
    http_username: {
      doc: "HTTP Server Admin Username",
      format: String,
      default: "admin"
    }
  },
  email: {
    host: {
      doc: "Enter your SMTP Server Here, example: 'mail.yahoo.com'",
      format: String,
      default: "mail.yahoo.com"
    },
   from: {
      doc: "Enter your from email address, example: John Doe <johndoe@yahoo.com>'",
      format: String,
      default: "John Doe <johndoe@yahoo.com>"
    },
    to: {
        doc: "Enter the recipient(s) here, example: John Doe <johndoe@yahoo.com>, Jane Doe <janedoe@yahoo.com>",
        format: String,
        default: "John Doe <johndoe@yahoo.com>, Jane Doe <janedoe@yahoo.com>"
    }
  }
});

// Perform validation
config.validate();

module.exports = config;