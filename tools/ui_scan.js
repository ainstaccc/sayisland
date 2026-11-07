/* 說說島｜全畫面 UI 檢測：多種手機寬度 × 淺色／深色 × 三個年級，逐畫面找
   「橫向溢出、文字超出卡片／被切掉、元素跑出螢幕、深色對比不足、字太小」。
   用法（在 repo 根目錄）：node tools/ui_scan.js [--widths=320,360,390,430] [--schemes=light,dark] [--lv=1,2,3] [--shots=資料夾]
   需要 playwright（雲端環境已內建）。有「錯誤」類問題就以非 0 結束；「字太小」只列警告。
   會走的畫面：誰在玩、首頁、每一個關卡（出題→作答→回饋→下一題→結果）、我的島（商店／設施／盲盒／背包）、
   捏臉 7 個分頁、家長區、詞卡冊、好友團，以及首頁彈窗（活動／新品）。 */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.split('=')[1]:d};
const WIDTHS=arg('widths','320,360,390,430').split(',').map(Number),SCHEMES=arg('schemes','light,dark').split(','),LVS=arg('lv','1,2,3').split(',').map(Number),SHOTS=arg('shots','');
const URL='file://'+path.resolve('index.html');
const ERR_TYPES=new Set(['docOverflow','offscreen','spill','clip','contrast','pageerror']);

