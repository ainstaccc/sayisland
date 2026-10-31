/* 說說島｜我的島（3D）。依賴 three.min.js（r152）。對外只有 window.Island。
   座標：固定 10×10 格（gx,gz = 0..9），目前開放中間 N×N；擴島時舊東西不會移位。 */
(function(){
'use strict';
const T=window.THREE;if(!T){window.Island={ready:false};return}
/* ---------- 小工具 ---------- */
const MC={};
const mute=c=>{const col=new T.Color(c),h={};col.getHSL(h);col.setHSL(h.h,h.s*.74,Math.min(.93,h.l*.98+.015));return col};
const mat=(c,o)=>{const k=c+(o?JSON.stringify(o):'');return MC[k]||(MC[k]=new T.MeshStandardMaterial(Object.assign({color:mute(c),roughness:.86,metalness:0,flatShading:true},o||{})))};
const mesh=(g,c,x,y,z)=>{const m=new T.Mesh(g,c&&c.isMaterial?c:mat(c));m.position.set(x||0,y||0,z||0);m.castShadow=true;m.receiveShadow=true;return m};
const box=(w,h,d,c,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z);
const cyl=(rt,rb,h,c,x,y,z,s)=>mesh(new T.CylinderGeometry(rt,rb,h,s||12),c,x,y,z);
const cone=(r,h,c,x,y,z,s)=>mesh(new T.ConeGeometry(r,h,s||8),c,x,y,z);
const sph=(r,c,x,y,z,sx,sy,sz)=>{const m=mesh(new T.SphereGeometry(r,14,10),c,x,y,z);m.scale.set(sx||1,sy||1,sz||1);return m};
const ico=(r,c,x,y,z,d)=>mesh(new T.IcosahedronGeometry(r,d===undefined?1:d),c,x,y,z);
const G=(...p)=>{const g=new T.Group();p.forEach(m=>m&&g.add(m));return g};
const hash=(x,z,s)=>{let h=(x*374761393+z*668265263+(s||0)*2147483647)>>>0;h=(h^(h>>>13))*1274126177>>>0;return((h^(h>>>16))>>>0)/4294967295};
const glows=[];
const glowMat=(c,i)=>{const m=new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:0,roughness:.5,flatShading:true});m.userData.gi=i||1.4;glows.push(m);return m};
const P={grass:'#9CCB7E',grass2:'#8EC172',sand:'#F1E4C3',soil:'#C4A27C',soil2:'#A5835F',rock:'#9AA3B5',trunk:'#9C6B43',leaf:'#5DBB5A',leaf2:'#7BCF5F',leafD:'#3F9A55',pink:'#FFB7D0',white:'#FFFFFF',cream:'#FFF1D6',red:'#F46B6B',orange:'#FFA94D',yellow:'#FFD84D',blue:'#6FC3F2',purple:'#B79CF5',gray:'#CFCFD8',dark:'#5A4A6A'};

/* ---------- 道具（建構函式 + 目錄）---------- */
const B={};
B.tree=(x,z)=>{const g=G(cyl(.07,.1,.36,P.trunk,0,.18,0,7),ico(.3,P.leaf,0,.62,0),ico(.2,P.leaf2,.1,.88,.04));g.userData.sway=1;return g};
B.bigtree=()=>G(cyl(.12,.16,.5,P.trunk,0,.25,0,8),ico(.46,P.leaf,0,.88,0),ico(.34,P.leaf2,-.12,1.28,.05),ico(.26,P.leaf,.1,1.55,0));
B.pine=()=>G(cyl(.07,.09,.3,P.trunk,0,.15,0,7),cone(.4,.45,P.leafD,0,.5,0,7),cone(.31,.42,P.leaf,0,.82,0,7),cone(.22,.38,P.leafD,0,1.1,0,7));
B.sakura=()=>G(cyl(.08,.11,.4,'#8B5E3C',0,.2,0,7),ico(.36,P.pink,0,.72,0),ico(.24,'#FFC9DD',.18,.95,.05),ico(.2,'#FFA6C4',-.18,.9,-.08));
B.bush=()=>G(ico(.26,P.leaf,-.1,.2,0),ico(.22,P.leaf2,.14,.17,.05),ico(.16,P.leafD,.02,.12,.18));
B.flowers=(x,z)=>{const g=G(cyl(.4,.4,.04,'#7FCB57',0,.02,0,10));const cs=[P.pink,P.yellow,P.white,P.purple,P.orange];for(let i=0;i<5;i++){const a=i*1.26+hash(x,z)*3,r=.2;const px=Math.cos(a)*r,pz=Math.sin(a)*r;g.add(cyl(.012,.012,.16,P.leafD,px,.1,pz,4),sph(.06,cs[(i+((hash(x,z,2)*5)|0))%5],px,.2,pz))}return g};
B.sunflower=()=>{const g=G(cyl(.025,.03,.5,P.leafD,0,.25,0,6),cyl(.06,.06,.12,'#9BDD6B',-.05,.2,0,6));const f=G(cyl(.17,.17,.04,P.yellow,0,0,0,12),cyl(.09,.09,.06,'#7A4B2A',0,.02,0,10));f.position.set(0,.55,.03);f.rotation.x=1.2;g.add(f);return g};
B.rock=()=>G(ico(.24,P.rock,-.08,.12,0,0),ico(.15,'#B5BCCB',.18,.08,.1,0));
B.mushroom=()=>{const cap=mesh(new T.SphereGeometry(.2,12,8,0,6.283,0,1.57),P.red,0,.2,0);const g=G(cyl(.06,.08,.2,P.cream,0,.1,0,8),cap);[[.1,.3,.06],[-.08,.32,-.08],[.0,.38,.0],[-.12,.26,.08]].forEach(p=>g.add(sph(.03,P.white,p[0],p[1],p[2])));return g};
B.pond=()=>{const w=mat('#6FD0F0',{roughness:.2,metalness:.1,transparent:true,opacity:.92});const g=G(cyl(.47,.47,.05,P.sand,0,.02,0,16),mesh(new T.CylinderGeometry(.38,.38,.05,16),w,0,.045,0),sph(.1,P.leafD,.12,.075,.06,1,.15,1));g.userData.anim=t=>{g.children[1].scale.setScalar(1+Math.sin(t*2)*.03)};return g};
const eyes=(g,x,y,z,s)=>{g.add(sph(.025*(s||1),'#2B2B3A',x-.06*(s||1),y,z),sph(.025*(s||1),'#2B2B3A',x+.06*(s||1),y,z))};
B.sheep=(x,z)=>{const g=G(ico(.2,P.white,0,.28,0,1),sph(.1,'#3A3A4A',0,.3,.22),cyl(.025,.025,.14,'#3A3A4A',-.09,.07,.08,5),cyl(.025,.025,.14,'#3A3A4A',.09,.07,.08,5),cyl(.025,.025,.14,'#3A3A4A',-.09,.07,-.08,5),cyl(.025,.025,.14,'#3A3A4A',.09,.07,-.08,5));eyes(g,0,.34,.3,.9);g.rotation.y=hash(x,z)*6;roam(g,{r:.6,sp:.2,gait:'trot'});return g};
B.bunny=(x,z)=>{const g=G(sph(.17,P.white,0,.2,0,1,.9,1.1),sph(.12,P.white,0,.34,.14),sph(.04,P.pink,0,.2,-.2),box(.05,.22,.03,P.white,-.05,.55,.12),box(.05,.22,.03,P.white,.05,.55,.12));g.children[3].scale.set(1,1,1);g.children[4].children;eyes(g,0,.37,.24,.8);g.add(sph(.025,P.pink,0,.33,.26));g.rotation.y=hash(x,z)*6;roam(g,{r:.65,sp:.3,gait:'hop'});return g};
B.duck=(x,z)=>{const g=G(sph(.17,P.yellow,0,.17,0,1,.85,1.15),sph(.11,P.yellow,0,.35,.13),cone(.045,.1,P.orange,0,.34,.25,4),sph(.07,'#FFE680',0,.2,-.16));g.children[2].rotation.x=1.57;eyes(g,0,.4,.2,.8);g.rotation.y=hash(x,z)*6;roam(g,{r:.6,sp:.18,gait:'waddle'});return g};
B.cat=(x,z)=>{const g=G(sph(.16,P.orange,0,.2,0,1,1,1.2),sph(.12,P.orange,0,.38,.15),cone(.04,.09,P.orange,-.07,.5,.15,4),cone(.04,.09,P.orange,.07,.5,.15,4),cyl(.025,.03,.26,P.orange,0,.2,-.2,6));g.children[4].rotation.x=-.8;eyes(g,0,.4,.26,.8);g.add(sph(.02,P.pink,0,.36,.28));g.rotation.y=hash(x,z)*6;roam(g,{r:.6,sp:.25,gait:'trot',extra:t=>{g.children[4].rotation.z=Math.sin(t*3)*.4}});return g};
B.penguin=(x,z)=>{const g=G(sph(.17,'#35405A',0,.22,0,1,1.25,.9),sph(.12,P.white,0,.2,.06,1,1.2,.8),sph(.09,'#35405A',0,.46,0),cone(.03,.07,P.orange,0,.45,.1,4),sph(.05,'#35405A',-.17,.2,0,.5,1.3,1),sph(.05,'#35405A',.17,.2,0,.5,1.3,1));g.children[3].rotation.x=1.57;eyes(g,0,.49,.08,.7);g.rotation.y=hash(x,z)*6;roam(g,{r:.55,sp:.15,gait:'waddle'});return g};
B.path=(x,z)=>G(cyl(.56,.56,.05,'#E6D5B8',0,.02,0,6),cyl(.17,.17,.06,'#D4C09A',-.2,.03,-.18,6),cyl(.15,.15,.06,'#D4C09A',.2,.03,.1,6),cyl(.13,.13,.06,'#CDB88F',-.05,.03,.3,6));
B.house=(x,z)=>{const rc=[P.red,'#6FA8F5','#B79CF5','#FFA94D'][(hash(x,z)*4)|0];const w=glowMat('#FFE9A0',1.2);const g=G(rbox(.72,.5,.6,P.cream,0,.25,0,.06),mesh(new T.ConeGeometry(.6,.38,4),rc,0,.69,0),box(.14,.26,.04,'#9C6B43',0,.13,.31),box(.14,.14,.04,w,-.22,.3,.31),box(.14,.14,.04,w,.22,.3,.31),box(.1,.2,.1,P.gray,.22,.82,-.1));g.children[1].rotation.y=.785;g.children[1].scale.set(1,1,.85);g.userData.smoke=[.22,.9,-.1];return g};
B.bakery=()=>{const w=glowMat('#FFE9A0',1.2);const g=G(rbox(.8,.5,.62,'#FFD9E4',0,.25,0,.07),box(.8,.06,.62,'#FF9EBB',0,.52,0),w&&box(.3,.2,.04,w,.2,.26,.32),box(.16,.34,.04,'#9C6B43',-.24,.17,.32));for(let i=0;i<5;i++)g.add(box(.17,.04,.26,i%2?P.white:P.red,-.34+i*.17,.46,.4).rotateX?box(.17,.04,.26,i%2?P.white:P.red,-.34+i*.17,.46,.4):null);g.add(cyl(.1,.1,.08,'#E3A857',.2,.58,0,8),sph(.07,'#E3A857',-.2,.6,0,1.4,.8,.8));return g};
B.windmill=()=>{const bl=G();for(let i=0;i<4;i++){const a=box(.08,.5,.02,P.white,0,.28,0);const h=G(a);h.rotation.z=i*1.5708;bl.add(h)}bl.position.set(0,.85,.24);const g=G(cyl(.2,.32,.8,P.cream,0,.4,0,8),cone(.28,.3,P.red,0,.95,0,8),box(.1,.2,.02,'#9C6B43',0,.1,.3),cyl(.04,.04,.1,P.dark,0,.85,.2,6),bl);g.children[3].rotation.x=1.57;g.userData.anim=t=>{bl.rotation.z=t*1.2};return g};
B.lamp=()=>{const w=glowMat('#FFE9A0',2);return G(cyl(.03,.04,.7,P.dark,0,.35,0,6),cyl(.07,.07,.04,P.dark,0,.02,0,8),sph(.1,w,0,.76,0),cone(.12,.1,P.dark,0,.88,0,6))};
B.bench=(x,z)=>{const g=G(rbox(.6,.06,.22,'#C98B55',0,.22,0,.03),box(.6,.22,.05,'#C98B55',0,.38,-.1),box(.05,.22,.2,P.dark,-.25,.11,0),box(.05,.22,.2,P.dark,.25,.11,0));g.rotation.y=((hash(x,z)*4)|0)*1.5708;return g};
B.tent=()=>{const g=G(cone(.5,.7,P.orange,0,.35,0,4),cone(.2,.22,P.cream,0,.1,.3,3),cyl(.01,.01,.3,P.dark,0,.85,0,4),box(.14,.08,.01,P.red,.07,.95,0));g.children[0].rotation.y=.785;g.children[1].rotation.x=1.57;g.children[1].position.set(0,.18,.3);return g};
B.mailbox=()=>G(cyl(.03,.03,.4,P.dark,0,.2,0,6),mesh(new T.CylinderGeometry(.1,.1,.26,10,1,false,0,3.14),P.red,0,.45,0),box(.2,.2,.26,P.red,0,.36,0)).rotateY?G(cyl(.03,.03,.4,P.dark,0,.2,0,6),box(.22,.16,.28,P.red,0,.46,0),box(.2,.04,.26,'#D84D4D',0,.55,0),box(.04,.1,.02,P.yellow,.13,.5,.08)):null;
B.fountain=()=>{const w=mat('#7FD6F5',{roughness:.2,transparent:true,opacity:.9});const g=G(cyl(.42,.46,.16,P.gray,0,.08,0,14),mesh(new T.CylinderGeometry(.34,.34,.04,14),w,0,.17,0),cyl(.06,.08,.34,P.gray,0,.3,0,8),cyl(.16,.1,.06,P.gray,0,.5,0,10));const d=[];for(let i=0;i<4;i++){const s=sph(.035,'#BFEAFF',0,.5,0);g.add(s);d.push(s)}g.userData.anim=t=>{d.forEach((s,i)=>{const k=(t*1.3+i*.25)%1,a=i*1.57;s.position.set(Math.cos(a)*k*.25,.52+Math.sin(k*3.14)*.25,Math.sin(a)*k*.25)})};return g};
B.campfire=()=>{const f=glowMat('#FFB347',2.4);const fl=cone(.1,.3,f,0,.25,0,5);const g=G(cyl(.04,.04,.4,'#7A4B2A',0,.06,0,5),cyl(.04,.04,.4,'#7A4B2A',0,.06,0,5),fl,ico(.04,P.rock,.28,.04,.1,0),ico(.04,P.rock,-.28,.04,-.1,0),ico(.05,P.rock,.1,.04,-.28,0),ico(.05,P.rock,-.1,.04,.28,0));g.children[0].rotation.set(1.4,0,.8);g.children[1].rotation.set(1.4,0,-.8);g.userData.anim=t=>{fl.scale.set(1+Math.sin(t*9)*.15,1+Math.sin(t*7)*.2,1+Math.sin(t*9)*.15)};return g};
B.swing=()=>{const s=G(box(.2,.03,.1,'#C98B55',0,0,0),cyl(.006,.006,.5,P.dark,-.09,.25,0,3),cyl(.006,.006,.5,P.dark,.09,.25,0,3));s.position.set(0,.58,0);const g=G(cyl(.025,.025,.7,'#C98B55',-.3,.35,0,5),cyl(.025,.025,.7,'#C98B55',.3,.35,0,5),box(.7,.05,.05,'#C98B55',0,.7,0),s);g.userData.anim=t=>{s.rotation.x=Math.sin(t*2)*.5};return g};
B.slide=()=>{const g=G(box(.04,.5,.04,P.dark,-.15,.25,-.2),box(.04,.5,.04,P.dark,.15,.25,-.2),box(.34,.04,.2,P.blue,0,.5,-.2),box(.3,.03,.7,P.yellow,0,.27,.15),box(.04,.12,.7,P.red,-.16,.31,.15),box(.04,.12,.7,P.red,.16,.31,.15));g.children[3].rotation.x=.6;g.children[4].rotation.x=.6;g.children[5].rotation.x=.6;return g};
B.lighthouse=()=>{const w=glowMat('#FFF3B0',2.4);const g=G(cyl(.2,.3,.5,P.white,0,.25,0,10),cyl(.17,.2,.4,P.red,0,.7,0,10),cyl(.15,.17,.35,P.white,0,1.07,0,10),cyl(.2,.2,.04,P.dark,0,1.27,0,10),cyl(.13,.13,.2,w,0,1.38,0,10),cone(.2,.22,P.red,0,1.58,0,10),box(.1,.16,.03,'#9C6B43',0,.08,.3));return g};
B.rainbow=()=>{const g=new T.Group();['#FF6B6B','#FFA94D','#FFD84D','#6BCB77','#6FC3F2','#B79CF5'].forEach((c,i)=>{const t=mesh(new T.TorusGeometry(.85-i*.07,.035,6,24,3.1416),mat(c,{flatShading:false}),0,0,0);t.castShadow=false;g.add(t)});g.children.forEach(t=>{t.position.y=0});g.add(sph(.14,P.white,-.85,.08,0,1.5,.8,1),sph(.14,P.white,.85,.08,0,1.5,.8,1));return g};
B.balloon=()=>{const g=new T.Group();const cs=['#FF6B6B','#FFD84D','#6FC3F2','#FFA94D'];const b=sph(.34,P.red,0,1.15,0,1,1.1,1);g.add(b);for(let i=0;i<4;i++){const s=mesh(new T.SphereGeometry(.345,8,10,i*1.5708,.78),cs[i],0,1.15,0);s.scale.set(1,1.1,1);g.add(s)}g.add(box(.2,.14,.2,'#C98B55',0,.62,0),cyl(.005,.005,.4,P.dark,-.08,.8,-.08,3),cyl(.005,.005,.4,P.dark,.08,.8,.08,3));g.userData.anim=t=>{g.position.y=Math.sin(t*1.2)*.08};g.userData.baseY=0;return g};
B.ferris=()=>{const wheel=new T.Group();const col=['#FF6B6B','#FFD84D','#6FC3F2','#B79CF5','#6BCB77','#FFA94D','#FF9EBB','#7FD6F5'];const cabs=[];wheel.add(mesh(new T.TorusGeometry(.8,.03,6,28),P.white,0,0,0));wheel.add(mesh(new T.TorusGeometry(.4,.025,6,20),P.white,0,0,0));for(let i=0;i<8;i++){const a=i*Math.PI/4;const sp=box(1.6,.025,.025,P.gray,0,0,0);sp.rotation.z=a;if(i<4)wheel.add(sp);const c=box(.2,.16,.18,col[i],Math.cos(a)*.8,Math.sin(a)*.8,0);wheel.add(c);cabs.push(c)}wheel.position.set(0,1.05,0);const g=G(wheel,box(.06,1.1,.06,P.dark,-.5,.5,.15),box(.06,1.1,.06,P.dark,.5,.5,.15),box(.06,1.1,.06,P.dark,-.5,.5,-.15),box(.06,1.1,.06,P.dark,.5,.5,-.15),box(1.2,.05,.4,P.gray,0,.02,0));g.children[1].rotation.z=.4;g.children[2].rotation.z=-.4;g.children[3].rotation.z=.4;g.children[4].rotation.z=-.4;g.userData.anim=t=>{wheel.rotation.z=t*.35;cabs.forEach(c=>c.rotation.z=-wheel.rotation.z)};return g};
B.carousel=()=>{const top=G(cone(.85,.45,P.pink,0,.0,0,12),cyl(.02,.02,.3,P.yellow,0,.3,0,4),sph(.05,P.yellow,0,.5,0));top.position.y=1.1;const rot=new T.Group();const cs=[P.white,P.pink,P.yellow,P.blue];for(let i=0;i<4;i++){const a=i*1.5708;const h=G(sph(.12,cs[i],0,.35,0,1.2,.9,.8),sph(.07,cs[i],.1,.45,0),cyl(.01,.01,.7,P.yellow,0,.5,0,3));h.position.set(Math.cos(a)*.55,0,Math.sin(a)*.55);h.rotation.y=-a;rot.add(h)}const g=G(cyl(.8,.85,.12,P.cream,0,.06,0,16),cyl(.04,.04,.9,P.yellow,0,.55,0,6),rot,top);g.userData.anim=t=>{rot.rotation.y=t*.8;rot.children.forEach((h,i)=>{h.position.y=Math.sin(t*3+i*1.57)*.06})};return g};
B.castle=()=>{const tw=(x,z,h,c)=>G(cyl(.2,.22,h,c,x,h/2,z,10),cone(.26,.32,P.red,x,h+.16,z,10),box(.06,.1,.02,'#6FC3F2',x,h*.6,z+.2));const w=glowMat('#FFE9A0',1.2);const g=G(rbox(1.0,.7,.7,P.cream,0,.35,0,.08),box(1.0,.08,.7,P.gray,0,.74,0),tw(-.6,-.4,1.0,P.cream),tw(.6,-.4,1.0,P.cream),tw(-.6,.4,.8,P.cream),tw(.6,.4,.8,P.cream),box(.28,.4,.04,'#9C6B43',0,.2,.36),box(.14,.16,.03,w,-.3,.45,.36),box(.14,.16,.03,w,.3,.45,.36));for(let i=0;i<5;i++)g.add(box(.12,.1,.1,P.gray,-.4+i*.2,.83,.28));return g};

