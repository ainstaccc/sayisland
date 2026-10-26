/* 驗證整個題庫（含 bank.js）；有問題就以非 0 結束。用法：node tools/check.js（在 repo 根目錄） */
const fs=require('fs');const html=fs.readFileSync('index.html','utf8');
const sl=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);return html.slice(i,j)};
const base=new Function(sl('const Q1=[','const mk=(')+';return {Q1,Q2,V1,V2,A1,A2,M1,M2,E1,E2,Q3,V3,A3,M3,E3};')();
Object.assign(base,new Function(sl('const H1=[','const mkH=')+';return {H1,H2,H3};')());
const bank=JSON.parse(fs.readFileSync('bank.js','utf8').replace(/^window\.EXTRA=/,'').replace(/;\s*$/,''));
const cnt={},bad=[];
for(const k of Object.keys(base)){const all=[...base[k],...(bank[k]||[])];cnt[k]=all.length;const seen=new Set();
  all.forEach((r,i)=>{const key=k[0]==='E'?r.scene:r[1];if(seen.has(key))bad.push(k+'#'+i+' 重複 '+key);seen.add(key);
    if('QVA'.includes(k[0])&&(r.length!==6||r[1].split('＿＿').length!==2||new Set([r[2],r[3],r[4]]).size!==3))bad.push(k+'#'+i+' 格式');
    if(k[0]==='H'&&(r.length!==9||new Set([r[3],r[4],r[5]]).size!==3))bad.push(k+'#'+i+' 格式');
    if(k[0]==='M'&&r.length!==3)bad.push(k+'#'+i+' 格式');});}
console.log(cnt);console.log(bad.length?bad:'ALL OK');process.exit(bad.length?1:0);
