import test from 'node:test';
import assert from 'node:assert';
import { validateDescription } from './utils.js';

test('validateDescription - input kosong patut gagal', () => {
  const result = validateDescription('');
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.error, 'Butiran maklum balas wajib diisi.');
});

test('validateDescription - input ruang kosong patut gagal', () => {
  const result = validateDescription('   ');
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.error, 'Butiran maklum balas wajib diisi.');
});

test('validateDescription - input sah patut berjaya', () => {
  const result = validateDescription('Makanan di sini sangat sedap dan bersih.');
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.error, null);
});

test('validateDescription - input tepat 500 aksara patut berjaya', () => {
  const exactText = 'a'.repeat(500);
  const result = validateDescription(exactText);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.error, null);
});

test('validateDescription - input melebihi 500 aksara patut gagal', () => {
  const longText = 'a'.repeat(501);
  const result = validateDescription(longText);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.error, 'Butiran maklum balas tidak boleh melebihi 500 aksara.');
});
