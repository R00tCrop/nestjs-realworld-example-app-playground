const util = require('util');

if (!util.isNullOrUndefined) {
  util.isNullOrUndefined = function(value: any) {
    return value === null || value === undefined;
  };
}
