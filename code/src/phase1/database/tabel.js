/**
 * Tabel - User-configurable table system for Crescent.js v1.0.9
 * 
 * Features:
 * - User configures table with basic JS: table_name, columns, max_cells per json, copies, unique_columns
 * - Each row is its own object in .json file (NoSQL style)
 * - Multiple tables, each table can have multiple copies (redundancy)
 * - Unique column checks via 160-bit SHA1 hash with bit-by-bit filtering (first bit clears non-matching, then second bit, etc.)
 * - Sharding: when a .json crosses max_cells, it splits into a second .json file (user-configured)
 * - Each table's json files kept in a hidden folder for that table; `crescent tabels --show` / `--hide` toggles visibility
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_BASE_DIR = path.join(process.cwd(), 'crescent_data');
const HIDDEN_PREFIX = '.tabel_';
const VISIBLE_PREFIX = 'tabel_';

function sha1Hex(value) {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  return crypto.createHash('sha1').update(str, 'utf8').digest('hex'); // 40 hex chars = 160 bits
}

function hexToBinary(hex) {
  // Convert 40-char hex (160 bits) to 160-char binary string
  let bin = '';
  for (let i = 0; i < hex.length; i++) {
    bin += parseInt(hex[i], 16).toString(2).padStart(4, '0');
  }
  return bin; // 160 chars
}

function getTableFolderName(tableName, hidden = true) {
  const prefix = hidden ? HIDDEN_PREFIX : VISIBLE_PREFIX;
  // Sanitize table name to avoid path traversal
  const safe = String(tableName).replace(/[^a-zA-Z0-9_-]/g, '_');
  return prefix + safe;
}

function listTableFolders(baseDir) {
  if (!fs.existsSync(baseDir)) return [];
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith(HIDDEN_PREFIX) || e.name.startsWith(VISIBLE_PREFIX)) {
      const isHidden = e.name.startsWith(HIDDEN_PREFIX);
      const tableName = e.name.slice(isHidden ? HIDDEN_PREFIX.length : VISIBLE_PREFIX.length);
      out.push({ folder: e.name, path: path.join(baseDir, e.name), tableName, hidden: isHidden });
    }
  }
  return out;
}

class Tabel {
  constructor(manager, config) {
    this.manager = manager;
    this.table_name = config.table_name || config.tableName || config.name;
    if (!this.table_name) throw new Error('Tabel requires table_name');
    this.columns = Array.isArray(config.columns) ? config.columns.slice() : [];
    this.max_cells = config.max_cells !== undefined ? Number(config.max_cells)
      : config.maxCells !== undefined ? Number(config.maxCells)
      : config.max_rows_per_file !== undefined ? Number(config.max_rows_per_file) * Math.max(1, this.columns.length || 1)
      : config.maxRowsPerFile !== undefined ? Number(config.maxRowsPerFile)
      : 1000; // default 1000 cells (rows*cols) or 1000 rows if no columns
    // If columns defined, max_cells is in cells; convert to maxRows for file sharding: maxRows = ceil(max_cells / columns.length)
    this.copies = config.copies !== undefined ? Math.max(1, Number(config.copies)) : 1;
    this.unique_columns = Array.isArray(config.unique_columns) ? config.unique_columns.slice()
      : Array.isArray(config.uniqueColumns) ? config.uniqueColumns.slice()
      : Array.isArray(config.unique) ? config.unique.slice() : [];
    this.hidden = config.hidden !== undefined ? !!config.hidden : true; // default hidden
    this.base_dir = config.base_dir || config.baseDir || manager.base_dir;

    // Internal: track next file index
    this._folderPath = path.join(this.base_dir, getTableFolderName(this.table_name, this.hidden));
    // Ensure folder exists
    this._ensureFolder();
    // Load or create meta
    this._writeMeta();
  }

  _ensureFolder() {
    if (!fs.existsSync(this._folderPath)) {
      fs.mkdirSync(this._folderPath, { recursive: true });
      // On Windows, also set hidden attribute if hidden
      if (this.hidden && process.platform === 'win32') {
        try { require('child_process').execSync(`attrib +h "${this._folderPath}"`); } catch (e) {}
      }
    }
  }

  _metaPath() {
    return path.join(this._folderPath, 'meta.json');
  }

  _writeMeta() {
    const meta = {
      table_name: this.table_name,
      columns: this.columns,
      max_cells: this.max_cells,
      copies: this.copies,
      unique_columns: this.unique_columns,
      hidden: this.hidden,
      created_at: Date.now()
    };
    // Only write if not exists or if columns changed; keep existing created_at if exists
    if (fs.existsSync(this._metaPath())) {
      try {
        const existing = JSON.parse(fs.readFileSync(this._metaPath(), 'utf-8'));
        meta.created_at = existing.created_at || meta.created_at;
      } catch (e) {}
    }
    fs.writeFileSync(this._metaPath(), JSON.stringify(meta, null, 2), 'utf-8');
  }

  _loadMeta() {
    if (fs.existsSync(this._metaPath())) {
      try { return JSON.parse(fs.readFileSync(this._metaPath(), 'utf-8')); } catch (e) { return null; }
    }
    return null;
  }

  _partFiles() {
    if (!fs.existsSync(this._folderPath)) return [];
    const files = fs.readdirSync(this._folderPath)
      .filter(f => /^part_\d+\.json$/.test(f))
      .sort((a, b) => {
        const na = Number(a.match(/part_(\d+)\.json/)?.[1] || 0);
        const nb = Number(b.match(/part_(\d+)\.json/)?.[1] || 0);
        return na - nb;
      });
    return files.map(f => path.join(this._folderPath, f));
  }

  _nextPartIndex() {
    const files = this._partFiles();
    if (files.length === 0) return 0;
    const last = files[files.length - 1];
    const m = last.match(/part_(\d+)\.json/);
    return m ? Number(m[1]) + 1 : files.length;
  }

  _readPart(filePath) {
    try {
      if (!fs.existsSync(filePath)) return [];
      const data = fs.readFileSync(filePath, 'utf-8');
      const arr = JSON.parse(data);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  _writePart(filePath, rows) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf-8');
    // Handle copies (redundancy): duplicate file for each extra copy
    if (this.copies > 1) {
      for (let c = 1; c < this.copies; c++) {
        const copyPath = filePath.replace(/\.json$/, `.copy${c}.json`);
        fs.writeFileSync(copyPath, JSON.stringify(rows, null, 2), 'utf-8');
      }
    }
  }

  _allRows() {
    const files = this._partFiles();
    let all = [];
    for (const fp of files) {
      all = all.concat(this._readPart(fp));
    }
    return all;
  }

  _cellsInPart(filePath) {
    const rows = this._readPart(filePath);
    if (this.columns.length > 0) {
      // Cells = rows * columns (defined)
      return rows.length * this.columns.length;
    }
    // If no columns defined, count keys per row as cells
    let cells = 0;
    for (const r of rows) cells += Object.keys(r).filter(k => !k.startsWith('_')).length;
    return cells;
  }

  _targetPartForInsert(newRow = null) {
    const files = this._partFiles();
    if (files.length === 0) {
      return path.join(this._folderPath, 'part_0.json');
    }
    const last = files[files.length - 1];
    const cells = this._cellsInPart(last);
    const newCells = newRow ? (this.columns.length ? this.columns.length : Object.keys(newRow).filter(k => !k.startsWith('_')).length || 1) : (this.columns.length || 1);
    // If adding this row would exceed max_cells, create new part
    if (cells + newCells > this.max_cells) {
      const idx = this._nextPartIndex();
      return path.join(this._folderPath, `part_${idx}.json`);
    }
    // Also if already at or over, create new
    if (cells >= this.max_cells) {
      const idx = this._nextPartIndex();
      return path.join(this._folderPath, `part_${idx}.json`);
    }
    return last;
  }

  // 160-bit hash bit-by-bit uniqueness check
  _isUniqueViaHash(column, value) {
    const targetHex = sha1Hex(String(value));
    const targetBin = hexToBinary(targetHex);
    const allRows = this._allRows();
    if (allRows.length === 0) return true;

    // Collect candidates that have this column
    let candidates = allRows.filter(r => r[column] !== undefined);
    if (candidates.length === 0) return true;

    // Bit-by-bit filtering: first bit, clear non-matching, then second bit, etc.
    for (let bit = 0; bit < 160; bit++) {
      const targetBit = targetBin[bit];
      const nextCandidates = [];
      let hasMatchAtThisBit = false;
      for (const row of candidates) {
        const rowHex = sha1Hex(String(row[column]));
        const rowBin = hexToBinary(rowHex);
        if (rowBin[bit] === targetBit) {
          nextCandidates.push(row);
          hasMatchAtThisBit = true;
        }
      }
      // If no candidate matches at this bit, then value is unique (no existing hash shares prefix)
      // Actually need to continue filtering: we keep only those that match so far
      // If after filtering, we still have candidates, continue to next bit
      // If we filter down to zero, then unique
      if (nextCandidates.length === 0) {
        return true; // no existing row shares prefix up to this bit → unique
      }
      candidates = nextCandidates;
      // If after 160 bits we still have at least one candidate with identical hash → duplicate
      if (bit === 159 && candidates.length > 0) {
        // Need to verify full hash equality (since we matched all 160 bits, it's same hash)
        for (const row of candidates) {
          if (sha1Hex(String(row[column])) === targetHex) {
            return false; // duplicate found
          }
        }
        return true;
      }
    }
    return true;
  }

  // Public: check uniqueness for a row across all unique_columns
  _checkUnique(row) {
    for (const col of this.unique_columns) {
      if (row[col] === undefined) continue;
      const unique = this._isUniqueViaHash(col, row[col]);
      if (!unique) {
        throw new Error(`Unique constraint violation on column "${col}" for value "${row[col]}": already exists in table "${this.table_name}"`);
      }
    }
  }

  // Insert a row (object). Each row is its own object in .json file.
  insert(row) {
    if (typeof row !== 'object' || row === null || Array.isArray(row)) {
      throw new Error('Row must be a plain object');
    }
    // Column validation: if columns defined, ensure row only has allowed columns (plus _id/_hash meta)
    if (this.columns.length > 0) {
      for (const key of Object.keys(row)) {
        if (!this.columns.includes(key) && !key.startsWith('_')) {
          throw new Error(`Column "${key}" not defined in table "${this.table_name}". Allowed: ${this.columns.join(', ')}`);
        }
      }
    }
    // Unique check via 160-bit hash bit-by-bit
    this._checkUnique(row);

    // Add meta
    const enriched = {
      _id: row._id || Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      _created: Date.now(),
      _hash: sha1Hex(JSON.stringify(row)),
      ...row
    };

    // Determine target part file (sharding) - pass row to check cells
    const target = this._targetPartForInsert(row);
    const existing = this._readPart(target);
    existing.push(enriched);
    this._writePart(target, existing);

    // After insert, check if this part now exceeds max_cells and needs to split? Already handled via _targetPartForInsert for next insert,
    // but if we inserted and it now exceeds, we don't split retroactively. The next insert will go to new file.
    // However spec says "if a .json in a table crosses a specific amount of cells , it will move and make a second .json file"
    // Our logic does that via next target being new file.

    return enriched;
  }

  // Find rows matching query (single table search via normal DB searching)
  find(query = {}) {
    const all = this._allRows();
    if (!query || Object.keys(query).length === 0) return all;
    // Use same matching logic as QueryEngine
    const engine = { _match: (doc, q) => this._match(doc, q) };
    return all.filter(doc => engine._match(doc, query));
  }

  findOne(query = {}) {
    const res = this.find(query);
    return res.length > 0 ? res[0] : null;
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  update(query, updates) {
    const files = this._partFiles();
    let count = 0;
    for (const fp of files) {
      let rows = this._readPart(fp);
      let changed = false;
      for (let i = 0; i < rows.length; i++) {
        if (this._match(rows[i], query)) {
          // If updating a unique column, need to check uniqueness (excluding current row)
          for (const col of this.unique_columns) {
            if (updates[col] !== undefined && updates[col] !== rows[i][col]) {
              // Temporarily remove current row from candidates to allow self-update? But if value already exists elsewhere, should fail
              // We need to check if any other row has this value
              const otherRows = this._allRows().filter(r => r._id !== rows[i]._id);
              const targetHex = sha1Hex(String(updates[col]));
              let duplicate = false;
              for (const other of otherRows) {
                if (other[col] !== undefined && sha1Hex(String(other[col])) === targetHex) {
                  duplicate = true; break;
                }
              }
              if (duplicate) throw new Error(`Unique constraint violation on column "${col}" for value "${updates[col]}"`);
            }
          }
          rows[i] = { ...rows[i], ...updates, _updated: Date.now(), _hash: sha1Hex(JSON.stringify({ ...rows[i], ...updates })) };
          count++;
          changed = true;
        }
      }
      if (changed) this._writePart(fp, rows);
    }
    return count;
  }

  delete(query) {
    const files = this._partFiles();
    let totalDeleted = 0;
    for (const fp of files) {
      const rows = this._readPart(fp);
      const filtered = rows.filter(doc => !this._match(doc, query));
      const deleted = rows.length - filtered.length;
      if (deleted > 0) {
        this._writePart(fp, filtered);
        totalDeleted += deleted;
      }
    }
    // Clean up empty part files? Keep at least one
    return totalDeleted;
  }

  count(query = {}) {
    return this.find(query).length;
  }

  // Internal matching (same as QueryEngine)
  _match(doc, query) {
    for (const [key, condition] of Object.entries(query)) {
      const value = doc[key];
      if (typeof condition === 'object' && condition !== null && !Array.isArray(condition)) {
        for (const [op, operand] of Object.entries(condition)) {
          switch (op) {
            case '$eq': if (value !== operand) return false; break;
            case '$ne': if (value === operand) return false; break;
            case '$gt': if (!(value > operand)) return false; break;
            case '$gte': if (!(value >= operand)) return false; break;
            case '$lt': if (!(value < operand)) return false; break;
            case '$lte': if (!(value <= operand)) return false; break;
            case '$in': if (!Array.isArray(operand) || !operand.includes(value)) return false; break;
            case '$nin': if (Array.isArray(operand) && operand.includes(value)) return false; break;
            case '$contains': {
              if (Array.isArray(value)) { if (!value.includes(operand)) return false; }
              else if (typeof value === 'string') { if (!value.includes(operand)) return false; }
              else return false;
              break;
            }
            case '$regex': {
              try {
                if (typeof value !== 'string') return false;
                if (String(operand).length > 100) return false;
                if (!(new RegExp(operand).test(value))) return false;
              } catch { return false; }
              break;
            }
            case '$exists': {
              const exists = value !== undefined;
              if (operand && !exists) return false;
              if (!operand && exists) return false;
              break;
            }
            default: if (value !== condition) return false;
          }
        }
      } else {
        if (value !== condition) return false;
      }
    }
    return true;
  }

  // Get all rows across all parts (for inspection)
  all() {
    return this._allRows();
  }

  // Info
  info() {
    const files = this._partFiles();
    const rows = this._allRows();
    return {
      table_name: this.table_name,
      columns: this.columns,
      max_cells: this.max_cells,
      copies: this.copies,
      unique_columns: this.unique_columns,
      hidden: this.hidden,
      folder: this._folderPath,
      parts: files.length,
      rows: rows.length,
      cells: this.columns.length ? rows.length * this.columns.length : rows.reduce((a, r) => a + Object.keys(r).filter(k => !k.startsWith('_')).length, 0)
    };
  }

  // Update hidden flag and folder (called by manager)
  _setHidden(hidden) {
    if (this.hidden === hidden) return;
    const newPath = path.join(this.base_dir, getTableFolderName(this.table_name, hidden));
    if (fs.existsSync(this._folderPath) && this._folderPath !== newPath) {
      // Remove existing target if exists (should not happen)
      if (fs.existsSync(newPath)) {
        // Merge? For now, remove target
        fs.rmSync(newPath, { recursive: true, force: true });
      }
      fs.renameSync(this._folderPath, newPath);
      // Handle Windows hidden attribute
      if (process.platform === 'win32') {
        try {
          const child = require('child_process');
          if (hidden) child.execSync(`attrib +h "${newPath}"`);
          else child.execSync(`attrib -h "${newPath}"`);
        } catch (e) {}
      }
    }
    this.hidden = hidden;
    this._folderPath = newPath;
    // Update meta
    this._writeMeta();
  }

  drop() {
    if (fs.existsSync(this._folderPath)) {
      fs.rmSync(this._folderPath, { recursive: true, force: true });
    }
    return true;
  }
}

class TabelManager {
  constructor(baseDir) {
    this.base_dir = baseDir || DEFAULT_BASE_DIR;
    this._tables = new Map(); // tableName -> Tabel instance cache
  }

  // Create a new table with basic JS config
  createTable(config) {
    const tableName = config.table_name || config.tableName || config.name;
    if (!tableName) throw new Error('createTable requires table_name');
    if (this.exists(tableName)) throw new Error(`Table "${tableName}" already exists`);
    const tabel = new Tabel(this, config);
    this._tables.set(tableName, tabel);
    return tabel;
  }

  // Alias for createTable
  create(config) { return this.createTable(config); }

  // Get existing table (loads meta if not in cache)
  getTable(tableName) {
    if (this._tables.has(tableName)) return this._tables.get(tableName);
    // Try to find folder for tableName (hidden or visible)
    const folders = listTableFolders(this.base_dir);
    const found = folders.find(f => f.tableName === tableName);
    if (!found) return null;
    // Load meta to reconstruct config
    const metaPath = path.join(found.path, 'meta.json');
    let meta = null;
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')); } catch (e) {}
    if (!meta) meta = { table_name: tableName, hidden: found.hidden };
    const tabel = new Tabel(this, {
      table_name: meta.table_name || tableName,
      columns: meta.columns || [],
      max_cells: meta.max_cells,
      copies: meta.copies,
      unique_columns: meta.unique_columns,
      hidden: found.hidden,
      base_dir: this.base_dir
    });
    // Override folder path to found path (in case hidden flag mismatch)
    tabel._folderPath = found.path;
    tabel.hidden = found.hidden;
    this._tables.set(tableName, tabel);
    return tabel;
  }

  table(config) {
    if (typeof config === 'string') return this.getTable(config);
    if (config && (config.table_name || config.name) && this.exists(config.table_name || config.name)) {
      return this.getTable(config.table_name || config.name);
    }
    return this.createTable(config);
  }

  hasTable(tableName) { return this.exists(tableName); }

  exists(tableName) {
    const folders = listTableFolders(this.base_dir);
    return folders.some(f => f.tableName === tableName);
  }

  listTables() {
    const folders = listTableFolders(this.base_dir);
    return folders.map(f => {
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(f.path, 'meta.json'), 'utf-8'));
        return { table_name: f.tableName, hidden: f.hidden, folder: f.folder, ...meta };
      } catch (e) {
        return { table_name: f.tableName, hidden: f.hidden, folder: f.folder };
      }
    });
  }

  dropTable(tableName) {
    const tabel = this.getTable(tableName);
    if (!tabel) return false;
    tabel.drop();
    this._tables.delete(tableName);
    return true;
  }

  // Show hidden tables: rename .tabel_* to tabel_*
  show() {
    let count = 0;
    const folders = listTableFolders(this.base_dir);
    for (const f of folders) {
      if (!f.hidden) continue;
      const tabel = this.getTable(f.tableName);
      if (tabel) {
        tabel._setHidden(false);
        this._tables.set(f.tableName, tabel);
        count++;
      }
    }
    return count;
  }

  hide() {
    let count = 0;
    const folders = listTableFolders(this.base_dir);
    for (const f of folders) {
      if (f.hidden) continue;
      const tabel = this.getTable(f.tableName);
      if (tabel) {
        tabel._setHidden(true);
        this._tables.set(f.tableName, tabel);
        count++;
      }
    }
    return count;
  }

  // For CLI: crescent tabels --show / --hide
  handleCLI(args) {
    const cmd = args[0];
    if (cmd === '--show' || cmd === 'show') {
      const n = this.show();
      console.log(`[crescent] tabels shown: ${n} table(s) now visible`);
      return n;
    }
    if (cmd === '--hide' || cmd === 'hide') {
      const n = this.hide();
      console.log(`[crescent] tabels hidden: ${n} table(s) now hidden`);
      return n;
    }
    if (cmd === '--list' || cmd === 'list' || !cmd) {
      const list = this.listTables();
      if (list.length === 0) console.log('[crescent] no tabels found');
      else {
        console.log('[crescent] tabels:');
        for (const t of list) {
          console.log(`  - ${t.table_name} (${t.hidden ? 'hidden' : 'visible'}) columns:${(t.columns||[]).join(',')} parts:${t.parts||'?'} rows:${t.rows||'?'} copies:${t.copies||1}`);
        }
      }
      return list;
    }
    console.error('Usage: crescent tabels --show | --hide | --list');
    return null;
  }
}

module.exports = { Tabel, TabelManager, sha1Hex, hexToBinary, getTableFolderName, listTableFolders };
module.exports.TabelManager = TabelManager;
module.exports.Tabel = Tabel;

