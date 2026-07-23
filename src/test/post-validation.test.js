const assert = require('node:assert/strict');
const test = require('node:test');

const { isValidPost } = require('../post-validation');

const validPost = {
  title: 'Noticia do dia',
  resumo: 'Resumo breve da noticia para publicacao.',
  description: 'Conteudo completo da noticia para publicacao.'
};

test('accepts a post with all required fields within their limits', () => {
  assert.equal(isValidPost(validPost), true);
});

test('rejects a post with missing, empty, or oversized fields', () => {
  assert.equal(isValidPost(), false);
  assert.equal(isValidPost({ ...validPost, title: '' }), false);
  assert.equal(isValidPost({ ...validPost, resumo: 'a'.repeat(50) }), false);
  assert.equal(isValidPost({ ...validPost, description: 'a'.repeat(2000) }), false);
});