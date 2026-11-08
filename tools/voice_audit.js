/* 說說島｜語音稽核：走遍每個關卡、每個年級，按下所有「唸」按鈕與自動唸題，
   記錄哪些文字掉到「手機機器人語音」（沒有預錄曉臻音檔）。
   用法：node tools/voice_audit.js [--lv=1,2,3] [--rounds=2]   輸出：每關掉到機器人的文字（去重） */
const {chromium}=require('playwright');const path=require('path');
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.split('=')[1]:d};
const LVS=arg('lv','1,2,3').split(',').map(Number),ROUNDS=+arg('rounds',2);
const URL='file://'+path.resolve('index.html');
const profile=lv=>({cur:'p1',profiles:{p1:{name:'小明',av:'a:cat',lv,stars:60,st:{},snd:true,days:{},bonus:'',said:[],voice:'',units:[],coin:240}}});
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
  const rob=new Map(),pre=new Set();
  for(const lv of LVS){
    const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();
    await p.addInitScript(()=>{window.__R=[];
      try{speechSynthesis.speak=u=>{window.__R.push(u.text)};speechSynthesis.cancel=()=>{}}catch(e){}
      /* 模擬 iOS：沒帶檔名建立的共用元素可以連播；每段新建（帶檔名）的預錄 Audio 一律被擋（NotAllowedError） */
      window.Audio=function(f){const strict=!!f&&/audio\/sp/.test(f);const a={src:f||'',pause(){},play(){if(strict&&!a.src.__ok){return Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}))}window.__P=(window.__P||0)+1;setTimeout(()=>{a.onplay&&a.onplay();a.onended&&a.onended()},10);return Promise.resolve()}};return a};
    });
    await p.addInitScript(d=>localStorage.setItem('zizi_v2',JSON.stringify(d)),profile(lv));
    const click=async(sel,t=300)=>{try{const el=await p.$(sel);if(!el)return false;await el.scrollIntoViewIfNeeded({timeout:1000}).catch(()=>{});await el.click({timeout:1500,force:true});await p.waitForTimeout(t);return true}catch(e){return false}};
    const home=async()=>{for(let i=0;i<3;i++){const h=await p.$('section:not([hidden]) [data-home]');if(!h)break;await h.click({force:true}).catch(()=>{});await p.waitForTimeout(200)}await p.evaluate(()=>document.querySelectorAll('.prpop').forEach(e=>e.remove()))};
    await p.goto(URL);await p.waitForTimeout(1500);await p.evaluate(()=>document.querySelectorAll('.prpop').forEach(e=>e.remove()));
    const cats=[...new Set(await p.$$eval('#missions .node[data-cat]',a=>a.map(x=>x.dataset.cat)))];
    for(const k of cats){
      for(let r=0;r<ROUNDS;r++){
        await home();await p.evaluate(()=>{window.__R=[]});
        if(await click(`#missions .node[data-cat="${k}"]`,900)){if(await p.$('.tipbox')){await click('.tipbox [data-go]',600)}}else continue;
        for(let step=0;step<14;step++){
          const v=await p.evaluate(()=>{const s=[...document.querySelectorAll('section[id^=v-]')].find(s=>s.offsetHeight>0);return s?s.id:''});
          if(!v||v==='v-home'||v==='v-res')break;
          await p.waitForTimeout(700); /* 讓自動唸題（450ms）跑完 */
          /* 按所有唸／說按鈕 */
          const ids=await p.$$eval('section:not([hidden]) button[id],section:not([hidden]) [data-say]',a=>a.filter(x=>x.offsetHeight>0&&(/say|listen|prompt|tr1|tr2/i.test(x.id)||x.dataset.say)).map(x=>x.id?'#'+x.id:'[data-say="'+x.dataset.say.replace(/"/g,'\\"')+'"]'));
          for(const s of ids.slice(0,6)){await click(s,150)}
          const picks=['#v-quiz:not([hidden]) .opt:not(:disabled)','.zk.tap:not(.bad)','.mc:not(.done):not(:disabled)','.zc:not(.done):not(:disabled)','.chip:not(:disabled)','#qnext','#bnext','#fnext','.fbrow .btn:not(.alt):not(:disabled)','.opt:not(:disabled)','.card:not(.done)','button.tile:not(:disabled)'];
          let did=false;for(const s of picks){if(await click(s,350)){did=true;break}}
          /* 回饋出現後再按一次唸 */
          const ids2=await p.$$eval('section:not([hidden]) button[id]',a=>a.filter(x=>x.offsetHeight>0&&/say|listen/i.test(x.id)).map(x=>'#'+x.id));
          for(const s of ids2.slice(0,3)){await click(s,150)}
          if(!did)break;
        }
        const R=await p.evaluate(()=>window.__R.slice());
        for(const t of R){const key='L'+lv+' '+k;if(!rob.has(t))rob.set(t,new Set());rob.get(t).add(key)}
      }
    }
    await ctx.close();console.error('lv'+lv+' done');
  }
  await b.close();
  const byCat={};for(const [t,ks] of rob)for(const k of ks){const c=k.split(' ')[1];(byCat[c]=byCat[c]||new Set()).add(t)}
  for(const c of Object.keys(byCat)){console.log('=== 關卡 '+c+'（掉到機器人 '+byCat[c].size+' 句）');[...byCat[c]].slice(0,15).forEach(t=>console.log('  · '+t.slice(0,60)))}
  console.log(rob.size?'\nVOICE AUDIT: 有 '+rob.size+' 句走機器人':'\nVOICE AUDIT: ALL PRERECORDED');
})();