function rbox(w,h,d,c,x,y,z,r){r=r===undefined?Math.min(w,d)*.2:r;const hw=w/2,hd=d/2,sh=new T.Shape();
 sh.moveTo(-hw+r,-hd);sh.lineTo(hw-r,-hd);sh.quadraticCurveTo(hw,-hd,hw,-hd+r);sh.lineTo(hw,hd-r);sh.quadraticCurveTo(hw,hd,hw-r,hd);sh.lineTo(-hw+r,hd);sh.quadraticCurveTo(-hw,hd,-hw,hd-r);sh.lineTo(-hw,-hd+r);sh.quadraticCurveTo(-hw,-hd,-hw+r,-hd);
 const g=new T.ExtrudeGeometry(sh,{depth:Math.max(.01,h-.04),bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2,curveSegments:4});
 g.rotateX(-Math.PI/2);g.translate(0,-(h/2-.02),0);return mesh(g,mat(c,{flatShading:false}),x,y,z)}
/* ---------- 人物 ---------- */
function person(o){
 const skin=o.skin||'#FFD9B8',bot=o.bottom||'#4A5A8A',top=o.top||'#FF8FB7';
 const g=new T.Group();
 const legL=cyl(.05,.05,.2,bot,-.06,.1,0,8),legR=cyl(.05,.05,.2,bot,.06,.1,0,8);
 const body=o.robe?cone(.2,.42,top,0,.25,0,12):cyl(.11,.14,.28,top,0,.32,0,12);
 const head=sph(.16,skin,0,.62,0);
 const armL=G(cyl(.035,.035,.2,top,0,-.08,0,6),sph(.045,skin,0,-.19,0));armL.position.set(-.15,.42,0);armL.rotation.z=.25;
 const armR=G(cyl(.035,.035,.2,top,0,-.08,0,6),sph(.045,skin,0,-.19,0));armR.position.set(.15,.42,0);armR.rotation.z=-.25;
 g.add(legL,legR,body,head,armL,armR);
 const hairM=mesh(new T.SphereGeometry(.172,14,10,0,6.283,0,1.75),o.hair||'#3A2A22',0,.625,-.012);g.add(hairM);
 if(o.longHair)g.add(sph(.15,o.hair,0,.5,-.1,1,1.35,.6));
 g.add(sph(.025,'#2B2B3A',-.06,.62,.145),sph(.025,'#2B2B3A',.06,.62,.145),sph(.03,'#FFB0B8',-.105,.58,.125,1,.7,.5),sph(.03,'#FFB0B8',.105,.58,.125,1,.7,.5),mesh(new T.TorusGeometry(.03,.007,5,10,3.1),'#C55A6A',0,.57,.15));
 g.children[g.children.length-1].rotation.z=3.14;
 const ph=Math.random()*6;
 g.userData.parts={armL,armR,legL,legR,body,head,ph};
 return g;
}
function addWander(g,r,spd){const u=g.userData;roam(g,{sp:.45,gait:'walk',extra:t=>{if(u.extra)u.extra(t)}})}
B.c_student=()=>{const g=person({top:'#6FC3F2',bottom:'#4A5A8A',hair:'#2B2420'});g.add(rbox(.2,.26,.1,'#FF8FB7',0,.33,-.15,.04));addWander(g,.22,.35);return g};
B.c_chef=()=>{const g=person({top:'#FFFFFF',bottom:'#5A5A6A',hair:'#6B4A2E'});g.add(cyl(.14,.12,.12,'#FFFFFF',0,.8,0,12),sph(.15,'#FFFFFF',0,.9,0,1,.8,1),cyl(.02,.02,.05,'#FFFFFF',0,.78,0,6));g.add(sph(.03,'#E04B4B',-.03,.34,.12),sph(.03,'#E04B4B',.03,.3,.12));addWander(g,.2,.3);return g};
B.c_gardener=()=>{const g=person({top:'#7CCB6A',bottom:'#6A8E4E',hair:'#8B5A2B'});g.add(cyl(.27,.27,.025,'#F0D58A',0,.76,0,16),cyl(.15,.17,.1,'#F0D58A',0,.82,0,14),cyl(.17,.17,.025,'#E04B4B',0,.79,0,14));g.add(box(.1,.08,.07,'#6FC3F2',.27,.15,.05),cyl(.01,.01,.12,'#6FC3F2',.31,.2,.05,4));addWander(g,.24,.32);return g};
B.c_painter=()=>{const g=person({top:'#FFB347',bottom:'#4A5A8A',hair:'#2B2420'});const b=sph(.17,'#E04B4B',0,.79,0,1,.35,1);b.rotation.z=.2;g.add(b,sph(.03,'#E04B4B',.05,.88,0));const pal=cyl(.1,.1,.015,'#F5E6C8',.24,.34,.1,12);pal.rotation.x=1.2;g.add(pal,sph(.02,'#FF6B6B',.22,.35,.07),sph(.02,'#6FC3F2',.27,.34,.12),sph(.02,'#FFD84D',.2,.33,.14));addWander(g,.2,.3);return g};
B.c_pirate=()=>{const g=person({top:'#2B2B3A',bottom:'#5A3A2A',hair:'#2B2420'});g.add(cone(.2,.12,'#23232E',0,.82,0,3),box(.4,.04,.16,'#23232E',0,.77,0),sph(.035,'#FFFFFF',0,.82,.06),box(.2,.07,.04,'#E04B4B',0,.46,.1),sph(.045,'#1B1B22',.065,.63,.14));const sw=cyl(.012,.012,.3,'#CFCFD8',.27,.3,0,4);sw.rotation.z=.4;g.add(sw);addWander(g,.22,.34);return g};
B.c_astronaut=()=>{const g=person({top:'#F4F6FA',bottom:'#E4E8F2',hair:'#2B2420'});const gl=new T.Mesh(new T.SphereGeometry(.24,16,12),new T.MeshStandardMaterial({color:'#BFE6FF',transparent:true,opacity:.35,roughness:.1,metalness:.3}));gl.position.set(0,.64,0);g.add(gl,rbox(.22,.3,.1,'#CFD6E6',0,.34,-.15,.04),sph(.04,'#E04B4B',.07,.4,.13),sph(.04,'#6FC3F2',-.07,.4,.13));g.userData.extra=null;addWander(g,.2,.28);return g};
B.c_wizard=()=>{const g=person({top:'#7A5AC8',hair:'#E8E8F0',robe:true});g.add(cone(.2,.5,'#5B3FA8',0,.98,0,10),cyl(.26,.26,.03,'#5B3FA8',0,.74,0,14),sph(.04,'#FFD84D',.05,1.0,.14));const st=cyl(.015,.015,.8,'#8A5A3A',.27,.4,.06,5);g.add(st,sph(.06,'#7FD6F5',.27,.82,.06));g.add(sph(.15,'#E8E8F0',0,.5,.1,1,1.2,.5));g.userData.extra=t=>{st.children;};addWander(g,.2,.26);return g};
B.c_princess=()=>{const g=person({top:'#FF8FB7',hair:'#FFD070',longHair:true,robe:true});const cr=G(cyl(.13,.14,.06,'#FFD84D',0,0,0,10));for(let i=0;i<5;i++){const a=i*1.2566;const sp=cone(.03,.07,'#FFD84D',Math.cos(a)*.12,.06,Math.sin(a)*.12,4);cr.add(sp)}cr.position.y=.8;g.add(cr,sph(.025,'#E04B4B',0,.8,.13));addWander(g,.2,.28);return g};
B.c_fairy=()=>{const g=person({top:'#8EE6C8',hair:'#FFB7D0',longHair:true,robe:true});const wm=new T.MeshStandardMaterial({color:'#D8F4FF',transparent:true,opacity:.7,roughness:.3,emissive:'#BEE9FF',emissiveIntensity:.25});const w1=new T.Mesh(new T.SphereGeometry(.18,10,8),wm),w2=w1.clone();w1.scale.set(.3,1,.12);w2.scale.set(.3,1,.12);w1.position.set(-.16,.5,-.12);w2.position.set(.16,.5,-.12);w1.rotation.z=.4;w2.rotation.z=-.4;g.add(w1,w2);const sp=[];for(let i=0;i<4;i++){const s=sph(.02,'#FFF3A0',0,.5,0);g.add(s);sp.push(s)}g.userData.extra=t=>{w1.rotation.y=Math.sin(t*14)*.4;w2.rotation.y=-Math.sin(t*14)*.4;sp.forEach((s,i)=>{const k=(t*.8+i*.25)%1;s.position.set(Math.cos(i*1.6+t)*.25*k,.55-k*.4+.2,Math.sin(i*1.6+t)*.25*k);s.scale.setScalar(1-k)})};addWander(g,.2,.3);return g};
B.c_dragon=()=>{const g=person({top:'#6BCB77',bottom:'#4A9A5A',hair:'#6BCB77'});g.add(cone(.04,.12,'#FFE680',-.09,.8,.02,5),cone(.04,.12,'#FFE680',.09,.8,.02,5));const tl=cone(.05,.3,'#6BCB77',0,.12,-.2,6);tl.rotation.x=-1.9;g.add(tl,cone(.03,.06,'#FFE680',0,.1,-.34,4));for(let i=0;i<3;i++)g.add(cone(.03,.07,'#FFE680',0,.4-i*.09,-.14-i*.03,4));g.userData.extra=t=>{tl.rotation.z=Math.sin(t*4)*.3};addWander(g,.22,.3);return g};

