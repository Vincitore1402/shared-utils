const {
  entries,
  pipe,
  map,
  isPlainObject,
  includes,
  toLower,
  reduce,
  defaults
} = require('lodash/fp');

const DEFAULT_SECURE_KEYWORDS = ['password', 'token', 'key', 'secret', 'uri'];

const isFieldSecure = (
  fieldName,
  secureKeywords
) => {
  const input = toLower(fieldName);

  return secureKeywords.some(
    it => includes(it, input)
  );
};

const normalizeOptions = pipe(
  defaults({ keywords: [] }),
  it => Object.assign({}, { keywords: [...it.keywords, ...DEFAULT_SECURE_KEYWORDS] })
);

const createSanitizer = (options = {}) => {
  const normalizedOpts = normalizeOptions(options);

  // eslint-disable-next-line no-underscore-dangle
  const _processPair = ([key, value]) => {
    if (
      isPlainObject(value)
    ) {
      return { [key]: createSanitizer(options)(value) };
    }

    return {
      [key]: isFieldSecure(key, normalizedOpts.keywords) ? '***' : value
    };
  };

  return data => pipe(
    entries,
    map(_processPair),
    reduce(
      (acc, item) => ({ ...acc, ...item }),
      {}
    )
  )(data);
};

module.exports = {
  DEFAULT_SECURE_KEYWORDS,
  isFieldSecure,
  normalizeOptions,
  createSanitizer
};
