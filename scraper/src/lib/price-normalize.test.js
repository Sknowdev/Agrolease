import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toPricePerTonne, classifyUnitType } from './price-normalize.js';

test('toPricePerTonne: bare KG (amount defaults to 1)', () => {
  assert.equal(toPricePerTonne(100, 'KG'), 100000);
});

test('toPricePerTonne: prefixed weight, e.g. "2.5 KG"', () => {
  // 250 local currency per 2.5kg -> 100/kg -> 100,000/tonne
  assert.equal(toPricePerTonne(250, '2.5 KG'), 100000);
});

test('toPricePerTonne: "90 KG" bag', () => {
  assert.equal(toPricePerTonne(9000, '90 KG'), 100000);
});

test('toPricePerTonne: grams convert correctly', () => {
  // 50 per 400g -> 125/kg -> 125,000/tonne
  assert.equal(toPricePerTonne(50, '400 G'), 125000);
});

test('toPricePerTonne: lowercase "kg" still matches', () => {
  assert.equal(toPricePerTonne(100, 'kg'), 100000);
});

test('toPricePerTonne: non-weight unit (Liters) returns null, no guess', () => {
  assert.equal(toPricePerTonne(10, 'L'), null);
});

test('toPricePerTonne: non-weight unit (Loaf) returns null', () => {
  assert.equal(toPricePerTonne(5, 'Loaf'), null);
});

test('toPricePerTonne: non-weight unit (Bunch) returns null', () => {
  assert.equal(toPricePerTonne(5, 'Bunch'), null);
});

test('toPricePerTonne: non-weight unit (Piece/pcs) returns null', () => {
  assert.equal(toPricePerTonne(5, '30 pcs'), null);
});

test('toPricePerTonne: malformed/garbage unit string returns null', () => {
  assert.equal(toPricePerTonne(5, 'garbage'), null);
  assert.equal(toPricePerTonne(5, ''), null);
  assert.equal(toPricePerTonne(5, undefined), null);
});

test('toPricePerTonne: non-finite or non-positive price returns null', () => {
  assert.equal(toPricePerTonne(0, 'KG'), null);
  assert.equal(toPricePerTonne(-5, 'KG'), null);
  assert.equal(toPricePerTonne(NaN, 'KG'), null);
});

test('classifyUnitType: weight units', () => {
  assert.equal(classifyUnitType('KG'), 'weight');
  assert.equal(classifyUnitType('2.5 KG'), 'weight');
  assert.equal(classifyUnitType('400 G'), 'weight');
});

test('classifyUnitType: volume units', () => {
  assert.equal(classifyUnitType('L'), 'volume');
  assert.equal(classifyUnitType('1 L'), 'volume');
});

test('classifyUnitType: count/other units', () => {
  assert.equal(classifyUnitType('Loaf'), 'count');
  assert.equal(classifyUnitType('Bunch'), 'count');
  assert.equal(classifyUnitType('30 pcs'), 'count');
  assert.equal(classifyUnitType('1 Head'), 'count');
  assert.equal(classifyUnitType('1 Day'), 'count');
});

test('classifyUnitType: non-string input defaults to count', () => {
  assert.equal(classifyUnitType(undefined), 'count');
  assert.equal(classifyUnitType(null), 'count');
});
