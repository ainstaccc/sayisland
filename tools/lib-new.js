/* v1.21.0 新增三關（成語 CY、換句話說 PW、造句 SJ）的格式檢查與去重 key。add.js、check.js 共用。 */
const S=x=>typeof x==='string'&&x.trim().length>0;
const PUNCT=/[，。！？、；：「」『』…\s]/g;
const strip=s=>String(s).replace(PUNCT,'');
const isNew=k=>/^(CY|CS|CJ|PW|SJ)[23]$/.test(k);
const keyOfNew=(k,r)=>k.startsWith('SJ')?(r[0]==='o'?r[3]:r[0]==='s'?r[2]:r[2]):r[1];
const SPECIAL=['#neg2','#q','#noquote'];
function checkNew(k,r){
  if(/^CJ[23]$/.test(k)){
    if(!Array.isArray(r)||r.length!==6||!r.every(S))return'欄位數不對（要 6 個字串）';
    const m=/^接龍：(.{4}) → ＿＿（「(.)」開頭）$/.exec(r[1]);
    if(!m||m[2]!==m[1][3])return'題目格式：接龍：成語 → ＿＿（「最後一字」開頭）';
    if([r[2],r[3],r[4]].some(x=>[...x].length!==4))return'選項要是 4 字成語';
    if(new Set([r[2],r[3],r[4]]).size!==3)return'三個選項不能重複';
    if(r[2][0]!==m[2])return'正解要以上一個成語的最後一字開頭';
    if(r[3][0]===m[2]||r[4][0]===m[2])return'干擾項不能也用那個字開頭';
    if(!r[5].startsWith(r[2]+'：'))return'提示要以「成語：」開頭';
    return'';
  }
  if(/^CS[23]$/.test(k)){
    if(!Array.isArray(r)||r.length!==6||!r.every(S))return'欄位數不對（要 6 個字串）';
    if(!/^「[^」]{4}」/.test(r[1])||r[1].split('＿＿').length!==2)return'題目要像「成語」的意思是＿＿。（成語 4 字、剛好一個＿＿）';
    if(new Set([r[2],r[3],r[4]]).size!==3)return'三個選項不能重複';
    if([r[2],r[3],r[4]].some(x=>[...x].length>8))return'選項不超過 8 個字';
    if(!r[5].startsWith(r[1].slice(1,5)+'：'))return'提示要以「成語：」開頭';
    return'';
  }
  if(/^(CY|PW)[23]$/.test(k)){
    if(!Array.isArray(r)||r.length!==6||!r.every(S))return'欄位數不對（要 6 個字串）';
    if(r[1].split('＿＿').length!==2)return'句子要剛好一個「＿＿」';
    if(new Set([r[2],r[3],r[4]]).size!==3)return'三個選項不能重複';
    if([r[2],r[3],r[4]].some(x=>x.length>4))return'選項不超過 4 個字';
    if(r[1].length>40)return'句子太長（≤40 字）';
    if(k.startsWith('CY')&&!r[5].startsWith(r[2]))return'成語的提示要以成語開頭，後面說明意思';
    return'';
  }
  if(/^SJ[23]$/.test(k)){
    if(!Array.isArray(r)||!['o','s','x','r','w'].includes(r[0]))return'第一欄要是 o／s／x／r／w';
    if(k==='SJ2'&&!['o','s','x'].includes(r[0]))return'SJ2（中年級）只能是 o、s 或 x';
    if(k==='SJ3'&&!['r','w'].includes(r[0]))return'SJ3（高年級）只能是 r 或 w';
    if(r[0]==='o'){ /* ['o',圖,[詞塊],正解句(含標點),[其他可接受句]] */
      if(r.length!==5||!S(r[1])||!S(r[3])||!Array.isArray(r[2])||!Array.isArray(r[4]))return'o 要 5 欄：[o,圖,[詞塊],正解句,[其他可接受句]]';
      if(r[2].length<3||r[2].length>6||!r[2].every(S)||r[2].some(x=>[...x].length>8))return'詞塊 3～6 個，每個 ≤8 字';
      if(strip(r[2].join(''))!==strip(r[3]))return'詞塊「依序」拼起來要等於正解句（標點除外）';
      if(!/[。！？]$/.test(r[3]))return'正解句要有句尾標點';
      const sort=s=>[...strip(s)].sort().join('');
      if(r[4].some(a=>!S(a)||sort(a)!==sort(r[3])))return'其他可接受句必須是同一批字的不同排法';
      return'';
    }
    if(r[0]==='s'){ /* ['s',圖,含＿＿的對稱句,正解,錯1,錯2,提示] */
      if(r.length!==7||!r.every(S))return's 要 7 個字串：[s,圖,句子,正解,錯1,錯2,提示]';
      if(r[2].split('＿＿').length!==2)return'句子要剛好一個「＿＿」';
      if(new Set([r[3],r[4],r[5]]).size!==3)return'三個選項不能重複';
      if([r[3],r[4],r[5]].some(x=>[...x].length>8))return'選項不超過 8 字';
      if(new Set([r[3],r[4],r[5]].map(x=>[...x].length)).size!==1)return'三個選項字數要一樣（不能用字數猜答案）';
      return'';
    }
    if(r[0]==='r'){ /* ['r',圖,原句,改寫指示,[必須保留的字串(可用|)],規則,最少字數,參考改寫,[不能用的詞],最多字數(0=不限)] */
      if(r.length!==10||![1,2,3,7].every(i=>S(r[i]))||!Array.isArray(r[4])||!r[4].length||!r[4].every(S)||typeof r[5]!=='string'||!Number.isInteger(r[6])||!Array.isArray(r[8])||!Number.isInteger(r[9]))return'r 要 10 欄：[r,圖,原句,指示,[保留],規則,最少字數,參考改寫,[禁用],最多字數]';
      if(r[5]&&!SPECIAL.includes(r[5])&&!r[5].split('|').every(S))return'規則要是 #neg2／#q／#noquote 或必含字串';
      if(!r[4].every(n=>n.split('|').some(a=>r[7].includes(a))))return'參考改寫沒有保留到所有重點字串';
      if(r[8].some(b=>r[7].includes(b)))return'參考改寫用到了禁用的詞';
      if(r[5]==='#neg2'&&(r[7].match(/[不沒無非]/g)||[]).length<2)return'參考改寫要有兩個否定字';
      if(r[5]==='#q'&&!/[？?]|難道|豈|怎麼會|哪裡|哪有/.test(r[7]))return'參考改寫要是反問句';
      if(r[5]==='#noquote'&&/[「」『』：:]/.test(r[7]))return'參考改寫不能有引號冒號';
      if(r[5]&&!SPECIAL.includes(r[5])&&!r[5].split('|').some(a=>r[7].includes(a)))return'參考改寫沒有符合規則字串';
      const L=[...strip(r[7])].length;if(L<r[6]||(r[9]&&L>r[9]))return'參考改寫字數不在範圍內';
      return'';
    }
    if(r[0]==='x'){ /* ['x',圖,句型,提示,[必要字串],最少字數,參考造句,範例句] */
      if(r.length!==8||![1,2,3,6,7].every(i=>S(r[i]))||!Array.isArray(r[4])||!r[4].length||!Number.isInteger(r[5]))return'x 要 8 欄：[x,圖,句型,提示,[必要字串],最少字數,參考造句,範例句]';
      for(const ex of [r[6],r[7]]){let pos=0;
        for(const n of r[4]){const h=n.split('|').map(a=>[ex.indexOf(a,pos),a]).filter(x=>x[0]>=0).sort((a,b)=>a[0]-b[0]);
          if(!h.length)return'參考造句／範例沒有依序用到「'+n+'」';pos=h[0][0]+h[0][1].length}}
      if(strip(r[6])===strip(r[7]))return'參考造句不能和範例一樣';
      return'';
    }
    /* ['w',圖,詞語,提示,[必須依序出現的字串（可用|列出替代說法）],最少字數,參考造句] */
    if(r.length!==7||!S(r[1])||!S(r[2])||!S(r[3])||!Array.isArray(r[4])||!r[4].length||!r[4].every(S)||!Number.isInteger(r[5])||!S(r[6]))return'w 要 7 欄：[w,圖,詞語,提示,[必要字串],最少字數,參考造句]';
    if(r[5]<5||r[5]>16)return'最少字數 5～16';
    if(!/[。！？]$/.test(r[6]))return'參考造句要有句尾標點';
    let pos=0;
    for(const n of r[4]){const hits=n.split('|').map(a=>[r[6].indexOf(a,pos),a]).filter(h=>h[0]>=0);
      if(!hits.length)return'參考造句沒有依序用到「'+n+'」';
      hits.sort((a,b)=>a[0]-b[0]);pos=hits[0][0]+hits[0][1].length}
    if([...strip(r[6])].length<r[5])return'參考造句比最少字數還短';
    return'';
  }
  return'不認得的 key';
}
module.exports={isNew,keyOfNew,checkNew};
