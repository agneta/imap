'use strict';

const imapTools = require('../imap-tools');

module.exports = {
  state: 'Selected',

  schema: [
    {
      name: 'range',
      type: 'sequence'
    },
    {
      name: 'path',
      type: 'string'
    }
  ],

  handler(command, callback) {
    let cmd = (command.command || '').toString().toUpperCase();

    // Check if COPY method is set
    if (typeof this._server.onCopy !== 'function') {
      return callback(null, {
        response: 'NO',
        message: cmd + ' not implemented'
      });
    }

    let range = (command.attributes[0] && command.attributes[0].value) || '';
    let path = Buffer.from((command.attributes[1] && command.attributes[1].value) || '', 'binary').toString();
    path = imapTools.normalizeMailbox(path, !this.acceptUTF8Enabled);

    if (!path) {
      return callback(new Error('Invalid mailbox argument for ' + cmd));
    }

    if (!imapTools.validateSequnce(range)) {
      return callback(new Error('Invalid sequence set for ' + cmd));
    }

    let messages = imapTools.getMessageRange(this.selected.uidList, range, cmd === 'UID COPY');

    this._server.onCopy(
      this.selected.mailbox,
      {
        destination: path,
        messages
      },
      this.session,
      (err, success, info) => {
        if (err) {
          return callback(err);
        }

        let code =
                    typeof success === 'string'
                      ? success.toUpperCase()
                      : 'COPYUID ' +
                          info.uidValidity +
                          ' ' +
                          imapTools.packMessageRange(info.sourceUid) +
                          ' ' +
                          imapTools.packMessageRange(info.destinationUid);

        callback(null, {
          response: success === true ? 'OK' : 'NO',
          code
        });
      }
    );
  }
};
