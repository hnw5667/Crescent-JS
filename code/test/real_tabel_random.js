const fs=require('fs'), path=require('path'), os=require('os'), crypto=require('crypto');
const { TabelManager } = require('../src/phase1/database/tabel');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tabel_real_'));
console.log('=== REAL CASE TABEL TEST (random data) ===');
console.log('tmp', tmp);
const tm = new TabelManager(tmp);
const columns = ['id','name','email','score'];
const table = tm.createTable({
  table_name: 'real_test',
  columns,
  max_cells: 12,
  copies: 2,
  unique_columns: ['email'],
  base_dir: tmp
});
console.log('Created tabel real_test', table.info());
function randStr(len){ return crypto.randomBytes(len).toString('hex').slice(0,len); }
function randEmail(){ return randStr(6) + '@' + randStr(4) + '.com'; }
function randName(){ const names=['Alice','Bob','Carol','Dave','Eve','Frank','Grace','Heidi']; return names[Math.floor(Math.random()*names.length)] + randStr(2); }
const inserted = [];
for(let i=0;i<5;i++){
  const row = { id: i+1, name: randName(), email: randEmail(), score: Math.floor(Math.random()*100) };
  const saved = table.insert(row);
  inserted.push(saved);
  console.log('Inserted', i+1, saved.email, 'cells', table.info().cells, 'parts', table.info().parts, 'rows', table.info().rows);
}
console.log('All rows after 5 inserts:', table.find().length, 'expected 5');
console.log('Check sharding: parts should be 2 (since 5 rows *4 cols=20 cells >12, so 2 files)');
console.log('Actual parts', table.info().parts, 'files', fs.readdirSync(path.join(tmp, '.tabel_real_test')).filter(f=>f.startsWith('part_')).join(','));
console.log('Check copies: should have .copy1 files');
console.log('Files', fs.readdirSync(path.join(tmp, '.tabel_real_test')).join(', '));
const dupEmail = inserted[0].email;
console.log('Trying duplicate email', dupEmail, '(should be blocked by 160-bit hash bit-by-bit)');
try {
  table.insert({ id: 99, name: 'Dup', email: dupEmail, score: 50 });
  console.log('FAIL: duplicate not blocked');
} catch(e){
  console.log('PASS: duplicate blocked via 160-bit hash ->', e.message.slice(0,70));
  const { sha1Hex, hexToBinary } = require('../src/phase1/database/tabel');
  const h1 = sha1Hex(dupEmail);
  const h2 = sha1Hex(inserted[1].email);
  console.log('Hash dup', h1.slice(0,8), 'bin', hexToBinary(h1).slice(0,8));
  console.log('Hash other', h2.slice(0,8), 'bin', hexToBinary(h2).slice(0,8));
}
console.log('Query single tabel: find score >=50');
const high = table.find({ score: { $gte: 50 } });
console.log('Found', high.length, 'high scorers');
console.log('Find one by email', table.findOne({ email: inserted[1].email }).name);
console.log('Count', table.count({}));
console.log('Update Bob score to 99');
const first = inserted[0];
table.update({ email: first.email }, { score: 99 });
console.log('After update, find score 99', table.find({ score: 99 }).length);
console.log('Delete one');
table.delete({ id: 2 });
console.log('After delete, rows', table.find().length);
console.log('Hidden folder check:', fs.readdirSync(tmp).join(','));
console.log('Is hidden?', table.hidden);
tm.show();
console.log('After --show, visible:', fs.readdirSync(tmp).join(','));
console.log('List via manager', tm.listTables().map(t=>t.table_name+':'+(t.hidden?'hidden':'visible')));
tm.hide();
console.log('After --hide, hidden again:', fs.readdirSync(tmp).join(','));
console.log('--- Via crescent singleton (basic JS) ---');
const crescent = require('../src/rocket');
const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'crescent_dup2_'));
crescent._tabelManager = new TabelManager(tmp2);
const randTable = crescent.table({ table_name: 'rand_api', columns: ['x','y'], max_cells: 6, copies:1 });
for(let i=0;i<3;i++) randTable.insert({ x: randStr(3), y: Math.random() });
console.log('crescent rand_api rows', randTable.find().length, 'query', randTable.find({ x: { $exists: true } }).length);
console.log('All good, cleaning up');
fs.rmSync(tmp, {recursive:true, force:true});
fs.rmSync(tmp2, {recursive:true, force:true});
console.log('=== REAL CASE DONE ===');
