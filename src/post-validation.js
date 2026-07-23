const MAX_TITLE_LENGTH = 29;
const MAX_SUMMARY_LENGTH = 49;
const MAX_CONTENT_LENGTH = 1999;

function isNonEmptyStringWithin(value, maximumLength) {
  return typeof value === 'string' && value.length > 0 && value.length <= maximumLength;
}

function isValidPost(post) {
  return Boolean(post) &&
    isNonEmptyStringWithin(post.title, MAX_TITLE_LENGTH) &&
    isNonEmptyStringWithin(post.resumo, MAX_SUMMARY_LENGTH) &&
    isNonEmptyStringWithin(post.description, MAX_CONTENT_LENGTH);
}

module.exports = { isValidPost };