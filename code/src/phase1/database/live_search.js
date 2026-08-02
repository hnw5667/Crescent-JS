/**
 * LiveSearch - Real-time search with indexing and fuzzy matching
 */

class LiveSearch {
  constructor(query_engine) {
    this._qe = query_engine;
    this._indexes = new Map();
    this._watchers = new Map();
  }

  build_index(collection, field) {
    const data = this._qe._fm.read_collection(collection);
    const index = {};
    for (const doc of data) {
      const value = doc[field];
      if (value === undefined) continue;
      const key = String(value).toLowerCase();
      if (!index[key]) index[key] = [];
      index[key].push(doc);
    }
    this._indexes.set(`${collection}:${field}`, index);
    return this;
  }

  search(collection, field, term) {
    const indexKey = `${collection}:${field}`;
    let index = this._indexes.get(indexKey);
    if (!index) {
      this.build_index(collection, field);
      index = this._indexes.get(indexKey);
    }
    const termLower = term.toLowerCase();
    const results = [];
    for (const [key, docs] of Object.entries(index)) {
      if (key.includes(termLower)) results.push(...docs);
    }
    return results;
  }

  fuzzy_search(collection, term, options = {}) {
    const data = this._qe._fm.read_collection(collection);
    const threshold = options.threshold || 0.6;
    const fields = options.fields || null;
    const termLower = term.toLowerCase();
    return data.filter(doc => {
      const searchableFields = fields || Object.keys(doc);
      for (const field of searchableFields) {
        const value = String(doc[field] || '').toLowerCase();
        if (value.includes(termLower)) return true;
        if (this._levenshtein(value, termLower) / Math.max(value.length, termLower.length) <= (1 - threshold)) return true;
      }
      return false;
    });
  }

  watch(collection, callback) {
    if (!this._watchers.has(collection)) this._watchers.set(collection, []);
    this._watchers.get(collection).push(callback);
    return this;
  }

  notify(collection, event, data) {
    const watchers = this._watchers.get(collection) || [];
    for (const cb of watchers) cb({ collection, event, data, timestamp: Date.now() });
    return this;
  }

  _levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] = b[i-1] === a[j-1]
          ? matrix[i-1][j-1]
          : Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
      }
    }
    return matrix[b.length][a.length];
  }
}

module.exports = LiveSearch;