/* ---------- v1.6.1 造型加細節 ---------- */
const chain=(g,f)=>{const o=g.userData.anim;g.userData.anim=t=>{if(o)o(t);f(t)}};
const flag=(c,x,y,z,h)=>{const f=box(.2,.12,.015,c,.1,0,0);const gr=G(f);gr.position.set(x,y,z);gr.userData.f=f;return gr};
const EN={
 tree:(g,x,z)=>{g.add(cyl(.11,.15,.06,P.trunk,0,.03,0,7),ico(.14,P.leaf,-.2,.5,.08,0),ico(.12,'#B9EE8A',.06,1.02,-.04,0));const a=hash(x,z,7);if(a>.5)[[.2,.66,.18],[-.15,.8,.2],[.1,.5,-.24]].forEach(p=>g.add(sph(.035,'#FF5C5C',p[0],p[1],p[2])))},
 bigtree:g=>{g.add(cyl(.16,.2,.07,P.trunk,0,.03,0,8),ico(.2,'#B9EE8A',.2,1.5,.1,0),box(.3,.04,.2,'#C98B55',.22,.62,0),box(.02,.18,.02,'#8B5E3C',.1,.54,.08),box(.02,.18,.02,'#8B5E3C',.34,.54,.08))},
 pine:g=>{g.add(sph(.05,'#FFE680',0,1.34,0),cone(.46,.06,'#7FD06A',0,.3,0,7));[[.12,.5,.3],[-.2,.82,.22],[.1,1.08,.17]].forEach(p=>g.add(sph(.03,['#FF6B6B','#FFD84D','#6FC3F2'][Math.floor(p[1]*3)%3],p[0],p[1],p[2])))},
 sakura:g=>{const ps=[];for(let i=0;i<7;i++){const m=box(.045,.008,.03,'#FFC9DD',0,0,0);g.add(m);ps.push(m)}chain(g,t=>{ps.forEach((m,i)=>{const k=(t*.35+i*.143)%1;m.position.set(Math.sin(i*2.1+k*4)*.38,.95-k*.9,Math.cos(i*1.7+k*3)*.38);m.rotation.set(k*9+i,k*6,0);m.visible=k<.98})});g.add(cyl(.11,.14,.05,'#8B5E3C',0,.02,0,7))},
 bush:g=>{[[.05,.3,.1],[-.12,.26,.12],[.16,.25,-.02]].forEach(p=>g.add(sph(.03,'#FF8FB7',p[0],p[1],p[2])))},
 flowers:g=>{const bee=G(sph(.03,'#FFD84D',0,0,0,1.3,1,1),box(.012,.034,.034,'#2B2B3A',0,0,0),sph(.025,'#FFFFFF',0,.03,0,1,.3,1.6));g.add(bee);chain(g,t=>{bee.position.set(Math.sin(t*1.4)*.3,.35+Math.sin(t*5)*.03,Math.cos(t*1.4)*.3);bee.rotation.y=-t*1.4})},
 sunflower:g=>{g.add(sph(.04,'#6B4A2E',.0,.5,.0),cone(.05,.1,'#6BCB77',.08,.14,0,4));chain(g,t=>{g.rotation.y=Math.sin(t*.5)*.4})},
 rock:g=>{g.add(sph(.06,'#7FCB57',.0,.2,.1,1.4,.5,1.2),sph(.03,'#FF9EBB',.05,.25,.12))},
 mushroom:g=>{g.add(sph(.035,'#FFFFFF',-.05,.3,.14),sph(.03,'#FFFFFF',.08,.32,.08),sph(.04,P.red,.2,.06,.1,1,.7,1),cyl(.03,.035,.07,'#FFF3DC',.2,.03,.1,6))},
 sheep:g=>{g.add(ico(.13,P.white,-.12,.38,.04,1),ico(.13,P.white,.12,.38,.04,1),ico(.12,P.white,0,.42,-.1,1),box(.06,.08,.02,'#3A3A4A',-.1,.4,.25),box(.06,.08,.02,'#3A3A4A',.1,.4,.25));chain(g,t=>{g.children[1].rotation.x=Math.sin(t*1.2)*.12})},
 duck:g=>{g.add(sph(.07,P.yellow,-.14,.2,0,.5,1,1.3),sph(.07,P.yellow,.14,.2,0,.5,1,1.3),cone(.05,.1,'#FFD84D',0,.27,-.2,3),sph(.025,'#FF9A3D',-.05,.04,.1,1.5,.4,2),sph(.025,'#FF9A3D',.05,.04,.1,1.5,.4,2))},
 bunny:g=>{g.add(sph(.05,'#FFB7C5',-.06,.1,.18,1,.6,1),sph(.05,'#FFB7C5',.06,.1,.18,1,.6,1));chain(g,t=>{g.scale.y=1+Math.max(0,Math.sin(t*1.6))*.03})},
 cat:g=>{const tl=G(cyl(.02,.025,.22,P.orange,0,.1,0,5),sph(.03,P.orange,0,.22,0));tl.position.set(0,.18,-.2);tl.rotation.x=-.5;g.add(tl,box(.18,.012,.012,'#FFFFFF',0,.34,.27),box(.02,.1,.01,'#C97A2E',-.05,.26,.2),box(.02,.1,.01,'#C97A2E',.05,.26,.2));chain(g,t=>{tl.rotation.z=Math.sin(t*2.5)*.5})},
 penguin:g=>{g.add(sph(.08,'#35405A',-.17,.24,0,.4,1.2,.9),sph(.08,'#35405A',.17,.24,0,.4,1.2,.9),sph(.04,'#FF9A3D',-.05,.02,.1,1.4,.4,2),sph(.04,'#FF9A3D',.05,.02,.1,1.4,.4,2),box(.2,.025,.04,'#FF6B6B',0,.42,.1));chain(g,t=>{g.rotation.z=Math.sin(t*2.2)*.06})},
 house:g=>{g.add(box(.76,.035,.64,'#FFFFFF',0,.5,0),box(.2,.03,.06,'#6B7A99',0,.02,.36),box(.18,.18,.03,'#FFFFFF',-.22,.3,.3),box(.18,.18,.03,'#FFFFFF',.22,.3,.3),box(.2,.05,.07,'#9C6B43',-.22,.18,.34),box(.2,.05,.07,'#9C6B43',.22,.18,.34),sph(.02,'#FF6B8B',-.27,.22,.37),sph(.02,'#FFD84D',-.2,.22,.37),sph(.02,'#FF6B8B',.2,.22,.37),sph(.02,'#FFD84D',.27,.22,.37),sph(.018,'#FFD84D',.04,.14,.34),box(.16,.03,.05,'#E5E5EE',.22,.92,-.1))},
 bakery:g=>{[0,1,2,3,4].forEach(i=>g.add(box(.16,.03,.2,i%2?'#FFFFFF':'#FF8FB7',-.32+i*.16,.46,.38).rotateX(.35)));g.add(sph(.05,'#E8A857',-.15,.14,.34,1.4,.8,1),sph(.05,'#E8A857',.15,.14,.34,1.4,.8,1),box(.2,.1,.02,'#8B5E3C',0,.72,.32),sph(.03,'#FFD84D',0,.72,.34))},
 windmill:g=>{g.add(cyl(.26,.34,.06,'#9AA3B5',0,.03,0,8),box(.16,.16,.02,'#FFFFFF',0,.5,.26),box(.1,.1,.03,'#6FC3F2',0,.5,.265),box(.16,.03,.05,'#9C6B43',0,.2,.3))},
 lamp:g=>{g.add(cyl(.07,.07,.03,P.dark,0,.015,0,8),sph(.02,'#FFD84D',0,.75,0))},
 bench:g=>{g.add(box(.04,.14,.04,P.dark,-.25,.07,.08),box(.04,.14,.04,P.dark,.25,.07,.08),sph(.04,'#FF8FB7',.2,.27,0))},
 tent:g=>{const f=flag('#FF6B6B',0,.8,0);g.add(f,sph(.035,'#FFD84D',.15,.35,.3));chain(g,t=>{f.userData.f.rotation.y=Math.sin(t*4)*.5})},
 mailbox:g=>{g.add(box(.1,.06,.01,'#FF6B6B',.0,.45,.1),box(.04,.04,.12,'#FFFFFF',.12,.36,0))},
 fountain:g=>{const rg=new T.Mesh(new T.RingGeometry(.12,.16,24),new T.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:.5,side:2,fog:false}));rg.rotation.x=-1.5708;rg.position.y=.2;g.add(rg);for(let i=0;i<8;i++)g.add(box(.1,.08,.1,'#B5BCCB',Math.cos(i*.785)*.44,.2,Math.sin(i*.785)*.44).rotateY(-i*.785));chain(g,t=>{const k=(t*.6)%1;rg.scale.setScalar(1+k*1.6);rg.material.opacity=.5*(1-k)})},
 campfire:g=>{const sp=[];for(let i=0;i<5;i++){const s=sph(.015,'#FFD84D',0,0,0);g.add(s);sp.push(s)}chain(g,t=>{sp.forEach((s,i)=>{const k=(t*.6+i*.2)%1;s.position.set(Math.sin(i*3+k*5)*.12,.35+k*.6,Math.cos(i*2+k*4)*.12);s.scale.setScalar(1-k*.8)})})},
 lighthouse:g=>{const bm=new T.Mesh(new T.ConeGeometry(.3,1.1,10,1,true),new T.MeshBasicMaterial({color:'#FFF3B0',transparent:true,opacity:.1,side:2,fog:false,depthWrite:false}));bm.rotation.x=-1.5708;const pv=G(bm);bm.position.z=.55;g.add(pv);chain(g,t=>{pv.rotation.y=t*1.5})},
 castle:g=>{const fs=[[-.6,1.3,-.4,'#FF6B6B'],[.6,1.3,-.4,'#6FC3F2'],[-.6,1.1,.4,'#FFD84D'],[.6,1.1,.4,'#B79CF5']].map(p=>{const f=flag(p[3],p[0],p[1],p[2]);g.add(f,cyl(.008,.008,.2,P.dark,p[0],p[1]-.05,p[2],4));return f});g.add(mesh(new T.CylinderGeometry(.14,.14,.4,12,1,false,0,3.1416),'#6B4A2E',0,.22,.37).rotateX(0),box(.9,.04,.04,'#FF8FB7',0,.62,.37));chain(g,t=>{fs.forEach((f,i)=>{f.userData.f.rotation.y=Math.sin(t*3+i)*.5})})},
 balloon:g=>{chain(g,t=>{g.rotation.z=Math.sin(t*.8)*.05})},
 swing:g=>{},slide:g=>{}
};
Object.keys(EN).forEach(k=>{const o=B[k];if(!o)return;B[k]=(x,z)=>{const g=o(x,z);try{EN[k](g,x,z)}catch(e){}return g}});
const CAT=[
 {id:'tree',n:'小樹',c:'自然',p:5,e:'🌳'},{id:'bush',n:'草叢',c:'自然',p:2,e:'🌿'},{id:'flowers',n:'花圃',c:'自然',p:4,e:'🌸'},{id:'sunflower',n:'向日葵',c:'自然',p:4,e:'🌻'},{id:'pine',n:'松樹',c:'自然',p:6,e:'🌲'},{id:'rock',n:'小石頭',c:'自然',p:2,e:'🪨'},{id:'mushroom',n:'蘑菇',c:'自然',p:4,e:'🍄'},{id:'pond',n:'小池塘',c:'自然',p:10,e:'💧'},{id:'sakura',n:'櫻花樹',c:'自然',p:12,e:'🌸'},{id:'bigtree',n:'大橡樹',c:'自然',p:9,e:'🌳'},
 {id:'duck',n:'小鴨',c:'動物',p:6,e:'🦆'},{id:'sheep',n:'小綿羊',c:'動物',p:8,e:'🐑'},{id:'bunny',n:'小兔子',c:'動物',p:8,e:'🐰'},{id:'cat',n:'小貓',c:'動物',p:10,e:'🐱'},{id:'penguin',n:'企鵝',c:'動物',p:14,e:'🐧'},
 {id:'path',n:'石板路',c:'生活',p:1,e:'🟫'},{id:'lamp',n:'路燈',c:'生活',p:4,e:'🏮'},{id:'bench',n:'長椅',c:'生活',p:4,e:'🪑'},{id:'mailbox',n:'郵筒',c:'生活',p:3,e:'📮'},{id:'tent',n:'帳篷',c:'生活',p:8,e:'⛺'},{id:'campfire',n:'營火',c:'生活',p:6,e:'🔥'},{id:'house',n:'小屋',c:'生活',p:15,e:'🏠'},{id:'bakery',n:'麵包店',c:'生活',p:20,e:'🥐'},{id:'swing',n:'鞦韆',c:'生活',p:10,e:'🎠'},{id:'slide',n:'溜滑梯',c:'生活',p:14,e:'🛝'},{id:'fountain',n:'噴水池',c:'生活',p:18,e:'⛲'},{id:'windmill',n:'風車',c:'生活',p:25,e:'🌬️'},
 
 {id:'c_student',n:'小學生',c:'人物',p:0,r:0,e:'🧒',ch:1},{id:'c_chef',n:'小廚師',c:'人物',p:0,r:0,e:'🧑‍🍳',ch:1},{id:'c_gardener',n:'小園丁',c:'人物',p:0,r:1,e:'🧑‍🌾',ch:1},{id:'c_painter',n:'小畫家',c:'人物',p:0,r:1,e:'🎨',ch:1},{id:'c_pirate',n:'小海盜',c:'人物',p:0,r:2,e:'🏴‍☠️',ch:1},{id:'c_astronaut',n:'太空人',c:'人物',p:0,r:2,e:'🧑‍🚀',ch:1},{id:'c_wizard',n:'小魔法師',c:'人物',p:0,r:2,e:'🧙',ch:1},{id:'c_princess',n:'公主',c:'人物',p:0,r:3,e:'👸',ch:1},{id:'c_fairy',n:'花仙子',c:'人物',p:0,r:3,e:'🧚',ch:1},{id:'c_dragon',n:'小龍人',c:'人物',p:0,r:3,e:'🐲',ch:1},
 {id:'lighthouse',n:'燈塔',c:'特別',p:30,e:'🗼'},{id:'rainbow',n:'彩虹拱門',c:'特別',p:35,e:'🌈'},{id:'balloon',n:'熱氣球',c:'特別',p:45,e:'🎈'},{id:'ferris',n:'摩天輪',c:'特別',p:50,e:'🎡',s:2},{id:'carousel',n:'旋轉木馬',c:'特別',p:45,e:'🎠',s:2},{id:'castle',n:'城堡',c:'特別',p:70,e:'🏰',s:2}
];
/* ---------- v1.8 夥伴（蛋孵出來的動物，只能養大，不進商店與盲盒）---------- */
const pw=(c,o)=>mat(c,Object.assign({transparent:true,opacity:.88},o||{}));
const eye2=(x,y,z,r)=>[sph(r||.032,'#2B2B3A',-x,y,z),sph(r||.032,'#2B2B3A',x,y,z),sph((r||.032)*.35,'#FFFFFF',-x+.008,y+.01,z+.022),sph((r||.032)*.35,'#FFFFFF',x+.008,y+.01,z+.022)];
const cheeks=(x,y,z)=>[sph(.035,'#FF9EBB',-x,y,z,1,.7,.5),sph(.035,'#FF9EBB',x,y,z,1,.7,.5)];
const shade=(x,z,r)=>{const m=cyl(r,r,.01,'#000000',x,.01,z,16);m.material=new T.MeshBasicMaterial({color:'#000000',transparent:true,opacity:.12});m.castShadow=false;return m};
B.p_rooster=(x,z)=>{const g=new T.Group(),b=new T.Group(),hd=new T.Group();g.add(b);
 b.add(sph(.22,'#E8924B',0,.3,0,1,.95,1.15),sph(.17,'#F4C27A',0,.27,.12,1,.9,.8),cyl(.02,.02,.14,'#FFB84D',-.07,.07,.02,6),cyl(.02,.02,.14,'#FFB84D',.07,.07,.02,6));
 [[-.5,'#2FA39A'],[0,'#E5484D'],[.5,'#F2B134']].forEach(a=>{const pv=new T.Group();pv.position.set(0,.38,-.22);pv.rotation.x=-.5;pv.rotation.z=a[0];pv.add(sph(.065,a[1],0,.16,0,.6,2.1,.5));b.add(pv)});
 hd.position.set(0,.5,.15);hd.add(sph(.13,'#E8924B',0,.06,.04),sph(.05,'#E5484D',0,.2,.04,.8,1.5,.7),sph(.04,'#E5484D',0,.2,.1,.7,1.1,.6),cone(.04,.09,'#FFB84D',0,.05,.18,4),sph(.03,'#E5484D',0,-.02,.14,.8,1.4,.6));
 hd.children[3].rotation.x=1.57;eye2(.07,.09,.14,.026).forEach(m=>hd.add(m));cheeks(.1,.04,.12).forEach(m=>hd.add(m));b.add(hd);
 g.add(shade(0,0,.3));g.rotation.y=hash(x,z)*6;const p=hash(x,z,3)*6;
 g.userData.anim=t=>{const k=Math.max(0,Math.sin(t*2.4+p));hd.rotation.x=k*.9;b.position.y=Math.abs(Math.sin(t*1.2+p))*.01};return g};
