/**
 * FileManager - Handles JSON file-based database storage
 */

const fs = require('fs');
const path = require('path');

class FileManager {
  constructor(base_dir) {
    this.base_dir = base_dir || path.join(process.cwd(), 'rocket_data');
    this._locks = new Map();
  }

  /**
   * Ensure the data directory exists
   */
  _ensureDir() {
    if (!fs.existsSync(this.base_dir)) {
      fs.mkdirSync(this.base_dir, { recursive: true });
    }
  }

  /**
   * Get the file path for a collection
   */
  _filePath(collection) {
    return path.join(this.base_dir, `${collection}.json`);
  }

  /**
   * Read a collection file
   */
  read_collection(collection) {
    this._ensureDir();
    const filePath = this._filePath(collection);
    if (!fs.existsSync(filePath)) return [];
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Write a collection file
   */
  write_collection(collection, data) {
    this._ensureDir();
    const filePath = this._filePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  }

  /**
   * Delete a collection file
   */
  delete_collection(collection) {
    const filePath = this._filePath(collection);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * List all collections
   */
  list_collections() {
    this._ensureDir();
    return fs.readdirSync(this.base_dir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  /**
   * Check if collection exists
   */
  collection_exists(collection) {
    return fs.existsSync(this._filePath(collection));
  }

  /**
   * Acquire a simple file lock
   */
  async lock(collection) {
    while (this._locks.get(collection)) {
      await new Promise(r => setTimeout(r, 10));
    }
    this._locks.set(collection, true);
  }

  /**
   * Release a file lock
   */
  unlock(collection) {
    this._locks.set(collection, false);
  }
}

module.exports = FileManager;