/* 在頁面內執行：回傳目前看得到的畫面上的問題清單 */
function inPage(){
  const out=[],W=innerWidth;
  const lab=el=>{let s=el.tagName.toLowerCase();if(el.id)s+='#'+el.id;else if(el.classList.length)s+='.'+[...el.classList].slice(0,2).join('.');return s};
  const vis=el=>{if(!el.getClientRects().length)return false;const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')return false;let p=el;while(p&&p!==document.body){if(+getComputedStyle(p).opacity<.05)return false;p=p.parentElement}return true};
  const skip=el=>el.closest('.fly,#fx,.fx,[data-noscan],canvas,svg *,#islHost,.toast:empty,script,style')||el.closest('[aria-hidden="true"]:not(button)');
  const rgb=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
  const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
  const bgOf=el=>{let p=el,acc=null;while(p){const cs=getComputedStyle(p);if(cs.backgroundImage&&cs.backgroundImage!=='none')return null;const c=rgb(cs.backgroundColor);if(c&&c.a>.01){if(c.a>=.95&&!acc)return c;if(c.a>=.95)return {r:acc.r*acc.a+c.r*(1-acc.a),g:acc.g*acc.a+c.g*(1-acc.a),b:acc.b*acc.a+c.b*(1-acc.a),a:1};if(!acc)acc=c}p=p.parentElement}return acc?{r:acc.r*acc.a+255*(1-acc.a),g:acc.g*acc.a+255*(1-acc.a),b:acc.b*acc.a+255*(1-acc.a),a:1}:{r:255,g:255,b:255,a:1}};
  const boxOf=el=>{let p=el.parentElement;while(p&&p!==document.body){const cs=getComputedStyle(p);const bg=rgb(cs.backgroundColor);if((bg&&bg.a>.3)||(parseFloat(cs.borderLeftWidth)>0&&cs.borderLeftStyle!=='none')||cs.overflowX!=='visible')return p;p=p.parentElement}return null};
  const scrollAnc=el=>{let p=el.parentElement;while(p&&p!==document.documentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll')return true;p=p.parentElement}return false};
  const push=(type,el,detail,text)=>out.push({type,sel:lab(el),text:(text||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,28),detail});
  if(document.documentElement.scrollWidth>W+1)out.push({type:'docOverflow',sel:'html',text:'',detail:'scrollWidth '+document.documentElement.scrollWidth+' > '+W});
  for(const el of document.body.querySelectorAll('*')){
    if(!vis(el)||skip(el))continue;
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    const own=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());
    const hasText=own.length>0;
    if((hasText||el.tagName==='BUTTON'||el.tagName==='IMG')&&r.width>0&&(r.right>W+2||r.left<-2)&&!scrollAnc(el)&&cs.position!=='fixed')push('offscreen',el,Math.round(r.left)+'→'+Math.round(r.right)+' / '+W);
    if(hasText){
      const rg=document.createRange();rg.selectNodeContents(el);const tr=[...rg.getClientRects()].filter(x=>x.width>0);
      if(tr.length){const tl=Math.min(...tr.map(x=>x.left)),trr=Math.max(...tr.map(x=>x.right));const bx=boxOf(el);
        if(bx){const br=bx.getBoundingClientRect();if(trr>br.right+1.5||tl<br.left-1.5)push('spill',el,'文字 '+Math.round(tl)+'→'+Math.round(trr)+'，容器 '+Math.round(br.left)+'→'+Math.round(br.right)+'（'+lab(bx)+'）')}}
      const fs=parseFloat(cs.fontSize);
      if(fs<15.5)push('small',el,fs+'px');
      const fg=rgb(cs.color),bg=bgOf(el);
      if(fg&&bg&&fg.a>.5){const L1=lum(fg),L2=lum(bg),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05),big=fs>=24||(fs>=18.66&&+cs.fontWeight>=700);
        if(cr<(big?3:4.5)&&!el.closest('[disabled],.off,.dis,.lock'))push('contrast',el,'對比 '+cr.toFixed(2)+'（字 '+cs.color+' 底 rgb('+Math.round(bg.r)+','+Math.round(bg.g)+','+Math.round(bg.b)+')）')}
    }
    if(cs.overflowX!=='visible'&&(hasText||el.children.length)&&el.textContent.trim()&&cs.textOverflow!=='ellipsis'&&!/(auto|scroll)/.test(cs.overflowX+cs.overflowY)){
      if(el.scrollWidth>el.clientWidth+2&&el.clientWidth>0)push('clip',el,'scrollWidth '+el.scrollWidth+' > '+el.clientWidth)}
  }
  return out;
}

const profile=(lv)=>({cur:'p1',profiles:{p1:{name:'小明',av:'a:cat',lv,stars:60,st:{},snd:true,days:{},bonus:'',said:[],voice:'',units:[],coin:240,
  mii:{v:2,cur:{s:2,h:3,c:1,e:1,t:1,p:2,f:3,a:3,x:1},own:{h:[0,1,3],t:[0,1],e:[0,1,2,3],p:[0,1,2],f:[0,1,3],a:[0,3],x:[0,1]}}}}});

(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
  const all=[];let shotN=0;
  if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
  for(const scheme of SCHEMES)for(const w of WIDTHS)for(const lv of LVS){
    const ctx=await b.newContext({viewport:{width:w,height:780},colorScheme:scheme,deviceScaleFactor:1});
    const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.addInitScript(d=>{if(!localStorage.getItem('zizi_v2'))localStorage.setItem('zizi_v2',JSON.stringify(d))},profile(lv));
    const tag=`${scheme}/${w}px/L${lv}`,seen=new Set();
    const scan=async name=>{
      await p.waitForTimeout(250);
      const res=await p.evaluate(inPage).catch(e=>[{type:'pageerror',sel:'scan',text:'',detail:String(e).slice(0,80)}]);
      const bad=res.filter(x=>x.type!=='small'||true);
      for(const x of bad){const k=[x.type,x.sel,x.text,tag,name].join('|');if(seen.has(k))continue;seen.add(k);all.push(Object.assign({cfg:tag,screen:name},x))}
      if(SHOTS&&res.some(x=>ERR_TYPES.has(x.type))){await p.screenshot({path:path.join(SHOTS,`${String(++shotN).padStart(3,'0')}_${tag.replace(/\//g,'_')}_${name.replace(/[^\w一-鿿]/g,'_')}.png`)}).catch(()=>{})}
    };
    const click=async(sel,t=400)=>{try{const el=await p.$(sel);if(!el)return false;await el.scrollIntoViewIfNeeded({timeout:1500}).catch(()=>{});await el.click({timeout:2000,force:true});await p.waitForTimeout(t);return true}catch(e){return false}};
    const home=async()=>{for(let i=0;i<3;i++){const h=await p.$('section:not([hidden]) [data-home]');if(!h)break;await h.click({force:true}).catch(()=>{});await p.waitForTimeout(250)}await p.evaluate(()=>document.querySelectorAll('.prpop').forEach(e=>e.remove()))};
    try{
      await p.goto(URL);await p.waitForTimeout(1500);
      if(await p.$('.prpop')){await scan('首頁彈窗');await p.evaluate(()=>document.querySelectorAll('.prpop').forEach(e=>e.remove()))}
      /* 只有一個 section 可見 */
      const vs=await p.evaluate(()=>[...document.querySelectorAll('section[id^=v-]')].filter(s=>s.offsetHeight>0).map(s=>s.id));
      if(vs.length!==1)all.push({cfg:tag,screen:'首頁',type:'docOverflow',sel:'section',text:'',detail:'同時可見：'+vs.join(',')});
      await scan('首頁');
      /* 每個關卡 */
      const cats=await p.$$eval('#missions .node[data-cat]',a=>a.map(x=>x.dataset.cat));
      for(const k of [...new Set(cats)]){
        await home();
        if(!await click(`#missions .node[data-cat="${k}"]`,700)){await click(`#dRow [data-cat="${k}"]`,700)}
        for(let step=0;step<9;step++){
          const v=await p.evaluate(()=>{const s=[...document.querySelectorAll('section[id^=v-]')].find(s=>s.offsetHeight>0);return s?s.id:''});
          if(!v||v==='v-home')break;
          await scan(`關卡 ${k} ${v} #${step}`);
          if(v==='v-res'){break}
          const picks=['#v-quiz:not([hidden]) .opt:not(:disabled)','.zk.tap:not(.bad)','.mc:not(.done):not(:disabled)','.zc:not(.done):not(:disabled)','.chip:not(:disabled)','#qnext','#bnext','#fnext','.fbrow .btn:not(.alt):not(:disabled)','.opt:not(:disabled)','.card:not(.done)','button.tile:not(:disabled)'];
          let did=false;for(const s of picks){if(await click(s,450)){did=true;break}}
          if(!did)break;
        }
      }
      /* 我的島 */
      await home();
      if(await click('#toIsl',2200)){
        await scan('島');
        for(const a of ['shop','fac','bag','box']){
          if(await click(`#islBar [data-ia="${a}"]`,900)){await scan('島 '+a);await click('#islSheet [data-ia="close"],#islSheet .sheetx,#islSheet [data-x]',300);await p.evaluate(()=>{const s=document.querySelector('#islSheet');if(s)s.hidden=true})}
        }
        await click('#islGoal',500);await scan('島 目標');
      }
      await home();
      /* 捏臉 */
      if(await click('#editMe',400)&&await click('#wMii',700)){
        for(let i=1;i<=7;i++){if(await click(`#miiTabs button:nth-child(${i})`,450))await scan('捏臉 分頁'+i)}
        await click('#miiX',300);
      }
      await p.evaluate(()=>document.querySelectorAll('.prpop').forEach(e=>e.remove()));
      /* 誰在玩 */
      await home();if(await click('#whoBtn',500))await scan('誰在玩');
      await p.goto(URL);await p.waitForTimeout(1200);await p.evaluate(()=>document.querySelectorAll('.prpop').forEach(e=>e.remove()));
      /* 詞卡冊、好友團、家長區 */
      if(await click('#toDeck',600))await scan('詞卡冊');await home();
      if(await click('#toGrp',900))await scan('好友團');await home();
      if(await click('#toParent',500)){
        await scan('家長區 驗證');
        const q=await p.$eval('#pgq',e=>e.textContent).catch(()=>'');const m=q.match(/(\d+)\s*\+\s*(\d+)/);
        if(m){await p.fill('#pgin',String(+m[1]+ +m[2]));await click('#pgok',700);await scan('家長區')}
      }
    }catch(e){all.push({cfg:tag,screen:'流程',type:'pageerror',sel:'script',text:'',detail:String(e).slice(0,100)})}
    errs.forEach(m=>all.push({cfg:tag,screen:'全程',type:'pageerror',sel:'page',text:'',detail:m.slice(0,100)}));
    await ctx.close();
    process.stdout.write(`${tag} 完成\n`);
  }
  await b.close();
  const errsOnly=all.filter(x=>ERR_TYPES.has(x.type)),smalls=all.filter(x=>x.type==='small');
  /* 依「類型＋元素＋文字」合併，列出出現在哪些寬度／模式 */
  const grp=new Map();for(const x of errsOnly){const k=[x.type,x.sel,x.text].join('|');const g=grp.get(k)||{x,cfgs:new Set(),screens:new Set()};g.cfgs.add(x.cfg);g.screens.add(x.screen);grp.set(k,g)}
  console.log('\n===== 錯誤類問題：'+grp.size+' 種（合併後）=====');
  for(const [k,g] of grp)console.log(`[${g.x.type}] ${g.x.sel}「${g.x.text}」 ${g.x.detail}\n    畫面：${[...g.screens].slice(0,4).join('、')}　設定：${[...g.cfgs].slice(0,4).join('、')}${g.cfgs.size>4?' 等'+g.cfgs.size+'組':''}`);
  const sg=new Map();for(const x of smalls){const k=x.sel+'|'+x.detail;sg.set(k,(sg.get(k)||0)+1)}
  console.log('\n===== 字太小（<16px，警告）：'+sg.size+' 種 =====');
  [...sg.entries()].sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,n])=>console.log('  '+k+'  ×'+n));
  fs.writeFileSync(arg('json','ui_scan_result.json'),JSON.stringify(all,null,1));
  console.log(errsOnly.length?'\nUI SCAN: FAIL':'\nUI SCAN: ALL OK');process.exit(errsOnly.length?1:0);
})();
