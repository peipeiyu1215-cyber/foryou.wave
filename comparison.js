'use strict';
const $=id=>document.getElementById(id),canvas=$('stage'),ctx=canvas.getContext('2d',{alpha:false});
const norm=a=>((a%360)+360)%360;
let angle=0,playing=false,sensing=false,width=0,height=0,scale=1,lastFrame=0,clock=0,ready=false,sea;
let previewHold=0,previewElapsed=0;
function advancePreview(dt){
  if(previewHold>0){const used=Math.min(dt,previewHold);previewHold-=used;dt-=used;if(dt<=0)return;}
  previewElapsed+=dt;const ramp=Math.min(1,previewElapsed/2800),phase=Math.acos(Math.min(1,Math.abs(Math.cos(angle*Math.PI/180))))/(Math.PI/2);
  const close=Math.max(0,Math.min(1,(phase-.88)/.09)),speed=(6+22*close*close*(3-2*close))*(ramp*ramp*(3-2*ramp));
  const next=angle+dt*speed/1000,lap=Math.floor(angle/360),boundary=(lap+1)*360;
  if(next>=boundary){setAngle(boundary);previewHold=1600;previewElapsed=0;}else setAngle(next);
}
const screenAngle=()=>screen.orientation?.angle??window.orientation??0;
let screenBase=screenAngle();
function syncScreenFrame(){if(sea)sea.screenRotation=screenAngle()-screenBase;resize();}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);width=r.width;height=r.height;canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);scale=Math.min(width*.43,height*.38);}
new ResizeObserver(resize).observe(canvas);
function render(t=clock){if(ready)sea.render(ctx,angle,t,width,height,scale);}
function setPlaying(on){if(on&&!playing){previewHold=norm(angle)<.25?1600:0;previewElapsed=previewHold?0:2800;}playing=on;$('play').textContent=on?'暫停':'播放預覽';$('play').setAttribute('aria-pressed',on)}
function disableSensor(){sensing=false;$('sensor').setAttribute('aria-pressed','false')}
function setAngle(a,manual=false){if(!Number.isFinite(a))return;if(manual){setPlaying(false);disableSensor()}angle=a;const n=a===360?360:norm(a);$('angle').value=n;$('degree').value=n.toFixed(1)+'°';}
$('angle').oninput=e=>setAngle(+e.target.value,true);$('play').onclick=()=>{disableSensor();setPlaying(!playing)};$('reset').onclick=()=>{setAngle(0,true);$('status').textContent='已回到起始角度。'};
let drag=null;canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,a:angle};setPlaying(false);disableSensor()};canvas.onpointermove=e=>{if(drag)setAngle(drag.a+(e.clientX-drag.x)*360/width,true)};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
let lastRaw=null,unwrapped=0,zero=0,filtered=null,lastSensorTime=0,lastEvent=0;
function orientation(e){if(e.beta===null||e.gamma===null||!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;const b=e.beta*Math.PI/180,g=e.gamma*Math.PI/180;
// Project world gravity into the display plane: phone roll, independent of compass heading.
const gx=Math.cos(b)*Math.sin(g),gy=Math.sin(b);if(Math.hypot(gx,gy)<.16){if(sensing)$('status').textContent='請將手機稍微立起，讓旋轉方向穩定。';return}const raw=Math.atan2(-gx,gy)*180/Math.PI;lastEvent=performance.now();if(lastRaw===null){lastRaw=raw;zero=unwrapped-angle}unwrapped+=((raw-lastRaw+540)%360)-180;lastRaw=raw;if(!sensing)return;const target=unwrapped-zero,now=performance.now(),dt=Math.min(100,now-lastSensorTime||16);lastSensorTime=now;const error=target-(filtered??target);if(Math.abs(error)>.12)filtered=(filtered??target)+error*(1-Math.exp(-dt/35));setAngle(filtered??target);}
window.addEventListener('deviceorientation',orientation);
$('sensor').onclick=async()=>{if(sensing){disableSensor();$('status').textContent='已停止手機旋轉控制。';return}try{if(!isSecureContext)throw Error('手機旋轉需要 HTTPS，請開啟已部署的安全網址；滑桿與拖曳仍可操作。');if(!window.DeviceOrientationEvent)throw Error('此裝置未提供方向感測，可使用滑桿或拖曳。');if(typeof DeviceOrientationEvent.requestPermission==='function'&&await DeviceOrientationEvent.requestPermission()!=='granted')throw Error('未取得動作感測權限，請在瀏覽器設定允許。');setPlaying(false);sensing=true;lastRaw=null;filtered=angle;zero=unwrapped-angle;$('sensor').setAttribute('aria-pressed','true');$('status').textContent='保持手機直立並轉動；目前姿勢設為起點，可隨時校正。';setTimeout(()=>{if(sensing&&performance.now()-lastEvent>2500)$('status').textContent='尚未收到方向資料，請確認動作權限並將手機立起。'},3000)}catch(e){$('status').textContent=e.message}};
$('calibrate').onclick=()=>{zero=unwrapped;filtered=0;screenBase=screenAngle();syncScreenFrame();setAngle(0);$('status').textContent='目前姿勢已校正為 0°。'};
$('fullscreen').onclick=async()=>{document.body.classList.add('immersive');try{if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen()}catch{}resize()};$('restore').onclick=async()=>{document.body.classList.remove('immersive');if(document.fullscreenElement)await document.exitFullscreen();resize()};document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)document.body.classList.remove('immersive');resize()});
window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowRight')setAngle(angle+1,true);if(e.key==='ArrowLeft')setAngle(angle-1,true);if(e.key==='Escape')$('restore').click()});
function frame(now){const dt=lastFrame?Math.min(now-lastFrame,60):0;lastFrame=now;if(!document.hidden){clock+=dt/1000;if(playing)advancePreview(dt);if(ready)sea.step(angle,dt/1000);render()}requestAnimationFrame(frame)}

