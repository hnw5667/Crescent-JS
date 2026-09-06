/**
 * FileManager - Handles JSON file-based database storage
 */

const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('../cipher');

class FileManager {
  constructor(base_dir, secret) {
    this.base_dir = base_dir || path.join(process.cwd(), 'crescent_data');
    this.secret = secret || 'crescent-default-secret';
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
   * Sanitize collection name to prevent path traversal
   */
  _sanitize(collection) {
    // Only allow alphanumeric, underscore, hyphen
    const sanitized = String(collection).replace(/[^a-zA-Z0-9_-]/g, '_');
    // Ensure resolved path stays within base_dir
    const resolved = path.resolve(this.base_dir, `${sanitized}.json`);
    const baseResolved = path.resolve(this.base_dir);
    if (!resolved.startsWith(baseResolved)) throw new Error('Invalid collection name: path traversal detected');
    return sanitized;
  }

  /**
   * Get the file path for a collection
   */
  _filePath(collection) {
    const safe = this._sanitize(collection);
    return path.join(this.base_dir, `${safe}.json`);
  }

  /**
   * Read a collection file
   */
  read_collection(collection) {
    this._ensureDir();
    const filePath = this._filePath(collection) + '.enc';
    if (!fs.existsSync(filePath)) return [];
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const decrypted = decrypt(data, this.secret);
      return JSON.parse(decrypted);
    } catch (err) {
      // Only return empty for missing file, log corruption
      if (err.code === 'ENOENT') return [];
      console.warn(`[FileManager] Failed to read collection "${collection}": ${err.message}`);
      return [];
    }
  }

  /**
   * Write a collection file
   */
  write_collection(collection, data) {
    this._ensureDir();
    const filePath = this._filePath(collection) + '.enc';
    const encrypted = encrypt(JSON.stringify(data, null, 2), this.secret);
    fs.writeFileSync(filePath, encrypted, 'utf8');
    return true;
  }

  /**
   * Delete a collection file
   */
  delete_collection(collection) {
    const filePath = this._filePath(collection) + '.enc';
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
      .filter(f => f.endsWith('.enc'))
      .map(f => f.replace(/\.json\.enc$/, '').replace(/\.enc$/, ''));
  }

  /**
   * Check if collection exists
   */
  collection_exists(collection) {
    return fs.existsSync(this._filePath(collection) + '.enc');
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