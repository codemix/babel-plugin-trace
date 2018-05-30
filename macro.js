const { createMacro } = require('babel-plugin-macros');
const { getLogFunction, handleLabeledStatement } = require('.');

function macro({
  babel,
  config: {
    aliases,
    strip,
    warningLabels = ['warn']
  } = {},
  references,
  state
}) {
  const refNames = Object.keys(references).filter(ref => ref !== 'default');
  if (refNames.length > 0) {
    aliases = refNames.reduce((map, key) => {
      const logLevel = warningLabels && warningLabels.includes(key) ? 'warn' : 'log';
      map[key] = getLogFunction(babel, logLevel);
      return map;
    }, {});
  }
  if (references.default) references.default.forEach(({ parentPath }) => parentPath.remove());
  const opts = { aliases, strip };
  state.file.path.traverse({
    LabeledStatement (path) {
      handleLabeledStatement(babel, path, opts);
    }
  });
}

module.exports = createMacro(macro, { configName: 'trace' });