B.p_hen=(x,z)=>{const g=new T.Group(),b=new T.Group(),hd=new T.Group();g.add(b);
 b.add(sph(.22,'#F6E7CC',0,.28,0,1,.95,1.15),sph(.15,'#D9A86C',-.17,.3,0,.5,1,1.1),sph(.15,'#D9A86C',.17,.3,0,.5,1,1.1),sph(.1,'#F6E7CC',0,.4,-.22,.9,.9,.7),cyl(.02,.02,.14,'#FFB84D',-.07,.07,.02,6),cyl(.02,.02,.14,'#FFB84D',.07,.07,.02,6));
 hd.position.set(0,.5,.15);hd.add(sph(.13,'#F6E7CC',0,.06,.04),sph(.04,'#E5484D',0,.18,.04,.9,1.2,.7),cone(.04,.09,'#FFB84D',0,.05,.18,4),sph(.03,'#E5484D',0,-.02,.14,.8,1.4,.6));
 hd.children[2].rotation.x=1.57;eye2(.07,.09,.14,.026).forEach(m=>hd.add(m));cheeks(.1,.04,.12).forEach(m=>hd.add(m));b.add(hd);
 g.add(shade(0,0,.3));g.rotation.y=hash(x,z)*6;const p=hash(x,z,3)*6;
 g.userData.anim=t=>{const k=Math.max(0,Math.sin(t*2.8+p));hd.rotation.x=k*.9;b.position.y=Math.abs(Math.sin(t*1.5+p))*.012};return g};
B.p_eagle=(x,z)=>{const g=new T.Group(),bd=new T.Group(),w1=new T.Group(),w2=new T.Group();
 bd.add(sph(.18,'#9A6B43',0,0,0,1,.9,1.25),sph(.13,'#FFFFFF',0,.12,.17),cone(.04,.1,'#FFC83D',0,.1,.3,5),sph(.1,'#FFFFFF',0,-.02,-.22,.8,.6,1.2),sph(.04,'#E5484D',0,.02,.33,.6,.4,.4));
 bd.children[2].rotation.x=1.57;eye2(.065,.15,.26,.026).forEach(m=>bd.add(m));
 w1.add(sph(.2,'#7C5233',-.2,0,0,1.5,.2,.8));w1.add(sph(.08,'#4A2F1E',-.4,0,0,1.3,.1,.8));w1.position.set(-.1,.05,0);
 w2.add(sph(.2,'#7C5233',.2,0,0,1.5,.2,.8));w2.add(sph(.08,'#4A2F1E',.4,0,0,1.3,.1,.8));w2.position.set(.1,.05,0);bd.add(w1,w2);
 bd.scale.setScalar(1.3);bd.position.set(0,.5,0);g.add(bd);const sh=shade(0,0,.18);g.add(sh);g.rotation.y=hash(x,z)*6;const p=hash(x,z,3)*6;
 g.userData.anim=t=>{const a=t*.9+p,r=.55;bd.position.set(Math.cos(a)*r,.95+Math.sin(t*1.7+p)*.08,Math.sin(a)*r);bd.rotation.y=-a+Math.PI;bd.rotation.z=.12;const f=Math.sin(t*7+p)*.55;w1.rotation.z=f;w2.rotation.z=-f;sh.position.set(bd.position.x,.012,bd.position.z);sh.scale.setScalar(.8+Math.sin(t*1.7+p)*.1)};return g};
B.p_frog=(x,z)=>{const g=new T.Group(),fr=new T.Group();
 g.add(cyl(.34,.34,.03,'#5FB86B',0,.02,0,18),cyl(.3,.3,.035,'#7AD08A',0,.025,0,18),box(.02,.04,.34,'#9CCB7E',.17,.03,.0),sph(.06,'#FFB7D0',-.18,.06,.14,1,.5,1),sph(.035,'#FFD84D',-.18,.09,.14));
 fr.add(sph(.2,'#7DBE63',0,.2,0,1.1,.85,1),sph(.14,'#E9F5C9',0,.15,.1,1,.8,.7),sph(.09,'#7DBE63',-.12,.38,.08),sph(.09,'#7DBE63',.12,.38,.08),sph(.05,'#FFFFFF',-.12,.4,.14),sph(.05,'#FFFFFF',.12,.4,.14),sph(.028,'#2B2B3A',-.12,.4,.18),sph(.028,'#2B2B3A',.12,.4,.18),
  sph(.07,'#7DBE63',-.2,.06,.1,1,.5,1.5),sph(.07,'#7DBE63',.2,.06,.1,1,.5,1.5),sph(.045,'#7DBE63',-.1,.07,.2,1,.6,1),sph(.045,'#7DBE63',.1,.07,.2,1,.6,1),box(.1,.012,.02,'#C55A6A',0,.22,.2));cheeks(.13,.2,.18).forEach(m=>fr.add(m));
 g.add(fr);const p=hash(x,z,3)*6;g.rotation.y=hash(x,z)*6;
 g.userData.anim=t=>{const s=Math.sin(t*2.6+p),k=Math.max(0,s);fr.position.y=k*.3;fr.position.z=Math.sin(t*1.3+p)*.0+k*.02;fr.scale.set(1,.82+.18*Math.min(1,k*2)+(s<0?s*.06:0),1)};return g};
B.p_trex=(x,z)=>{const g=new T.Group(),b=new T.Group(),hd=new T.Group(),tl=new T.Group();g.add(b);
 b.add(sph(.24,'#6FC48B',0,.38,0,.9,1.1,1.1),sph(.17,'#E9F1C9',0,.34,.1,.8,1.1,.7),cyl(.07,.08,.2,'#5BB07A',-.1,.1,0,8),cyl(.07,.08,.2,'#5BB07A',.1,.1,0,8),sph(.07,'#5BB07A',-.1,.02,.06,1,.5,1.4),sph(.07,'#5BB07A',.1,.02,.06,1,.5,1.4),sph(.03,'#5BB07A',-.17,.38,.17,1,1,1.6),sph(.03,'#5BB07A',.17,.38,.17,1,1,1.6));
 for(let i=0;i<4;i++){const sp=cone(.04,.09,'#E6B86A',0,.6-i*.1,-.12-i*.05,4);sp.rotation.x=-.5;b.add(sp)}
 hd.position.set(0,.62,.12);hd.add(sph(.2,'#6FC48B',0,.04,.07,1.1,1,1.1),sph(.12,'#6FC48B',0,-.02,.26,1,.75,1),sph(.1,'#E9F1C9',0,-.07,.2,1,.45,1),sph(.045,'#FFB7D0',0,-.07,.29,1,.4,.6));
 eye2(.1,.1,.24,.04).forEach(m=>hd.add(m));cheeks(.15,.0,.22).forEach(m=>hd.add(m));[-.05,.05].forEach(xx=>hd.add(cone(.012,.03,'#FFFFFF',xx,-.12,.27,4)));b.add(hd);
 tl.position.set(0,.28,-.18);const tc=cone(.1,.42,'#6FC48B',0,0,-.18,8);tc.rotation.x=-1.35;tl.add(tc);b.add(tl);
 g.add(shade(0,0,.32));g.rotation.y=hash(x,z)*6;const p=hash(x,z,3)*6;
 g.userData.anim=t=>{tl.rotation.y=Math.sin(t*2.2+p)*.5;hd.rotation.x=Math.sin(t*1.8+p)*.12;hd.rotation.y=Math.sin(t*.9+p)*.3;const k=Math.max(0,Math.sin(t*3+p));b.position.y=k*.04};return g};
B.p_salmon=(x,z)=>{const g=new T.Group(),fish=new T.Group(),tail=new T.Group();
 g.add(cyl(.38,.38,.03,'#8FD3F4',0,.02,0,20));g.children[0].material=pw('#8FD3F4');
 const r1=new T.Mesh(new T.TorusGeometry(.2,.012,5,24),new T.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:.7}));r1.rotation.x=1.57;r1.position.y=.045;g.add(r1);
 fish.add(sph(.2,'#F28F82',0,0,0,1.7,.78,.72),sph(.15,'#FFC7B8',.04,-.05,.02,1.5,.5,.62),sph(.055,'#FFFFFF',.2,.04,.09),sph(.03,'#2B2B3A',.22,.04,.12),sph(.016,'#FFFFFF',.225,.055,.135),sph(.05,'#E6806F',.33,-.02,0,.9,.55,.75),box(.1,.012,.02,'#C55A6A',.3,-.03,.1),sph(.032,'#FF9EBB',.12,-.01,.13,1,.7,.5));
 const df=cone(.07,.14,'#E6806F',0,.15,0,4);df.rotation.z=-.3;fish.add(df);
 [[-.04,.06],[.08,.07],[-.14,.04],[.0,-.02]].forEach(a=>fish.add(sph(.02,'#C94F5C',a[0],a[1],.14)));
 tail.position.set(-.33,0,0);[.45,-.45].forEach(a=>{const tf=sph(.1,'#E6806F',-.08,a*.18,0,1.5,.5,.18);tf.rotation.z=a*.6;tail.add(tf)});fish.add(tail);
 fish.position.y=.12;g.add(fish);g.rotation.y=hash(x,z)*6;const p=hash(x,z,3)*6;
 g.userData.anim=t=>{const k=Math.max(0,Math.sin(t*2.2+p));fish.position.y=.1+k*k*.3;fish.rotation.z=Math.sin(t*14)*.18+k*.5;tail.rotation.y=Math.sin(t*18)*.7;const q=(t*.8+p)%1,sc=1+q*.7;r1.scale.set(sc,sc,1);r1.material.opacity=.7*(1-q)};return g};
/* 舊夥伴（改版前長到的樣子，收進背包）*/
const oldBird=(col,belly,beak,fn)=>(x,z)=>{const g=G(sph(.17,col,0,.2,0,1,1,1.05),sph(.13,col,0,.38,.1),sph(.1,belly,0,.17,.1,1,1.1,.8),cone(.04,.09,beak,0,.37,.23,4),cyl(.02,.02,.1,'#FFB84D',-.06,.05,0,6),cyl(.02,.02,.1,'#FFB84D',.06,.05,0,6));g.children[3].rotation.x=1.57;eye2(.06,.42,.19,.026).forEach(m=>g.add(m));if(fn)fn(g);g.add(shade(0,0,.22));g.rotation.y=hash(x,z)*6;const p=hash(x,z,3)*6;g.userData.anim=t=>{const k=Math.max(0,Math.sin(t*3+p));g.position.y=k*k*.08};return g};
B.old_chick=oldBird('#FFD84D','#FFE680','#FFA94D');
B.old_bird=oldBird('#6FC3F2','#E7F6FF','#FFC83D',g=>{g.add(sph(.05,'#6FC3F2',0,.52,.1,.6,1.2,.6))});
B.old_owl=oldBird('#A9774E','#F0D9B5','#FFC83D',g=>{g.add(cone(.04,.09,'#8A5A3A',-.07,.52,.08,4),cone(.04,.09,'#8A5A3A',.07,.52,.08,4),sph(.05,'#FFFFFF',-.06,.4,.2),sph(.05,'#FFFFFF',.06,.4,.2))});
B.old_parrot=oldBird('#E5484D','#FFD84D','#2B2B3A',g=>{g.add(sph(.06,'#4FA8E8',-.17,.2,0,.5,1.4,1),sph(.06,'#4FA8E8',.17,.2,0,.5,1.4,1),sph(.06,'#FFD84D',0,.15,-.2,.6,.5,1.8))});
B.old_dragon=(x,z)=>{const g=G(sph(.2,'#B79CF5',0,.26,0,1,1,1.1),sph(.15,'#B79CF5',0,.5,.12),sph(.08,'#E8DFFF',0,.46,.24,1,.7,1),sph(.12,'#FFE680',0,.22,.12,.9,1.1,.6),cone(.04,.1,'#FFE680',-.08,.64,.1,4),cone(.04,.1,'#FFE680',.08,.64,.1,4),cyl(.03,.03,.14,'#9A7BE0',-.08,.07,.02,6),cyl(.03,.03,.14,'#9A7BE0',.08,.07,.02,6));
 const w1=sph(.12,'#8E6FE0',-.22,.38,-.05,1.4,1.1,.2),w2=sph(.12,'#8E6FE0',.22,.38,-.05,1.4,1.1,.2);const tl=cone(.06,.3,'#B79CF5',0,.12,-.22,6);tl.rotation.x=-1.2;g.add(w1,w2,tl);eye2(.065,.54,.2,.028).forEach(m=>g.add(m));cheeks(.1,.48,.22).forEach(m=>g.add(m));g.add(shade(0,0,.26));g.rotation.y=hash(x,z)*6;const p=hash(x,z,3)*6;
 g.userData.anim=t=>{const f=Math.sin(t*6+p)*.35;w1.rotation.z=.2+f;w2.rotation.z=-.2-f;tl.rotation.z=Math.sin(t*3+p)*.4;g.position.y=Math.abs(Math.sin(t*3+p))*.03};return g};
CAT.push({id:'p_rooster',n:'公雞',c:'夥伴',p:0,r:3,e:'🐓',np:1},{id:'p_hen',n:'母雞',c:'夥伴',p:0,r:3,e:'🐔',np:1},{id:'p_eagle',n:'老鷹',c:'夥伴',p:0,r:3,e:'🦅',np:1},{id:'p_frog',n:'青蛙',c:'夥伴',p:0,r:3,e:'🐸',np:1},{id:'p_trex',n:'暴龍',c:'夥伴',p:0,r:3,e:'🦖',np:1},{id:'p_salmon',n:'鮭魚',c:'夥伴',p:0,r:3,e:'🐟',np:1},
 {id:'old_chick',n:'舊夥伴：小雞',c:'夥伴',p:0,r:1,e:'🐥',np:1},{id:'old_bird',n:'舊夥伴：小鳥',c:'夥伴',p:0,r:1,e:'🐦',np:1},{id:'old_owl',n:'舊夥伴：貓頭鷹',c:'夥伴',p:0,r:2,e:'🦉',np:1},{id:'old_parrot',n:'舊夥伴：鸚鵡',c:'夥伴',p:0,r:2,e:'🦜',np:1},{id:'old_dragon',n:'舊夥伴：神龍',c:'夥伴',p:0,r:3,e:'🐲',np:1});
