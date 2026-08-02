/**
 * QueryEngine - Executes queries against file-based collections
 */

class QueryEngine {
  constructor(file_manager) {
    this._fm = file_manager;
  }

  /**
   * Find documents matching criteria
   */
  find(collection, query = {}) {
    const data = this._fm.read_collection(collection);
    if (Object.keys(query).length === 0) return data;
    return data.filter(doc => this._match(doc, query));
  }

  /**
   * Find one document matching criteria
   */
  findOne(collection, query = {}) {
    const results = this.find(collection, query);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Insert a document
   */
  insert(collection, document) {
    const data = this._fm.read_collection(collection);
    const doc = {
      _id: this._generateId(),
      _created: Date.now(),
      _updated: Date.now(),
      ...document
    };
    data.push(doc);
    this._fm.write_collection(collection, data);
    return doc;
  }

  /**
   * Update documents matching query
   */
  update(collection, query, updates) {
    const data = this._fm.read_collection(collection);
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (this._match(data[i], query)) {
        data[i] = { ...data[i], ...updates, _updated: Date.now() };
        count++;
      }
    }
    this._fm.write_collection(collection, data);
    return count;
  }

  /**
   * Delete documents matching query
   */
  delete(collection, query) {
    const data = this._fm.read_collection(collection);
    const original = data.length;
    const filtered = data.filter(doc => !this._match(doc, query));
    this._fm.write_collection(collection, filtered);
    return original - filtered.length;
  }

  /**
   * Count documents matching query
   */
  count(collection, query = {}) {
    return this.find(collection, query).length;
  }

  /**
   * Sort results by field
   */
  sort(collection, query = {}, sort_field, order = 'asc') {
    const results = this.find(collection, query);
    return results.sort((a, b) => {
      if (a[sort_field] < b[sort_field]) return order === 'asc' ? -1 : 1;
      if (a[sort_field] > b[sort_field]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Limit results
   */
  limit(collection, query = {}, limit_num) {
    return this.find(collection, query).slice(0, limit_num);
  }

  /**
   * Check if a document matches a query
   */
  _match(doc, query) {
    for (const [key, condition] of Object.entries(query)) {
      const value = doc[key];

      if (typeof condition === 'object' && condition !== null && !Array.isArray(condition)) {
        // Operator-based condition
        for (const [op, operand] of Object.entries(condition)) {
          switch (op) {
            case '$eq': if (value !== operand) return false; break;
            case '$ne': if (value === operand) return false; break;
            case '$gt': if (!(value > operand)) return false; break;
            case '$gte': if (!(value >= operand)) return false; break;
            case '$lt': if (!(value < operand)) return false; break;
            case '$lte': if (!(value <= operand)) return false; break;
            case '$in': if (!operand.includes(value)) return false; break;
            case '$nin': if (operand.includes(value)) return false; break;
            case '$contains': if (!(typeof value === 'string' && value.includes(operand))) return false; break;
            case '$regex': if (!(new RegExp(operand).test(value))) return false; break;
            case '$exists': if (operand && value === undefined) return false; break;
          }
        }
      } else {
        // Direct equality
        if (value !== condition) return false;
      }
    }
    return true;
  }

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = QueryEngine;