/**
 * DatabaseSyntax - Rocket.js database query language
 * Provides a clean API for CRUD operations
 */

class DatabaseSyntax {
  constructor(query_engine) {
    this._qe = query_engine;
  }

  /**
   * Create a new collection
   */
  create(collection, schema = {}) {
    this._qe._fm.write_collection(collection, []);
    return this;
  }

  /**
   * Drop a collection
   */
  drop(collection) {
    this._qe._fm.delete_collection(collection);
    return this;
  }

  /**
   * Insert a document into a collection
   */
  insert(collection, document) {
    return this._qe.insert(collection, document);
  }

  /**
   * Insert multiple documents
   */
  insert_many(collection, documents) {
    const results = [];
    for (const doc of documents) {
      results.push(this._qe.insert(collection, doc));
    }
    return results;
  }

  /**
   * Find documents matching query
   */
  find(collection, query = {}) {
    return this._qe.find(collection, query);
  }

  /**
   * Find one document
   */
  find_one(collection, query = {}) {
    return this._qe.findOne(collection, query);
  }

  /**
   * Find by _id
   */
  find_by_id(collection, id) {
    return this._qe.findOne(collection, { _id: id });
  }

  /**
   * Update documents matching query
   */
  update(collection, query, updates) {
    return this._qe.update(collection, query, updates);
  }

  /**
   * Update one document
   */
  update_one(collection, query, updates) {
    const data = this._qe._fm.read_collection(collection);
    for (let i = 0; i < data.length; i++) {
      if (this._qe._match(data[i], query)) {
        data[i] = { ...data[i], ...updates, _updated: Date.now() };
        this._qe._fm.write_collection(collection, data);
        return 1;
      }
    }
    return 0;
  }

  /**
   * Delete documents matching query
   */
  delete(collection, query) {
    return this._qe.delete(collection, query);
  }

  /**
   * Delete one document
   */
  delete_one(collection, query) {
    const data = this._qe._fm.read_collection(collection);
    for (let i = 0; i < data.length; i++) {
      if (this._qe._match(data[i], query)) {
        data.splice(i, 1);
        this._qe._fm.write_collection(collection, data);
        return 1;
      }
    }
    return 0;
  }

  /**
   * Count documents
   */
  count(collection, query = {}) {
    return this._qe.count(collection, query);
  }

  /**
   * Sort documents
   */
  sort(collection, query, field, order = 'asc') {
    return this._qe.sort(collection, query, field, order);
  }

  /**
   * Limit results
   */
  limit(collection, query, num) {
    return this._qe.limit(collection, query, num);
  }

  /**
   * List all collections
   */
  list_collections() {
    return this._qe._fm.list_collections();
  }

  /**
   * Check if collection exists
   */
  exists(collection) {
    return this._qe._fm.collection_exists(collection);
  }
}

module.exports = DatabaseSyntax;