/* ---------- v1.9 設施（商店與公共建築）---------- */
const stripes=(g,w,y,z,c1,c2,n,d)=>{for(let i=0;i<n;i++){const b=box(w/n,.03,d,i%2?c2:c1,-w/2+w/n*(i+.5),y,z);b.rotation.x=.45;g.add(b)}};
const wins=(g,m,list)=>list.forEach(a=>g.add(box(a[2]||.14,a[3]||.14,.04,m,a[0],a[1],a[4]===undefined?.3:a[4])));
const lamp=(g,x,y,z,c)=>g.add(sph(.03,glowMat(c||'#FFE9A0',1.6),x,y,z));
B.fac_cafe=()=>{const w=glowMat('#FFE9A0',1.2);const g=G(rbox(.76,.46,.58,'#F4E3CF',0,.23,0,.06),box(.82,.05,.64,'#8A5A3A',0,.48,0),box(.16,.28,.04,'#8A5A3A',-.24,.14,.3),box(.22,.2,.04,w,.14,.27,.3));stripes(g,.76,.44,.4,'#8A5A3A','#FFFFFF',6,.2);
 const sg=G(rbox(.3,.16,.04,'#FFF6E5',0,0,0,.03),cyl(.045,.04,.07,'#FFFFFF',0,-.01,.03,10),box(.015,.03,.02,'#FFFFFF',.055,-.01,.03));sg.position.set(0,.62,.1);g.add(sg);
 const st=[];for(let i=0;i<3;i++){const s=sph(.025,'#FFFFFF',.0,.7,.1);g.add(s);st.push(s)}g.add(cyl(.05,.07,.1,'#B38B6D',.3,.55,-.15,6),cyl(.04,.04,.06,'#6B4A2E',.3,.6,-.15,6));
 g.userData.anim=t=>{st.forEach((s,i)=>{const k=((t*.5+i*.33)%1);s.position.set(Math.sin(t*2+i)*.02,.68+k*.18,.1);s.scale.setScalar(1-k*.6)})};return g};
B.fac_flower=()=>{const w=glowMat('#FFE9A0',1.2);const g=G(rbox(.72,.44,.56,'#FFE3EC',0,.22,0,.06),box(.78,.05,.62,'#7CCB6A',0,.46,0),box(.14,.28,.04,'#9C6B43',.22,.14,.3),box(.22,.2,.04,w,-.14,.27,.3));stripes(g,.72,.42,.4,'#FF9EBB','#FFFFFF',6,.2);
 [[-.32,'#FF6B8A'],[-.2,'#FFD84D'],[-.08,'#B79CF5']].forEach((a,i)=>{g.add(cyl(.045,.04,.07,'#C9753D',a[0]-.0,.04,.38,8),cyl(.01,.01,.1,P.leafD,a[0],.12,.38,4),sph(.05,a[1],a[0],.19,.38))});
 const sg=G(rbox(.3,.14,.04,'#FFFFFF',0,0,0,.03),sph(.04,'#FF6B8A',-.06,0,.03),sph(.04,'#FFD84D',0,0,.03),sph(.04,'#B79CF5',.06,0,.03));sg.position.set(0,.62,.1);g.add(sg);g.add(ico(.14,P.leaf2,-.28,.52,-.1,0),sph(.06,'#FF9EBB',-.28,.62,-.04));return g};
B.fac_book=()=>{const w=glowMat('#FFE9A0',1.2);const g=G(rbox(.74,.5,.58,'#D9E6F5',0,.25,0,.06),box(.8,.05,.64,'#5B7FB5',0,.52,0),box(.14,.3,.04,'#5B7FB5',-.24,.15,.3),box(.24,.22,.04,w,.14,.27,.3));stripes(g,.74,.47,.4,'#5B7FB5','#FFFFFF',6,.2);
 [['#E5484D',.04],['#FFC83D',.05],['#6BCB77',.04],['#B79CF5',.05]].forEach((a,i)=>g.add(box(a[1],.12,.07,a[0],-.33+i*.055,.64,.1)));
 const bk=G(box(.1,.14,.03,'#E5484D',-.045,0,0),box(.1,.14,.03,'#FFFFFF',.045,0,0));bk.position.set(.2,.66,.1);bk.rotation.z=.2;g.add(bk);return g};
B.fac_icecream=()=>{const g=G(rbox(.5,.3,.38,'#FFE7F0',0,.15,0,.05),box(.54,.04,.42,'#FF9EBB',0,.32,0),box(.34,.12,.04,glowMat('#FFE9A0',1),0,.2,.2),cyl(.015,.015,.5,'#FFFFFF',0,.5,0,6));
 const u=mesh(new T.ConeGeometry(.42,.2,12),'#FF9EBB',0,.78,0);g.add(u);for(let i=0;i<6;i++){const a=cone(.1,.2,i%2?'#FFFFFF':'#FF9EBB',Math.cos(i*1.0472)*.2,.74,Math.sin(i*1.0472)*.2,3);a.rotation.set(0,0,0);}
 const cn=cone(.06,.2,'#E3A857',0,.9,0,8);cn.rotation.x=Math.PI;const sc1=sph(.09,'#FFE0EC',0,1.0,0),sc2=sph(.075,'#BFE9FF',0,1.09,0),sc3=sph(.025,'#FF4D6D',0,1.17,0);
 g.add(cn,sc1,sc2,sc3,cyl(.02,.02,.14,'#FFFFFF',-.18,.1,.2,6));const sg=G(sph(.07,'#FFE0EC',0,0,0),cone(.04,.1,'#E3A857',0,-.1,0,6));sg.children[1].rotation.x=Math.PI;sg.position.set(0,.4,.22);g.add(sg);
 g.userData.anim=t=>{sc3.position.y=1.17+Math.sin(t*3)*.01};return g};
B.fac_restaurant=()=>{const w=glowMat('#FFE9A0',1.2);const g=G(rbox(.78,.5,.6,'#FFE0C2',0,.25,0,.06),mesh(new T.ConeGeometry(.62,.3,4),'#C84646',0,.65,0),box(.14,.3,.04,'#8A5A3A',-.24,.15,.31),box(.24,.2,.04,w,.14,.28,.31),cyl(.05,.06,.2,'#B38B6D',.22,.8,-.12,6));lamp(g,-.38,.34,.32,'#FF9E4D');g.children[1].rotation.y=.785;g.children[1].scale.set(1,1,.85);
 const sg=G(rbox(.28,.13,.04,'#FFF6E5',0,0,0,.03),cyl(.025,.025,.1,'#C84646',-.05,0,.03,6),cyl(.03,.03,.01,'#C84646',.06,0,.03,10));sg.position.set(0,.46,.33);g.add(sg);g.userData.smoke=[.22,.92,-.12];return g};
B.fac_market=()=>{const g=G(box(.74,.04,.5,'#C9A27A',0,.16,0),cyl(.025,.025,.5,'#8A5A3A',-.34,.25,-.2,6),cyl(.025,.025,.5,'#8A5A3A',.34,.25,-.2,6),cyl(.025,.025,.38,'#8A5A3A',-.34,.19,.2,6),cyl(.025,.025,.38,'#8A5A3A',.34,.19,.2,6));
 for(let i=0;i<6;i++){const b=box(.74/6,.03,.62,i%2?'#FFFFFF':'#6BCB77',-.31+i*.124,.5,0);b.rotation.x=.18;g.add(b)}
 const fr=[['#E5484D',-.24],['#FFA94D',-.08],['#FFD84D',.08],['#9BDD6B',.24]];fr.forEach(a=>{g.add(box(.14,.08,.16,'#B98A5A',a[1],.22,.0));for(let k=0;k<3;k++)g.add(sph(.04,a[0],a[1]-.04+k*.04,.3,-.02+(k%2)*.05))});g.add(box(.74,.1,.04,'#FFFFFF',0,.1,.24));return g};
B.fac_conv=()=>{const w=glowMat('#E8F6FF',1.3);const g=G(rbox(.78,.46,.58,'#FFFFFF',0,.23,0,.06),box(.82,.07,.62,'#3AA0E0',0,.5,0),box(.82,.04,.62,'#3FBF6B',0,.45,0),box(.34,.24,.04,w,-.12,.24,.3),box(.12,.3,.04,'#B8D9F0',.26,.15,.3));
 const sg=G(rbox(.3,.1,.04,glowMat('#FFE680',1.2),0,0,0,.03));sg.position.set(0,.62,.12);g.add(sg,cyl(.025,.025,.1,'#8A8AA0',-.18,.56,.1,6),cyl(.025,.025,.1,'#8A8AA0',.18,.56,.1,6));return g};
B.fac_post=()=>{const w=glowMat('#FFE9A0',1.2);const g=G(rbox(.74,.46,.58,'#FFF0E0',0,.23,0,.06),box(.8,.05,.64,'#E5484D',0,.48,0),box(.14,.3,.04,'#3B6FB5',.22,.15,.3),box(.2,.2,.04,w,-.14,.27,.3),box(.08,.14,.08,'#E5484D',-.3,.07,.38),cyl(.05,.05,.12,'#E5484D',-.3,.2,.38,8));
 const f=flag('#E5484D',.3,.56,-.18);g.add(f,cyl(.01,.01,.3,'#9A9AA8',.3,.6,-.18,4));f.userData.f.position.set(.1,.2,0);g.userData.anim=t=>{f.userData.f.rotation.y=Math.sin(t*3)*.35};
 const sg=G(rbox(.2,.1,.04,'#FFFFFF',0,0,0,.03),box(.1,.06,.02,'#E5484D',0,0,.03));sg.position.set(0,.6,.1);g.add(sg);return g};
/* --- 2x2 公共建築 --- */
B.fac_school=()=>{const w=glowMat('#FFE9A0',1.2);const clk=cyl(.1,.1,.03,'#FFFFFF',0,.62,.36,16);clk.rotation.x=1.5708;const roof=mesh(new T.ConeGeometry(.42,.26,4),'#E5484D',0,.91,.1);roof.rotation.y=.785;
 const g=G(rbox(1.5,.5,.72,'#FFE9C9',0,.25,0,.06),box(1.56,.06,.78,'#E5484D',0,.53,0),rbox(.5,.78,.5,'#FFE9C9',0,.39,.1,.05),roof,box(.2,.28,.04,'#8A5A3A',0,.14,.36),clk,box(.02,.07,.01,'#3A3A4A',0,.64,.38),box(.05,.02,.01,'#3A3A4A',.02,.62,.38));
 [-.6,-.4,.4,.6].forEach(x=>g.add(box(.14,.16,.04,w,x,.3,.37)));
 const f=flag('#4FA8E8',-.72,1.0,.2);g.add(f,cyl(.012,.012,.7,'#9A9AA8',-.72,.7,.2,4));g.userData.anim=t=>{f.userData.f.rotation.y=Math.sin(t*3)*.35};
 g.add(box(.5,.02,.3,'#E4E0D6',0,.01,.52),sph(.05,'#FFD84D',.7,.1,.5),sph(.05,'#FF8FB7',.82,.1,.55));return g};
B.fac_library=()=>{const g=G(rbox(1.4,.46,.8,'#EFE6D6',0,.23,-.02,.05),box(1.5,.05,.9,'#B5A78F',0,.48,0));
 [-.55,-.28,0,.28,.55].forEach(x=>g.add(cyl(.05,.055,.4,'#FFFFFF',x,.22,.38,10)));
 const pd=mesh(new T.ConeGeometry(.88,.22,3),'#C9B79C',0,.62,.33);pd.rotation.y=Math.PI/2*0;pd.scale.set(1,1,.22);pd.rotation.set(0,0,0);g.add(pd);
 [[-.5,.3],[.5,.3],[-.5,.26]].slice(0,2).forEach(a=>g.add(box(.2,.2,.04,glowMat('#FFE9A0',1.2),a[0],.28,.41)));
 g.add(box(.9,.03,.3,'#D9CFBC',0,.015,.62),box(.8,.03,.22,'#E4DCCB',0,.04,.56));const bk=G(box(.16,.2,.03,'#5B7FB5',-.05,0,0),box(.16,.2,.03,'#FFFFFF',.05,0,0));bk.position.set(0,.6,.45);g.add(bk);return g};
B.fac_hospital=()=>{const w=glowMat('#D6EEFF',1.2);const g=G(rbox(1.5,.62,.78,'#FFFFFF',0,.31,0,.06),box(1.56,.05,.84,'#8CC8F0',0,.64,0),rbox(.46,.2,.1,'#FFFFFF',0,.76,.26,.03),box(.28,.07,.03,'#E5484D',0,.76,.32),box(.07,.28,.03,'#E5484D',0,.76,.32),box(.22,.3,.04,'#B8D9F0',0,.15,.4));
 [-.58,-.36,.36,.58].forEach(x=>[.22,.46].forEach(y=>g.add(box(.14,.12,.04,w,x,y,.4))));
 const amb=G(box(.34,.14,.16,'#FFFFFF',0,.12,0),box(.14,.11,.15,'#FFFFFF',.2,.1,0),box(.1,.03,.17,'#E5484D',0,.14,0),cyl(.04,.04,.04,'#3A3A4A',-.1,.04,.09,8),cyl(.04,.04,.04,'#3A3A4A',.1,.04,.09,8),cyl(.04,.04,.04,'#3A3A4A',-.1,.04,-.09,8),cyl(.04,.04,.04,'#3A3A4A',.1,.04,-.09,8));
 amb.children.slice(3).forEach(m=>m.rotation.x=1.5708);const lt=sph(.03,glowMat('#FF4D4D',2),0,.21,0);amb.add(lt);amb.position.set(.45,0,.62);g.add(amb);g.userData.anim=t=>{lt.visible=Math.sin(t*8)>0};return g};
B.fac_fire=()=>{const w=glowMat('#FFE9A0',1.2);const g=G(rbox(1.5,.56,.78,'#F4D3C9',0,.28,-.02,.06),box(1.56,.06,.84,'#E5484D',0,.59,-.02),rbox(.36,.9,.36,'#F4D3C9',.52,.45,-.12,.04),box(.42,.05,.42,'#E5484D',.52,.92,-.12),cyl(.07,.07,.04,'#FFD84D',.52,1.0,-.12,10));
 [-.3,.14].forEach(x=>g.add(box(.36,.38,.04,'#B8B8C8',x,.2,.38),box(.3,.02,.05,'#9A9AA8',x,.14,.4),box(.3,.02,.05,'#9A9AA8',x,.24,.4),box(.3,.02,.05,'#9A9AA8',x,.34,.4)));
 const bell=sph(.05,glowMat('#FFC83D',1.6),.52,.82,.08);g.add(bell);
 const tk=G(box(.5,.14,.2,'#E5484D',0,.14,0),box(.16,.15,.19,'#E5484D',.26,.15,0),box(.34,.03,.06,'#CFCFD8',-.04,.25,0),box(.34,.03,.02,'#CFCFD8',-.04,.28,.05),cyl(.04,.04,.04,'#3A3A4A',-.14,.04,.1,8),cyl(.04,.04,.04,'#3A3A4A',.14,.04,.1,8),cyl(.04,.04,.04,'#3A3A4A',-.14,.04,-.1,8),cyl(.04,.04,.04,'#3A3A4A',.14,.04,-.1,8));tk.children.slice(4).forEach(m=>m.rotation.x=1.5708);const lt=sph(.025,glowMat('#FF4D4D',2),.26,.25,0);tk.add(lt);tk.position.set(-.35,0,.66);g.add(tk);
 g.userData.anim=t=>{lt.visible=Math.sin(t*9)>0;bell.rotation.z=Math.sin(t*6)*.3};return g};
