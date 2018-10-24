/* eslint global-require: 0, no-console: 0 */
'use strict';

module.exports.notify = (...args) => {
  console.error(...args);
};

module.exports.notifyConnection = (connection, ...args) => {
  let err = args[0];
  let metaData = args[1] || {};

  if (connection) {
    if (connection.selected) {
      metaData.selected = connection.selected.mailbox;
    }

    if (connection.session.user) {
      metaData.userId = connection.session.user.id.toString();
    }

    metaData.remoteAddress = connection.session.remoteAddress;
    metaData.isUTF8Enabled = !!connection.acceptUTF8Enabled;
  }

  Object.keys(err.meta || {}).forEach(key => {
    metaData[key] = err.meta[key];
  });

  args[1] = metaData;

  console.error(...args);
};

module.exports.intercept = (...args) => {
  let cb;
  if (args.length) {
    cb = args[args.length - 1];
    if (typeof cb === 'function') {
      args[args.length - 1] = function(...rArgs) {
        if (rArgs.length > 1 && rArgs[0]) {
          console.error(rArgs[0]);
        }
        return cb(...rArgs);
      };
    }
  }
};
