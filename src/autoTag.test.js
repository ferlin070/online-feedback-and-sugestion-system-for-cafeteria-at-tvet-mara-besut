import test from 'node:test';
import assert from 'node:assert';
import { detectCategory, detectPriority } from '../src/lib/autoTag.js';

test('detectCategory - kata kunci Kebersihan "kotor" patut klasifikasi sebagai Kebersihan', () => {
  const result = detectCategory('Lantai di kafeteria sangat kotor dan berbau', 'Umum');
  assert.strictEqual(result, 'Kebersihan');
});

test('detectCategory - kata kunci Perkhidmatan "lambat" patut klasifikasi sebagai Perkhidmatan', () => {
  const result = detectCategory('Staf kaunter sangat lambat melayan pelanggan', 'Umum');
  assert.strictEqual(result, 'Perkhidmatan');
});

test('detectCategory - kata kunci Kemudahan "lampu" patut klasifikasi sebagai Kemudahan', () => {
  const result = detectCategory('Lampu di meja 5 tidak berfungsi', 'Umum');
  assert.strictEqual(result, 'Kemudahan');
});

test('detectCategory - kata kunci Makanan "basi" patut klasifikasi sebagai Makanan', () => {
  const result = detectCategory('Nasi goreng yang dihidangkan sudah basi', 'Umum');
  assert.strictEqual(result, 'Makanan');
});

test('detectCategory - tiada kata kunci dikenal pasti patut guna kategori semasa', () => {
  const result = detectCategory('Sistem OK sahaja', 'Umum');
  assert.strictEqual(result, 'Umum');
});

test('detectCategory - kata kunci Inggeris "dirty" patut klasifikasi sebagai Kebersihan', () => {
  const result = detectCategory('The floor is very dirty', 'Umum');
  assert.strictEqual(result, 'Kebersihan');
});

test('detectCategory - kata kunci Inggeris "rude" patut klasifikasi sebagai Perkhidmatan', () => {
  const result = detectCategory('The waiter was rude and slow', 'Umum');
  assert.strictEqual(result, 'Perkhidmatan');
});

test('detectCategory - kata kunci Inggeris "food" patut klasifikasi sebagai Makanan', () => {
  const result = detectCategory('The food was cold and tasteless', 'Umum');
  assert.strictEqual(result, 'Makanan');
});

test('detectCategory - berbilang kata kunci, prioriti kategori pertama yang match', () => {
  // "kotor" (Kebersihan) & "lambat" (Perkhidmatan) - Kebersihan didahulukan dalam iteration order
  const result = detectCategory('Lantai kotor dan perkhidmatan lambat', 'Umum');
  assert.strictEqual(result, 'Kebersihan');
});

test('detectCategory - empty string patut guna fallback', () => {
  const result = detectCategory('', 'Umum');
  assert.strictEqual(result, 'Umum');
});

test('detectPriority - kata kunci bahaya patut klasifikasi sebagai high', () => {
  const result = detectPriority('Terdapat wayar elektrik terdedah, sangat bahaya', 'medium');
  assert.strictEqual(result, 'high');
});

test('detectPriority - kata kunci rosak teruk patut klasifikasi sebagai high', () => {
  const result = detectPriority('Siling di kantin rosak teruk dan mungkin runtuh', 'medium');
  assert.strictEqual(result, 'high');
});

test('detectPriority - kata kunci Inggeris danger patut klasifikasi sebagai high', () => {
  const result = detectPriority('Exposed wires are a danger to students', 'medium');
  assert.strictEqual(result, 'high');
});

test('detectPriority - tiada kata kunci high patut guna fallback', () => {
  const result = detectPriority('Makanan sedap sahaja', 'medium');
  assert.strictEqual(result, 'medium');
});

test('detectPriority - input kosong patut guna fallback', () => {
  const result = detectPriority('', 'low');
  assert.strictEqual(result, 'low');
});

test('detectPriority - kata kunci bocor patut klasifikasi sebagai high', () => {
  const result = detectPriority('Paip sinki bocor dan air melimpah ke lantai', 'medium');
  assert.strictEqual(result, 'high');
});

test('detectCategory - kata kunci "tandas" sahaja (tanpa kata kunci lain) patut klasifikasi sebagai Kemudahan', () => {
  const result = detectCategory('Tandas lelaki perlu dibaiki segera', 'Umum');
  assert.strictEqual(result, 'Kemudahan');
});

test('detectCategory - kata kunci "harga" patut klasifikasi sebagai Makanan', () => {
  const result = detectCategory('Harga makanan terlalu mahal', 'Umum');
  assert.strictEqual(result, 'Makanan');
});

test('detectCategory - kata kunci "staf" patut klasifikasi sebagai Perkhidmatan', () => {
  const result = detectCategory('Staf tidak memakai apron dengan betul', 'Umum');
  assert.strictEqual(result, 'Perkhidmatan');
});

test('detectCategory - kata kunci "kerusi" patut klasifikasi sebagai Kemudahan', () => {
  const result = detectCategory('Kerusi di meja 3 patah kaki', 'Umum');
  assert.strictEqual(result, 'Kemudahan');
});