/* --- 走來走去（v1.9）：人物與動物會在自己的格子附近散步、停下來、再出發 --- */
function roam(g,o){o=o||{};const u=g.userData,SP=o.sp||.4,k=o.gait||'walk',bb=new T.Box3().setFromObject(g),top=Math.max(.5,bb.max.y);
 const st={tx:0,tz:0,has:0,wait:Math.random()*1.5,last:null,ph:Math.random()*6,diz:0,bk:null};u.roamer=1;
 const dz=new T.Group();for(let i=0;i<3;i++){const m=sph(.045,'#FFD84D',0,0,0);dz.add(m)}dz.position.y=top+.1;dz.visible=false;g.add(dz);
 const onIsl=(x,z)=>tileMeshes.some(m=>Math.hypot(m.position.x-x,m.position.z-z)<.58);
 const hit=(x,z)=>{for(let i=0;i<items.length;i++){const it=items[i],og=it.g;if(og===g)continue;const d=BYID[it.t];if(d&&(it.t==='path'||it.t==='flowers'||it.t==='pond'))continue;
   const r=og.userData.roamer?.3:(d&&d.s===2?.8:.34);if(Math.hypot(og.position.x-x,og.position.z-z)<r+.12)return true}return false};
 const pick=()=>{for(let n=0;n<8;n++){const m=tileMeshes[Math.floor(Math.random()*tileMeshes.length)];if(!m)return false;const x=m.position.x+(Math.random()-.5)*.3,z=m.position.z+(Math.random()-.5)*.3;if(!hit(x,z)){st.tx=x;st.tz=z;return true}}return false};
 u.anim=t=>{const dt=st.last===null?0:Math.min(.1,t-st.last);st.last=t;let mv=0;
  if(st.diz>0){st.diz-=dt;const a=t*13;g.rotation.y+=dt*14;g.rotation.z=Math.sin(a)*.18;g.position.y=Math.abs(Math.sin(t*6))*.02;dz.visible=true;dz.rotation.y=-t*6;dz.children.forEach((m,i)=>{const an=i*2.094;m.position.set(Math.cos(an)*.2,Math.sin(t*5+i)*.03,Math.sin(an)*.2)});
   if(st.bk){g.position.x+=st.bk[0]*dt;g.position.z+=st.bk[1]*dt;st.bk[0]*=.9;st.bk[1]*=.9}
   const pa=u.parts;if(pa){pa.legL.rotation.x=pa.legR.rotation.x=0;pa.armL.rotation.z=.9+Math.sin(a)*.3;pa.armR.rotation.z=-.9-Math.sin(a)*.3}
   if(st.diz<=0){dz.visible=false;g.rotation.z=0;if(pa){pa.armL.rotation.z=.25;pa.armR.rotation.z=-.25}st.has=0;st.wait=.4+Math.random()}
   if(o.extra)o.extra(t,0);return}
  if(!st.has){st.wait-=dt;if(st.wait<=0&&pick())st.has=1;else if(st.wait<=0)st.wait=.8}
  else{const dx=st.tx-g.position.x,dz2=st.tz-g.position.z,L=Math.hypot(dx,dz2);
   if(L<.05){st.has=0;st.wait=.5+Math.random()*2.5}
   else{const s=Math.min(L,SP*dt),nx=g.position.x+dx/L*s,nz=g.position.z+dz2/L*s;
    if(!onIsl(nx,nz)||hit(nx,nz)){st.diz=1.3;st.bk=[-dx/L*.5,-dz2/L*.5];if(window.__islBump)try{window.__islBump()}catch(e){}}
    else{mv=1;g.position.x=nx;g.position.z=nz;const ty=Math.atan2(dx,dz2);let d=ty-g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));g.rotation.y+=d*Math.min(1,dt*9)}}}
  const w=t*(k==='hop'?9:k==='waddle'?10:12)+st.ph;
  if(k==='hop')g.position.y=mv?Math.pow(Math.max(0,Math.sin(w)),2)*.11:0;
  else if(k==='waddle'){g.rotation.z=mv?Math.sin(w)*.13:Math.sin(t*2+st.ph)*.03;g.position.y=mv?Math.abs(Math.sin(w))*.02:0}
  else if(k==='trot')g.position.y=mv?Math.abs(Math.sin(w))*.03:Math.sin(t*2+st.ph)*.006;
  const pa=u.parts;if(pa){const sw=mv?Math.sin(w):0;pa.legL.rotation.x=sw*.55;pa.legR.rotation.x=-sw*.55;pa.armL.rotation.x=-sw*.45;pa.armR.rotation.x=sw*.45;g.position.y=mv?Math.abs(sw)*.015:0}
  if(o.extra)o.extra(t,mv)}}
['p_rooster','p_hen','p_trex'].forEach(id=>{const b0=B[id];B[id]=(x,z)=>{const g=b0(x,z);const a=g.userData.anim;roam(g,{r:.55,sp:.2,gait:'trot',extra:a});return g}});
CAT.push(
 {id:'fac_cafe',n:'咖啡廳',c:'商店',p:14,e:'☕',nb:1},{id:'fac_flower',n:'花店',c:'商店',p:12,e:'💐',nb:1},{id:'fac_book',n:'書店',c:'商店',p:14,e:'📚',nb:1},{id:'fac_icecream',n:'冰淇淋攤',c:'商店',p:10,e:'🍦',nb:1},{id:'fac_restaurant',n:'餐廳',c:'商店',p:18,e:'🍜',nb:1},{id:'fac_market',n:'市集攤位',c:'商店',p:12,e:'🍎',nb:1},{id:'fac_conv',n:'便利商店',c:'商店',p:16,e:'🏪',nb:1},{id:'fac_post',n:'郵局',c:'公共',p:16,e:'📮',nb:1},
 {id:'fac_school',n:'學校',c:'公共',p:50,e:'🏫',s:2,nb:1},{id:'fac_library',n:'圖書館',c:'公共',p:48,e:'📖',s:2,nb:1},{id:'fac_hospital',n:'醫院',c:'公共',p:55,e:'🏥',s:2,nb:1},{id:'fac_fire',n:'消防局',c:'公共',p:52,e:'🚒',s:2,nb:1});

/* ---------- v1.10 交通建築與神祕島特殊物品 ---------- */
B.fac_airport=()=>{const w=glowMat('#BFE6FF',1.1);const g=G(box(1.7,.03,.5,'#6B6F80',0,.015,.42),box(1.6,.035,.04,'#FFFFFF',0,.02,.42));
 for(let i=-3;i<=3;i++)g.add(box(.14,.036,.05,'#FFE680',i*.22,.022,.42));
 g.add(rbox(.8,.34,.42,'#FFFFFF',-.4,.17,-.35,.05),box(.86,.05,.48,'#6FC3F2',-.4,.36,-.35),box(.5,.12,.04,w,-.4,.2,-.13));
 g.add(cyl(.07,.09,.62,'#FFFFFF',.5,.31,-.4,10),cyl(.16,.12,.14,w,.5,.68,-.4,10),cyl(.2,.2,.03,'#E5484D',.5,.77,-.4,10));
 const pl=G(cyl(.07,.07,.5,'#FFFFFF',0,0,0,10),cone(.07,.14,'#E5484D',0,.32,0,10),box(.66,.03,.15,'#6FC3F2',0,0,0),box(.2,.02,.1,'#6FC3F2',0,-.02,-.22),box(.03,.14,.1,'#E5484D',0,.07,-.22));
 pl.children[0].rotation.x=Math.PI/2;pl.children[1].rotation.x=-Math.PI/2;pl.children[1].position.set(0,0,.32);pl.children[3].position.set(0,0,-.22);pl.children[4].position.set(0,.07,-.22);
 const pr=box(.02,.2,.03,'#6B6F80',0,0,.37);pl.add(pr);pl.position.set(-.3,.12,.42);g.add(pl);
 g.userData.anim=t=>{pr.rotation.z=t*28;pl.position.y=.12+Math.sin(t*2)*.01};return g};
B.fac_pier=()=>{const g=G(box(.9,.04,.9,'#B98255',0,.02,0));for(let i=0;i<5;i++)g.add(box(.9,.045,.03,'#8A5A3A',0,.04,-.4+i*.2));
 const ship=G(box(.7,.16,.34,'#FFFFFF',0,.08,0),box(.74,.05,.38,'#E5484D',0,.18,0),box(.5,.14,.28,'#FFFFFF',-.02,.3,0),box(.3,.1,.22,'#FFFFFF',-.02,.42,0),cyl(.05,.05,.14,'#E5484D',-.02,.54,0,8),cone(.17,.2,'#FFFFFF',.42,.08,0,4));
 ship.children[5].rotation.z=-Math.PI/2;for(let i=0;i<4;i++)ship.add(box(.07,.05,.01,'#6FC3F2',-.18+i*.12,.3,.15),box(.07,.05,.01,'#6FC3F2',-.18+i*.12,.3,-.15));
 ship.position.set(0,.08,0);ship.scale.setScalar(1.05);g.add(ship,cyl(.04,.05,.2,'#8A5A3A',.4,.1,.4,6),cyl(.04,.05,.2,'#8A5A3A',-.4,.1,.4,6));
 g.userData.anim=t=>{ship.position.y=.08+Math.sin(t*1.6)*.025;ship.rotation.z=Math.sin(t*1.3)*.04};return g};
B.fac_rocket=()=>{const fl=glowMat('#FFA94D',1.6);const g=G(cyl(.3,.34,.06,'#8E94A6',0,.03,0,12),cyl(.15,.17,.6,'#FFFFFF',0,.4,0,14),cone(.15,.28,'#E5484D',0,.84,0,14),sph(.07,'#6FC3F2',0,.5,.14),box(.04,.2,.2,'#E5484D',.15,.2,0),box(.04,.2,.2,'#E5484D',-.15,.2,0),box(.2,.2,.04,'#E5484D',0,.2,.15));
 const f=cone(.09,.22,fl,0,.02,0,8);f.rotation.x=Math.PI;f.position.y=.04;g.add(f,cyl(.02,.02,.7,'#9A9AA8',.28,.35,0,5));
 g.userData.anim=t=>{f.scale.set(1,.8+Math.sin(t*20)*.25,1);g.rotation.y=Math.sin(t*.5)*.1};return g};
B.sp_crystal=()=>{const m=mat('#B79CF5',{transparent:true,opacity:.85,emissive:'#7A5AC8',emissiveIntensity:.35,roughness:.2});const g=G(cone(.12,.5,m,0,.3,0,5),cone(.09,.34,m,.15,.2,.05,5),cone(.08,.28,m,-.14,.16,.02,5),cyl(.22,.26,.05,'#8E94A6',0,.02,0,8));g.userData.anim=t=>{m.emissiveIntensity=.35+Math.sin(t*2)*.2};return g};
B.sp_meteor=()=>{const gl=glowMat('#FF9A3C',1.3);const g=G(ico(.26,'#6B6F80',0,.24,0,1),ico(.09,gl,.14,.3,.14,0),ico(.07,gl,-.12,.36,.1,0),ico(.06,gl,.02,.18,-.2,0));g.userData.anim=t=>{g.rotation.y=t*.4};return g};
B.sp_glowtree=()=>{const gl=glowMat('#7FE0FF',1.5);const g=G(cyl(.06,.1,.5,'#6A5A8A',0,.25,0,7),ico(.3,'#4A7ACF',0,.7,0),ico(.1,gl,.2,.78,.1,0),ico(.08,gl,-.18,.62,.14,0),ico(.09,gl,.02,.95,-.12,0));g.userData.sway=1;return g};
B.sp_ufo=()=>{const gl=glowMat('#FFE680',1.4);const g=new T.Group();const u=G(cyl(.34,.34,.07,'#B8BED0',0,.0,0,16),cyl(.2,.34,.1,'#9AA3B5',0,-.06,0,16),sph(.17,'#BFE6FF',0,.1,0,1,.9,1),sph(.035,gl,.28,-.02,0),sph(.035,gl,-.28,-.02,0),sph(.035,gl,0,-.02,.28));u.position.y=.62;g.add(u,cyl(.02,.03,.62,'#9A9AA8',0,.3,0,5));g.userData.anim=t=>{u.position.y=.62+Math.sin(t*2)*.05;u.rotation.y=t*1.2};return g};
B.sp_moon=()=>{const g=G(cyl(.16,.2,.08,'#8E94A6',0,.04,0,10));const mo=G(sph(.26,'#FFF3C4',0,0,0),sph(.06,'#EAD99A',.1,.1,.2),sph(.045,'#EAD99A',-.12,-.05,.22),sph(.035,'#EAD99A',.02,-.14,.24));mo.position.y=.5;g.add(mo);g.userData.anim=t=>{mo.position.y=.5+Math.sin(t*1.5)*.05;mo.rotation.y=t*.5};return g};
B.sp_alien=()=>{const g=person({top:'#8EE6A8',bottom:'#5FBF7F',hair:'#8EE6A8',skin:'#A9F0B8'});[-.07,.07].forEach(x=>{g.add(cyl(.012,.012,.14,'#5FBF7F',x,.82,0,4),sph(.03,'#FFE680',x,.9,0))});addWander(g,.22,.3);return g};
CAT.push({id:'fac_airport',n:'機場',c:'交通',p:0,e:'✈️',s:2,np:1},{id:'fac_pier',n:'郵輪碼頭',c:'交通',p:0,e:'🚢',np:1},{id:'fac_rocket',n:'火箭發射台',c:'交通',p:0,e:'🚀',np:1},
 {id:'sp_crystal',n:'紫水晶',c:'神祕',p:0,r:2,e:'💎',np:1},{id:'sp_meteor',n:'隕石',c:'神祕',p:0,r:2,e:'☄️',np:1},{id:'sp_glowtree',n:'發光樹',c:'神祕',p:0,r:2,e:'🌳',np:1},
 {id:'sp_moon',n:'小月亮',c:'神祕',p:0,r:3,e:'🌙',np:1},{id:'sp_ufo',n:'飛碟',c:'神祕',p:0,r:3,e:'🛸',np:1},{id:'sp_alien',n:'外星朋友',c:'神祕',p:0,r:3,e:'👽',np:1,ch:1});

/* ---------- v1.11 捏臉角色「我」（造型讀 window.__MII）---------- */
/* 捏臉的臉（眼、眉、嘴、腮紅、臉飾）：index.html 把 SVG 字串放在 window.__MII_FACE，這裡轉成貼圖，貼在小人頭前面（圓柱弧面，跟著身體轉） */
const FACE_TEX={};
function faceSticker(){const svg=window.__MII_FACE;
 const fb=()=>{const m=new T.Group();[-.06,.06].forEach(x=>m.add(sph(.025,'#2B2B3A',x,.62,.17)));return m};
 if(!svg||typeof Image==='undefined')return fb();
 let tex=FACE_TEX[svg];
 if(!tex){const cv=document.createElement('canvas');cv.width=280;cv.height=264;tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;FACE_TEX[svg]=tex;
  const im=new Image();im.onload=()=>{cv.getContext('2d').drawImage(im,0,0,280,264);tex.needsUpdate=true};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
 const L=1.9,m=new T.Mesh(new T.CylinderGeometry(.177,.177,.31*264/280,24,1,true,-L/2,L),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false}));
 m.position.set(0,.6,0);m.renderOrder=3;return m}
