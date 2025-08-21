import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const APP_ID  = process.env.APP_ID;
const REST_KEY= process.env.REST_KEY;
const BASE = `https://api.backendless.com/${APP_ID}/${REST_KEY}/data/Newbloods`;

async function fetchAll(){
  const all = [];
  let pageSize = 100, offset = 0;
  while(true){
    const url = `${BASE}?pageSize=${pageSize}&offset=${offset}&sortBy=created%20desc`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const chunk = await res.json();
    all.push(...chunk);
    if(chunk.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, {recursive:true}); }

(async ()=>{
  const data = await fetchAll();
  const ts = new Date().toISOString().slice(0,10);
  const dir = path.join('backups', ts.split('-')[0], ts.split('-')[1]);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `newbloods_${ts}.json`), JSON.stringify(data,null,2));
  console.log(`Saved ${data.length} records to backups/${ts}.json`);
})().catch(e=>{ console.error(e); process.exit(1); });
