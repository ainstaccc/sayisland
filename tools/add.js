/* 把新題加進 bank.js：驗證格式、擋掉重複，只「附加」不改舊題（題目編號依順序，改順序會讓孩子的進度對不上）
   用法：node tools/add.js new.json    new.json 形如 {"Q1":[[...]],"H2":[[...]],"E1":[{...}]}
   在 repo 根目錄執行。 */
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const slice=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);return html.slice(i,j)};
const base=new Function(slice('const Q1=[','const mk=(')+';return {Q1,Q2,V1,V2,A1,A2,M1,M2,E1,E2,Q3,V3,A3,M3,E3};')();
Object.assign(base,new Function(slice('const H1=[','const mkH=')+';return {H1,H2,H3};')());
const bankSrc=fs.readFileSync('bank.js','utf8');
const bank=JSON.parse(bankSrc.replace(/^window\.EXTRA=/,'').replace(/;\s*$/,''));
const inp=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const S=x=>typeof x==='string'&&x.trim().length>0;
const keyOf=(k,r)=>k[0]==='M'?r[1]:k[0]==='E'?r.scene:k[0]==='H'?r[1]:r[1];
function check(k,r){
  const c=k[0];
  if('QVA'.includes(c)){
    if(!Array.isArray(r)||r.length!==6||!r.every(S))return'欄位數不對（要 6 個字串）';
    if(r[1].split('＿＿').length!==2)return'句子要剛好一個「＿＿」';
    if(new Set([r[2],r[3],r[4]]).size!==3)return'三個選項不能重複';
    if([r[2],r[3],r[4]].some(x=>x.length>4))return'選項不超過 4 個字';
    if(r[1].replace('＿＿',r[2])!==r[1].replace('＿＿',r[2])||r[1].length>30)return'句子太長';
  }else if(c==='M'){
    if(!Array.isArray(r)||r.length!==3||!r.every(S))return'要 [圖,原因,結果]';
    if(r[1].length>7||r[2].length>8)return'原因 ≤7 字、結果 ≤8 字';
  }else if(c==='E'){
    if(!r||!S(r.e)||!S(r.noun)||!S(r.scene)||!Array.isArray(r.parts))return'E 欄位不齊';
    if(r.scene.length<8||r.scene.length>60)return'短文長度 8～60 字';
    if(r.parts.length<3||r.parts.length>4)return'要 3～4 個問題';
    for(const p of r.parts){if(!Array.isArray(p)||p.length!==6||!p.every(S))return'part 欄位不對';if(new Set([p[3],p[4],p[5]]).size!==3)return'part 選項重複';
      if(p[0]!=='數量'&&p[0]!=='樣子'&&p[0]!=='動作'&&p[0]!=='地點'&&p[0]!=='心情'&&p[0]!=='原因')return'part 類型不認得：'+p[0]}
  }else if(c==='H'){
    if(!Array.isArray(r)||r.length!==9||!r.every(S))return'好好說話要 9 個欄位';
    if(new Set([r[3],r[4],r[5]]).size!==3)return'三種說法不能重複';
  }else return'不認得的 key';
  return'';
}
const added={},rej=[];
for(const k of Object.keys(inp)){
  if(!/^[QVAMEH][123]$/.test(k)){rej.push(k+' key 不合法');continue}
  const seen=new Set([...(base[k]||[]),...(bank[k]||[])].map(r=>keyOf(k,r)));
  for(const r of inp[k]){
    const e=check(k,r);if(e){rej.push(k+' '+JSON.stringify(r).slice(0,40)+'… '+e);continue}
    const kk=keyOf(k,r);if(seen.has(kk)){rej.push(k+' 重複：'+kk.slice(0,20));continue}
    seen.add(kk);(bank[k]=bank[k]||[]).push(r);added[k]=(added[k]||0)+1;
  }
}
fs.writeFileSync('bank.js','window.EXTRA='+JSON.stringify(bank)+';\n');
console.log('新增',added);if(rej.length)console.log('被擋掉',rej.length,'題：\n'+rej.join('\n'));