B.c_me=()=>{const M=window.__MII||{},SK=['#FFE0C7','#F9CBA7','#EDB48A','#D69A6B','#B87A4F','#8D5A3B','#FFEFE2','#6E4630'],HC=['#2B2420','#5A3A22','#8B5A2B','#D9A441','#E8503A','#F78FB3','#6FA8F0','#B79CF5'],
 TC=['#FFFFFF','#6FC3F2','#F46B6B','#4A7ACF','#FF9EBB','#F4F6FA','#FFFFFF','#E4E8F2','#FF8FB7','#3A6FD8'],
 PC=['#3A5FB8','#8E94A6','#FF9EBB','#FFD84D','#2B2733','#7A5AC8'],SC=[['#FFFFFF','#C8C8D4'],['#E5484D','#FFFFFF'],['#2B2733','#6A6482'],['#FFD84D','#E0A800'],['#FF9EBB','#FFFFFF'],['#3A6FD8','#FFFFFF']];
 const h=+M.h||0,hc=HC[+M.c||0]||HC[0],sk=SK[+M.s||0]||SK[0],t=+M.t||0,a=+M.a||0,gl=+M.x||0,p=+M.p||0,f=+M.f||0,e=+M.e||0,pc=PC[p]||PC[0],sc=SC[f]||SC[0];
 const g=person({top:TC[t]||'#FFFFFF',bottom:pc,hair:hc,skin:sk,longHair:h===3||h===7,robe:t===8});
 const add=(...m)=>m.forEach(x=>g.add(x));
 /* 褲：裙子加一圈裙襬；短褲把腿下半露出皮膚色；鞋：腳上兩個小鞋 */
 const P=g.userData.parts;
 for(let i=0;i<5;i++)g.remove(g.children[g.children.length-1]);/* 拿掉預設的點眼／腮紅／嘴，改貼捏臉做的表情 */
 add(faceSticker());
 if(p===2)add(cone(.17,.16,pc,0,.2,0,12));
 if(p===1||p===3){P.legL.material=P.legR.material=P.legL.material.clone();P.legL.material.color.copy(mat(sk).color);add(cyl(.054,.054,.09,pc,-.06,.155,0,8),cyl(.054,.054,.09,pc,.06,.155,0,8))}
 if(p===2){P.legL.material=P.legR.material=P.legL.material.clone();P.legL.material.color.copy(mat(sk).color)}
 [-.06,.06].forEach(x=>{const sh=sph(.062,sc[0],x,.022,.025,1,.55,1.35);add(sh,box(.11,.012,.14,sc[1],x,.006,.025));if(f===3)add(cyl(.056,.056,.07,sc[0],x,.07,0,8))});
 if(h===2){add(sph(.07,hc,-.18,.55,-.02,1,1.6,1),sph(.07,hc,.18,.55,-.02,1,1.6,1))}
 else if(h===4)add(sph(.09,hc,0,.82,-.02));
 else if(h===5){[[-.12,.74],[.12,.74],[0,.8],[-.17,.6],[.17,.6]].forEach(q=>add(sph(.08,hc,q[0],q[1],-.02)))}
 else if(h===6)add(sph(.07,hc,.17,.62,-.05,1,1.7,1));
 else if(h===8){for(let i=0;i<5;i++)add(cone(.04,.12,hc,-.1+i*.05,.8+(i%2)*.02,0,4))}
 else if(h===9)add(sph(.24,hc,0,.68,-.04));
 if(a===1)add(cyl(.17,.17,.07,'#E5484D',0,.8,0,14),box(.2,.02,.12,'#C23A3F',0,.78,.15));
 else if(a===2)add(sph(.045,'#FF8FB7',.1,.76,.12),sph(.03,'#FF6B9A',.1,.76,.12));
 else if(a===3){add(cyl(.11,.13,.08,'#FFD84D',0,.82,0,5));for(let i=0;i<5;i++)add(cone(.025,.07,'#FFD84D',Math.cos(i*1.2566)*.11,.89,Math.sin(i*1.2566)*.11,4))}
 else if(a===4)add(cone(.05,.1,'#B8BED0',-.1,.84,0,4),cone(.05,.1,'#B8BED0',.1,.84,0,4));
 else if(a===5)add(sph(.05,'#FF9EBB',-.1,.76,.1),sph(.025,'#FFD84D',-.1,.76,.14));
 else if(a===6)add(box(.38,.03,.05,'#3A4A8A',0,.8,0),sph(.05,'#3A4A8A',-.17,.62,0),sph(.05,'#3A4A8A',.17,.62,0));
 else if(a===7)add(cone(.16,.3,'#7A5AC8',0,.9,0,10),cyl(.24,.24,.025,'#5B3FA8',0,.77,0,14));
 g.userData.extra=null;addWander(g,.22,.35);return g};
CAT.push({id:'c_me',n:'我',c:'人物',p:0,r:1,e:'🧒',np:1,ch:1});
CAT.forEach(c=>{c.s=c.s||1});const BYID={};CAT.forEach(c=>BYID[c.id]=c);

/* ---------- 場景 ---------- */
let renderer,scene,cam,host,canvas,ro,raf=0,running=false,lastT=0,clock0=0,cbs={};
let foamS=10,isl2=[],ambG,butter=[],birds=[],flies,smokes=[],hemi,sun,moon,skyTex,skyCtx,stars,water,shallow,foams=[],clouds=[],baseG,tilesG,itemsG,fxG,markG,ghost=null,mark=null,boat;
const TH={};let RO=false,N=6,az=.75,elv=.62,dist=15.5,items=[],fx=[],timeMode='auto',tileMeshes=[];
const tgt=new T.Vector3(0,-.2,.9);
const KEYS=[{h:0,top:'#10173F',bot:'#2B3470',sun:'#8EA2FF',si:.35,hi:.55,gl:1,st:1},{h:5,top:'#10173F',bot:'#2B3470',sun:'#8EA2FF',si:.35,hi:.55,gl:1,st:1},{h:6.5,top:'#FF9E7A',bot:'#FFD9A0',sun:'#FFC48A',si:.8,hi:.85,gl:.5,st:0},{h:8,top:'#B7D8DC',bot:'#F3EEE0',sun:'#FFF1D6',si:1.05,hi:1,gl:0,st:0},{h:16.5,top:'#B7D8DC',bot:'#F3EEE0',sun:'#FFF1D6',si:1.05,hi:1,gl:0,st:0},{h:18,top:'#FF8E72',bot:'#FFD08A',sun:'#FFB27A',si:.85,hi:.85,gl:.6,st:0},{h:19.5,top:'#2B3470',bot:'#8F6FA0',sun:'#8EA2FF',si:.5,hi:.65,gl:1,st:.6},{h:21,top:'#10173F',bot:'#2B3470',sun:'#8EA2FF',si:.35,hi:.55,gl:1,st:1},{h:24,top:'#10173F',bot:'#2B3470',sun:'#8EA2FF',si:.35,hi:.55,gl:1,st:1}];
const lerpC=(a,b,k)=>new T.Color(a).lerp(new T.Color(b),k);
function keyAt(h){let i=0;while(i<KEYS.length-2&&KEYS[i+1].h<=h)i++;const a=KEYS[i],b=KEYS[i+1],k=Math.max(0,Math.min(1,(h-a.h)/(b.h-a.h)));return{top:lerpC(a.top,b.top,k),bot:lerpC(a.bot,b.bot,k),sun:lerpC(a.sun,b.sun,k),si:a.si+(b.si-a.si)*k,hi:a.hi+(b.hi-a.hi)*k,gl:a.gl+(b.gl-a.gl)*k,st:a.st+(b.st-a.st)*k}}
function applyTime(){let h;if(timeMode==='day')h=12;else if(timeMode==='night')h=22;else{const d=new Date();h=d.getHours()+d.getMinutes()/60}
 const k=keyAt(h);
 const g=skyCtx.createLinearGradient(0,0,0,256);g.addColorStop(0,'#'+k.top.getHexString());g.addColorStop(.62,'#'+k.bot.getHexString());g.addColorStop(1,'#'+k.bot.getHexString());skyCtx.fillStyle=g;skyCtx.fillRect(0,0,4,256);skyTex.needsUpdate=true;
 scene.fog.color.copy(k.bot);sun.color.copy(k.sun);sun.intensity=k.si;hemi.intensity=k.hi;hemi.color.copy(lerpC('#CFEBFF','#6E7BC8',k.gl));
 water.material.color.copy(lerpC('#86B9C3','#2C5FA8',k.gl));shallow.material.color.copy(lerpC('#B3DAD8','#4C86C8',k.gl));
 glows.forEach(m=>{m.emissiveIntensity=m.userData.gi*k.gl});stars.material.opacity=k.st;stars.visible=k.st>.02;
 clouds.forEach(c=>c.children.forEach(s=>s.material.opacity=.9-.55*k.gl));
 scene.userData.night=k.gl}
function cloud(x,y,z,s){const g=new T.Group();const m=new T.MeshStandardMaterial({color:'#FFFFFF',roughness:1,flatShading:true,transparent:true,opacity:.9,fog:false});[[0,0,0,.9],[.8,-.1,0,.65],[-.8,-.1,0,.7],[.3,.35,0,.6]].forEach(p=>{const mm=new T.Mesh(new T.IcosahedronGeometry(p[3],1),m.clone());mm.position.set(p[0],p[1],p[2]);mm.scale.y=.7;g.add(mm)});g.position.set(x,y,z);g.scale.setScalar(s);g.userData.sp=.15+Math.random()*.2;return g}
function init(){
 renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 canvas=renderer.domElement;canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none;outline:0';
 scene=new T.Scene();scene.fog=new T.Fog('#E9EFEA',75,170);
 const sc=document.createElement('canvas');sc.width=4;sc.height=256;skyCtx=sc.getContext('2d');skyTex=new T.CanvasTexture(sc);skyTex.colorSpace=T.SRGBColorSpace;scene.background=skyTex;
 cam=new T.PerspectiveCamera(30,1,.5,160);
 hemi=new T.HemisphereLight('#CFEBFF','#FFE3B8',1);scene.add(hemi);
 sun=new T.DirectionalLight('#FFF1D6',1);sun.position.set(7,12,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);const sc2=sun.shadow.camera;sc2.left=-9;sc2.right=9;sc2.top=9;sc2.bottom=-9;sc2.near=1;sc2.far=60;sun.shadow.bias=-.0006;sun.shadow.radius=3;scene.add(sun);
 water=new T.Mesh(new T.CircleGeometry(60,48),new T.MeshStandardMaterial({color:'#86B9C3',roughness:.25,metalness:.05,transparent:true,opacity:.92}));water.rotation.x=-1.5708;water.position.y=-.3;water.receiveShadow=true;scene.add(water);
 shallow=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshStandardMaterial({color:'#BFE0DF',roughness:.4,transparent:true,opacity:.32,depthWrite:false}));shallow.rotation.x=-1.5708;shallow.position.y=-.28;scene.add(shallow);
 for(let i=0;i<2;i++){const f=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:.3,depthWrite:false}));f.rotation.x=-1.5708;f.position.y=-.27;foams.push(f);scene.add(f)}
 const sp=new Float32Array(150*3);for(let i=0;i<150;i++){const a=Math.random()*6.283,e=.15+Math.random()*1.2,r=40;sp[i*3]=Math.cos(a)*Math.cos(e)*r;sp[i*3+1]=Math.sin(e)*r*.8+4;sp[i*3+2]=Math.sin(a)*Math.cos(e)*r}
 const sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(sp,3));stars=new T.Points(sg,new T.PointsMaterial({color:'#FFFFFF',size:.35,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(stars);
 [[-14,9,-12,1.4],[10,11,-16,1.8],[16,8,2,1.2],[-12,10,10,1.5],[4,12,-22,2]].forEach(c=>{const cl=cloud(c[0],c[1],c[2],c[3]);clouds.push(cl);scene.add(cl)});

 /* 周圍的小浮島 */
 [[-9.5,-6.5,.9,['pine','tree']],[10.5,-4.5,1.1,['tree','rock']],[-10,6.5,1,['sakura']],[9.5,8.5,.8,['pine','bush']],[0,-11.5,1.2,['tree','pine','rock']],[-3,13.5,.8,['bush']]].forEach((c,i)=>{
  const g=new T.Group();g.add(cyl(1,1.15,.5,P.sand,0,-.1,0,6),cyl(.92,.92,.12,P.grass,0,.2,0,6),cyl(1.1,.6,.9,P.soil,0,-.8,0,6));
  c[3].forEach((t,j)=>{const o=B[t](i,j);o.position.set((j-.5*(c[3].length-1))*.6,.26,(j%2?.3:-.2));o.scale.setScalar(.85);g.add(o)});
  g.scale.setScalar(c[2]);g.position.set(c[0],-.18,c[1]);g.userData.ph=i*1.3;g.userData.y0=-.18;isl2.push(g);scene.add(g)});

 /* 氛圍：蝴蝶、小鳥、螢火蟲 */
 ambG=new T.Group();scene.add(ambG);
 for(let i=0;i<4;i++){const cs=['#FFB7D0','#FFE680','#B79CF5','#9FD8FF'];const m=new T.MeshBasicMaterial({color:cs[i],side:T.DoubleSide});const b=new T.Group();const w1=new T.Mesh(new T.CircleGeometry(.09,6),m),w2=w1.clone();w1.position.x=-.08;w2.position.x=.08;b.add(w1,w2);b.userData={w1,w2,ph:i*1.7,r:2.2+i*.7};butter.push(b);ambG.add(b)}
 for(let i=0;i<3;i++){const m=new T.MeshBasicMaterial({color:'#FFFFFF',side:T.DoubleSide,fog:false});const b=new T.Group();const w1=new T.Mesh(new T.PlaneGeometry(.45,.1),m),w2=w1.clone();w1.position.x=-.22;w2.position.x=.22;b.add(w1,w2);b.userData={w1,w2,ph:i*2.1,r:9+i*2,h:7+i};birds.push(b);ambG.add(b)}
 {const fp=new Float32Array(30*3);for(let i=0;i<30;i++){fp[i*3]=(Math.random()-.5)*8;fp[i*3+1]=.2+Math.random()*1.2;fp[i*3+2]=(Math.random()-.5)*8}const fg=new T.BufferGeometry();fg.setAttribute('position',new T.BufferAttribute(fp,3));flies=new T.Points(fg,new T.PointsMaterial({color:'#FFF3A0',size:.14,transparent:true,opacity:0,fog:false,depthWrite:false}));ambG.add(flies)}
 baseG=new T.Group();tilesG=new T.Group();itemsG=new T.Group();fxG=new T.Group();markG=new T.Group();scene.add(baseG,tilesG,itemsG,fxG,markG);
 mark=G(mesh(new T.RingGeometry(.44,.52,6,1,1.5708,6.2832),'#FFFFFF',0,0,0));mark.children[0].rotation.x=-1.5708;mark.children[0].material=new T.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:.95});mark.children[0].castShadow=false;mark.visible=false;markG.add(mark);
 attach();
}
const HS=.5774,HW=1;
const hp=(q,r)=>[HW*(q+r/2),1.5*HS*r];
let THEME=null;const RAD=()=>(N-6)/2+3;
const hd=(q,r)=>Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r));
const WP=(gx,gz,s)=>{if(s===2){let x=0,z=0;[[0,0],[1,0],[0,1],[1,1]].forEach(o=>{const c=hp(gx+o[0]-5,gz+o[1]-5);x+=c[0]/4;z+=c[1]/4});return new T.Vector3(x,0,z)}const c=hp(gx-5,gz-5);return new T.Vector3(c[0],0,c[1])};
const active=(gx,gz)=>hd(gx-5,gz-5)<=RAD();
function buildBase(){
 while(baseG.children.length)baseG.remove(baseG.children[0]);while(tilesG.children.length)tilesG.remove(tilesG.children[0]);tileMeshes=[];
 const R=RAD(),GR=({sand:['#F2D88C','#EACB78','#F6E2A8'],forest:['#3E9650','#368A48','#48A25A'],snow:['#F7FBFF','#DCEAF6','#FFFFFF']})[THEME]||[P.grass,P.grass2,'#A0CC84'],hx=(r,h,c,x,y,z,cast)=>{const m=cyl(r,r,h,c,x,y,z,6);m.castShadow=!!cast;return m};
 for(let q=-R-1;q<=R+1;q++)for(let r=-R-1;r<=R+1;r++){const d=hd(q,r);if(d>R+1)continue;const c=hp(q,r),x=c[0],z=c[1];
  if(d<=R){const col=GR[(((q-r)%3)+3)%3];const m=hx(HS*.99,.5,col,x,-.25,z,false);m.receiveShadow=true;m.userData={gx:q+5,gz:r+5};tilesG.add(m);tileMeshes.push(m)}
  else baseG.add(hx(HS*.99,.56,P.sand,x,-.34,z));
  baseG.add(hx(HS*.99,.8,P.soil,x,-.9,z));
  if(d<=R)baseG.add(hx(HS*.96,.7,P.soil2,x,-1.65,z));
  if(d<=R-1)baseG.add(hx(HS*.9,.6,'#8E7C74',x,-2.3,z))}
 const sh=2*(HW*(R+1)+.95);shallow.geometry.dispose();shallow.geometry=new T.CircleGeometry(.5,6);shallow.scale.set(sh,sh,1);
 foams.forEach(f=>{f.geometry.dispose();f.geometry=new T.CircleGeometry(.5,6)});foamS=2*(HW*(R+1)+.6);foams.forEach(f=>f.scale.set(foamS,foamS,1));
 /* 碼頭與小船 */
 const dz=1.5*HS*(R+1)+.4;for(let i=0;i<5;i++){const pl=box(.9,.06,.32,'#C98B55',0,-.12,dz+i*.34-.1);baseG.add(pl)}baseG.add(cyl(.04,.04,.6,'#8A5A3A',-.5,-.2,dz+1.3,5),cyl(.04,.04,.6,'#8A5A3A',.5,-.2,dz+1.3,5));
 boat=G(box(.5,.14,.9,'#FFFFFF',0,0,0),box(.46,.05,.8,P.red,0,.07,0),cyl(.02,.02,.8,P.dark,0,.5,-.05,4),cone(.3,.7,'#FFF',0,.5,.1,3));boat.children[3].scale.set(.15,1,1);boat.children[3].rotation.y=0;boat.position.set(1.4,-.22,dz+2.5);boat.userData.base=boat.position.clone();baseG.add(boat);
 sun.shadow.camera.updateProjectionMatrix();
}
/* ---------- 道具管理 ---------- */
function make(t,gx,gz){const d=BYID[t];if(!d)return null;const g=B[t](gx,gz);const p=WP(gx,gz,d.s);g.position.set(p.x,0,p.z);g.userData.t=t;if(d.ch){g.userData.cs=1.35;g.scale.setScalar(1.35)}g.userData.base=g.position.clone();g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
function occ(gx,gz,s,ig){for(let i=0;i<items.length;i++){if(i===ig)continue;const it=items[i],ss=BYID[it.t].s;if(gx<it.x+ss&&gx+s>it.x&&gz<it.z+ss&&gz+s>it.z)return true}return false}
function valid(gx,gz,s,ig){for(let a=0;a<s;a++)for(let b=0;b<s;b++)if(!active(gx+a,gz+b))return false;return !occ(gx,gz,s,ig)}
function addItem(t,gx,gz,pop,silent){const g=make(t,gx,gz);if(!g)return -1;itemsG.add(g);items.push({t,x:gx,z:gz,g});if(pop&&!silent){g.userData.born=performance.now()/1000;g.scale.setScalar(.01);burst(g.position.x,.4,g.position.z)}return items.length-1}
function burst(x,y,z){const cs=['#FFD84D','#FF9EBB','#6FC3F2','#FFFFFF','#9BDD6B'];for(let i=0;i<14;i++){const m=new T.Mesh(new T.OctahedronGeometry(.06,0),new T.MeshBasicMaterial({color:cs[i%5],transparent:true,opacity:1,fog:false}));m.position.set(x,y,z);const a=Math.random()*6.283,s=.6+Math.random()*.9;fxG.add(m);fx.push({m,vx:Math.cos(a)*s,vy:1.8+Math.random()*1.4,vz:Math.sin(a)*s,life:1})}}
/* ---------- 輸入 ---------- */
function attach(){
 const ptr=new Map();let down=null,pinch=0;const ray=new T.Raycaster(),v2=new T.Vector2();
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});down={x:e.clientX,y:e.clientY,t:performance.now(),moved:0};if(ptr.size===2){const a=[...ptr.values()];pinch=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}});
 canvas.addEventListener('pointermove',e=>{const p=ptr.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(ptr.size===2){const a=[...ptr.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);dist=Math.max(10,Math.min(26,dist*(pinch/d)));pinch=d;if(down)down.moved=99}
  else if(ptr.size===1&&down){down.moved+=Math.abs(dx)+Math.abs(dy);if(down.moved>8){az-=dx*.007;elv=Math.max(.38,Math.min(1.0,elv+dy*.004))}}});
 const up=e=>{const was=ptr.has(e.pointerId);ptr.delete(e.pointerId);if(!was)return;
  if(down&&down.moved<=8&&performance.now()-down.t<600&&ptr.size===0){const r=canvas.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(v2,cam);
   const hi_=ray.intersectObjects(itemsG.children,true);if(hi_.length){let o=hi_[0].object;while(o&&o.parent!==itemsG)o=o.parent;const idx=items.findIndex(it=>it.g===o);if(idx>=0&&cbs.item){cbs.item(idx);down=null;return}}
   const ht=ray.intersectObjects(tileMeshes,false);if(ht.length&&cbs.tile){const u=ht[0].object.userData;cbs.tile(u.gx,u.gz)}}
  if(ptr.size===0)down=null};
 canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 canvas.addEventListener('wheel',e=>{e.preventDefault();dist=Math.max(10,Math.min(26,dist+e.deltaY*.01))},{passive:false});
}
/* ---------- 迴圈 ---------- */
function fit(){if(!host)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);cam.aspect=w/h;
 /* 直式手機：拉遠一點才看得到整座島 */cam.userData.fitK=w/h<1?Math.max(1,1.38/(w/h)):1;cam.updateProjectionMatrix()}