if(screen.orientation)screen.orientation.addEventListener('change',syncScreenFrame);else window.addEventListener('orientationchange',syncScreenFrame);
const comparisonReferenceReady=new Promise((resolve,reject)=>{const photo=new Image();photo.onload=()=>resolve(photo);photo.onerror=()=>reject(Error('無法載入海浪參考材質'));photo.src=comparisonSeaReference;});
window.comparisonReady=Promise.all(Array.from({length:11},(_,i)=>new Promise((resolve,reject)=>{
const img=new Image();img.onload=()=>resolve(cleanComparisonStroke(img));img.onerror=()=>reject(Error('無法載入手寫字素材 '+i));img.src=comparisonHandwriting[i];
}))).then(async glyphs=>{const photo=await comparisonReferenceReady;sea=new ComparisonSea(glyphs);sea.referencePhoto=photo;ready=true;resize();setAngle(0);render(0);requestAnimationFrame(frame);}).catch(e=>{$('status').textContent=e.message;throw e;});
window.comparisonDebug={
setAngle:a=>setAngle(a,true),render,orientation,
settle(a=angle){setAngle(a,true);sea.settle(a);render(0);},step:dt=>sea.step(angle,dt),
get angle(){return angle},get playing(){return playing},get sensing(){return sensing},get sea(){return sea},
advancePreview, get preview(){return {hold:previewHold,elapsed:previewElapsed};},
get dimensions(){return {width,height,scale}},
snapshot(){return {angle,roll:sea.roll,velocity:sea.velocity,slosh:sea.slosh,state:sea.state(angle),characters:sea.characters(angle,0).map(({img,...g})=>g)};},
textPixels(a,masked=true){
const out=document.createElement('canvas');out.width=width;out.height=height;const c=out.getContext('2d');
sea.settle(a);c.fillStyle='#000';c.fillRect(0,0,width,height);
if(masked)sea.render(c,a,0,width,height,scale,'text');
else {c.translate(width/2,height*.5);c.scale(scale,scale);sea.drawLetters(c,a,0);}
const data=c.getImageData(0,0,width,height).data;let pixels=0;for(let i=0;i<data.length;i+=4)if(data[i]>50)pixels++;return pixels;
}
};