function frame(now){
 if(!running)return;raf=requestAnimationFrame(frame);
 if(document.hidden||!host||!host.clientWidth)return;
 if(now-lastT<30)return;const dt=Math.min(.1,(now-lastT)/1000);lastT=now;const t=now/1000;
 const d=dist*(cam.userData.fitK||1);cam.position.set(tgt.x+Math.sin(az)*Math.cos(elv)*d,tgt.y+Math.sin(elv)*d,tgt.z+Math.cos(az)*Math.cos(elv)*d);cam.lookAt(tgt);
 items.forEach(it=>{const g=it.g,u=g.userData;
  if(u.born!==undefined){const k=Math.min(1,(t-u.born)/.5);const s=k<1?(1-Math.pow(1-k,3))*(1+Math.sin(k*3.1416)*.25):1;g.scale.setScalar(Math.max(.01,s)*(u.cs||1));if(k>=1)delete u.born}
  if(u.anim)u.anim(t);if(u.sway)g.rotation.z=Math.sin(t*1.3+g.position.x)*.025});
 foams.forEach((f,i)=>{const k=((t*.25+i*.5)%1);const s=foamS*(1+k*.08);f.scale.set(s,s,1);f.material.opacity=.32*(1-k)});
 if(boat){boat.position.y=boat.userData.base.y+Math.sin(t*1.5)*.04;boat.rotation.z=Math.sin(t*1.2)*.05;boat.rotation.y=Math.sin(t*.4)*.2}

 butter.forEach(b=>{const u=b.userData,a=t*.5+u.ph;b.position.set(Math.sin(a)*u.r,.7+Math.sin(t*1.3+u.ph)*.35,Math.cos(a*.8)*u.r);b.rotation.y=-a;const f=Math.sin(t*16+u.ph)*.9;u.w1.rotation.y=f;u.w2.rotation.y=-f;b.visible=scene.userData.night<.5});
 birds.forEach(b=>{const u=b.userData,a=t*.18+u.ph;b.position.set(Math.cos(a)*u.r,u.h+Math.sin(t+u.ph)*.3,Math.sin(a)*u.r);b.rotation.y=-a+Math.PI;const f=Math.sin(t*5+u.ph)*.5;u.w1.rotation.z=f;u.w2.rotation.z=-f;b.visible=scene.userData.night<.6});
 if(flies){flies.material.opacity=Math.min(1,scene.userData.night*1.2)*(.6+.4*Math.sin(t*3));const pa=flies.geometry.attributes.position;for(let i=0;i<30;i++){pa.setY(i,pa.getY(i)+Math.sin(t*1.5+i)*.003);pa.setX(i,pa.getX(i)+Math.cos(t*.9+i*2)*.003)}pa.needsUpdate=true}
 items.forEach(it=>{const sm=it.g.userData.smoke;if(!sm)return;it.g.userData.sa=(it.g.userData.sa||0)+dt;if(it.g.userData.sa>.7&&it.g.scale.x>.9){it.g.userData.sa=0;const m=new T.Mesh(new T.SphereGeometry(.05,6,5),new T.MeshBasicMaterial({color:'#FFFFFF',transparent:true,opacity:.7,fog:false}));m.position.set(it.g.position.x+sm[0],sm[1],it.g.position.z+sm[2]);fxG.add(m);smokes.push({m,life:1})}});
 for(let i=smokes.length-1;i>=0;i--){const sk=smokes[i];sk.life-=dt*.5;sk.m.position.y+=dt*.28;sk.m.position.x+=dt*.05;sk.m.scale.setScalar(1+(1-sk.life)*2.2);sk.m.material.opacity=Math.max(0,sk.life*.6);if(sk.life<=0){fxG.remove(sk.m);smokes.splice(i,1)}}
 isl2.forEach(g=>{g.position.y=g.userData.y0+Math.sin(t*.8+g.userData.ph)*.06});
 clouds.forEach(c=>{c.position.x+=c.userData.sp*dt;if(c.position.x>22)c.position.x=-22});
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.life-=dt*1.3;f.vy-=5*dt;f.m.position.x+=f.vx*dt;f.m.position.y+=f.vy*dt;f.m.position.z+=f.vz*dt;f.m.rotation.y+=dt*8;f.m.material.opacity=Math.max(0,f.life);if(f.life<=0){fxG.remove(f.m);fx.splice(i,1)}}
 if(mark.visible){const s=1+Math.sin(t*5)*.06;mark.scale.set(s,s,s)}
 if(ghost)ghost.position.y=.04+Math.sin(t*5)*.03;
 renderer.render(scene,cam)}
function tintGhost(g,ok){g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.7;o.castShadow=false;if(o.material.emissive){o.material.emissive.set(ok?'#000000':'#FF2D2D');o.material.emissiveIntensity=ok?0:.8}}})}
/* ---------- 對外 ---------- */
window.Island={ready:true,CAT,BYID,
 mount(el,o){host=el;if(!renderer)init();host.appendChild(canvas);N=(o&&o.size)||N;THEME=(o&&o.theme)||null;buildBase();applyTime();fit();if(window.ResizeObserver){ro=new ResizeObserver(fit);ro.observe(host)}running=true;lastT=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)},
 unmount(){running=false;cancelAnimationFrame(raf);if(ro){ro.disconnect();ro=null}if(canvas&&canvas.parentNode)canvas.parentNode.removeChild(canvas);host=null;this.clearGhost()},
 on(k,f){cbs[k]=f},size(){return N},
 setSize(n){N=n;if(renderer){buildBase();items.forEach(it=>{})}},
 setItems(list){while(itemsG.children.length)itemsG.remove(itemsG.children[0]);items=[];const drop=[];list.forEach(r=>{let ok=!!BYID[r[0]];if(ok){const s=BYID[r[0]].s;for(let a=0;a<s;a++)for(let b=0;b<s;b++)if(!active(r[1]+a,r[2]+b))ok=false}if(ok&&occ(r[1],r[2],BYID[r[0]].s,-1))ok=false;if(ok)addItem(r[0],r[1],r[2],false,true);else drop.push(r)});return drop},
 add(t,gx,gz){return addItem(t,gx,gz,true)},
 remove(i){const it=items[i];if(!it)return;burst(it.g.position.x,.4,it.g.position.z);itemsG.remove(it.g);items.splice(i,1)},
 move(i,gx,gz){const it=items[i];if(!it)return;const p=WP(gx,gz,BYID[it.t].s);it.x=gx;it.z=gz;it.g.position.set(p.x,0,p.z);if(it.g.userData.base)it.g.userData.base.set(p.x,0,p.z);it.g.userData.born=performance.now()/1000;it.g.scale.setScalar(.01);burst(p.x,.4,p.z)},
 list(){return items.map(it=>[it.t,it.x,it.z])},
 valid,occ,active,
 mark(gx,gz,s){if(gx==null){mark.visible=false;return}const p=WP(gx,gz,s||1);mark.position.set(p.x,.03,p.z);mark.children[0].scale.setScalar(s===2?2:1);mark.visible=true},
 showGhost(t,gx,gz,ok){this.clearGhost();const d=BYID[t];if(!d)return;ghost=B[t](gx,gz);if(d.ch)ghost.scale.setScalar(1.35);const p=WP(gx,gz,d.s);ghost.position.set(p.x,.04,p.z);tintGhost(ghost,ok);markG.add(ghost)},
 clearGhost(){if(ghost){markG.remove(ghost);ghost=null}},
 setTime(m){timeMode=m;if(renderer)applyTime()},
 pop(gx,gz){const p=WP(gx,gz);burst(p.x,.4,p.z)},

 thumb(id,px){px=px||128;if(!TH.r){TH.r=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});TH.r.setPixelRatio(1);TH.r.outputColorSpace=T.SRGBColorSpace;TH.r.toneMapping=T.ACESFilmicToneMapping;TH.s=new T.Scene();TH.s.add(new T.HemisphereLight('#FFFFFF','#FFE3B8',1.1));const dl=new T.DirectionalLight('#FFF4E0',1.2);dl.position.set(3,6,4);TH.s.add(dl);TH.c=new T.PerspectiveCamera(28,1,.1,50);TH.cache={}}
  const ck=id+px+(id==='c_me'?JSON.stringify(window.__MII||{}):'');if(TH.cache[ck])return TH.cache[ck];
  const d=BYID[id];if(!d)return'';const g=B[id](0,0);const sc=new T.Group();sc.add(g);TH.s.add(sc);
  const bb=new T.Box3().setFromObject(g);const ctr=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3());const R=Math.max(sz.x,sz.y,sz.z,.5);
  const dist=R*2.9;TH.c.position.set(ctr.x+dist*.62,ctr.y+dist*.5,ctr.z+dist*.62);TH.c.lookAt(ctr.x,ctr.y-.02*R,ctr.z);
  TH.r.setSize(px,px,false);TH.r.render(TH.s,TH.c);const url=TH.r.domElement.toDataURL('image/png');TH.s.remove(sc);TH.cache[ck]=url;return url},
 setReadonly(f){RO=!!f},
 snapshot(){renderer.render(scene,cam);return canvas.toDataURL('image/png')}
};
})();
