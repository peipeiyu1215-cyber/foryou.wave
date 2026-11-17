'use strict';
// All cover is opaque geometry. The very same sampled contour draws and masks the foreground.
class ComparisonSea {
  constructor(glyphs) { this.glyphs=glyphs;this.roll=0;this.velocity=0;this.slosh=0;this.sloshVelocity=0;this.lastTarget=0;this.time=0;this.screenRotation=0; }
  step(target,dt) {
    // Keep a continuous physical roll even when a bounded slider wraps from 360 back to 0.
    target+=360*Math.round((this.lastTarget-target)/360);
    const travel=target-this.lastTarget;this.lastTarget=target;
    this.sloshVelocity+=Math.max(-1.8,Math.min(1.8,travel*.012));
    for(let left=Math.min(dt,.06);left>0;){const h=Math.min(left,1/180);left-=h;
      this.velocity+=(42*(target-this.roll)-11*this.velocity)*h;this.roll+=this.velocity*h;
      this.sloshVelocity+=(-31*this.slosh-5.5*this.sloshVelocity)*h;this.slosh+=this.sloshVelocity*h;
    }
    this.time+=dt;
  }
  settle(a) {this.roll=a;this.lastTarget=a;this.velocity=0;this.slosh=0;this.sloshVelocity=0;}
  state(a) {
    const radians=a*Math.PI/180,half=Math.cos(radians)<0?1:0;
    const p=Math.acos(Math.min(1,Math.abs(Math.cos(radians))))/(Math.PI/2);
    return {radians,half,p,sweep:Math.sin(2*radians)};
  }
  ridge(u,t) {
    return .027*Math.sin(3.9*u+t*.65)+.015*Math.sin(8.2*u-t*.43)+this.slosh*.13*Math.sin(2.2*u+t);
  }
  front(u,s,t) {
    // Spend most of the available angle on readable, partial immersion, then close quickly.
    let immersion;
    if(s.p<=.82)immersion=.55*Math.pow(s.p/.82,1.15);
    else {const z=(s.p-.82)/.18,z2=z*z,z3=z2*z;immersion=(2*z3-3*z2+1)*.55+(z3-2*z2+z)*(.55*1.15/.82*.18)+(-2*z3+3*z2);}
    const delayed=immersion-.14*Math.sin(Math.PI*immersion),p=delayed*delayed*(3-2*delayed),moving=Math.sin(Math.PI*immersion);
    const crest=Math.exp(-(((u-.30*s.sweep)/1.08)**2));
    const calm=.16+.84*moving;
    // A broad wall of water rises across the window. At the quarter turn the swell
    // collapses while the mean level remains above the submerged handwriting.
    const rise=Math.max(0,Math.min(1,(immersion-.4)/.3)),tower=rise*rise*(3-2*rise)*moving*moving;
    const breaking=moving*(.004*Math.sin(u*31+t*.25)+.002*Math.sin(u*79-t*.17));
    return .18-.82*p-.20*s.sweep*u+this.ridge(u,t)*calm-(.21*moving+.30*tower)*crest+breaking+this.slosh*.12*calm*Math.cos(2.7*u);
  }
  characters(a,t) {
    const s=this.state(a),text=s.half?'你比不上人家':'你看看別人',base=s.half?5:0,n=text.length;
    const phi=(this.roll-this.screenRotation)*Math.PI/180,c=Math.cos(phi),sn=Math.sin(phi),spacing=s.half?.285:.31;
    return [...text].map((char,i)=>{
      const anchor=(i-(n-1)/2)*spacing;
      const slope=(this.ridge(anchor+.005,t)-this.ridge(anchor-.005,t))/.01;
      const current=this.slosh*.025*Math.sin(i*1.3)+s.sweep*.022*Math.sin(i*.9+1);
      const capture=Math.sin(Math.PI*s.p),localPull=Math.exp(-(((anchor-.35*s.sweep)/.5)**2));
      const u=anchor+current-.065*s.sweep*capture*localPull;
      const v=-.205+this.ridge(u,t)+.007*Math.sin(i*2.1+t*.5)+.055*capture*localPull;
      const size=(s.half?.265:.295)*[1,.99,1.02,.97,1.01,1][i],img=this.glyphs[base+i];
      const h=size,w=h*img.width/img.height;
      return {char,img,u,v,x:c*u-sn*v,y:sn*u+c*v,w,h,rotation:s.half*Math.PI-this.screenRotation*Math.PI/180+Math.max(-.14,Math.min(.14,slope*.6))-.16*s.sweep*localPull};
    });
  }
  contour(s,t,extent=6) {
    const path=new Path2D();path.moveTo(-extent,this.front(-extent,s,t));
    for(let i=1;i<=360;i++){const u=-extent+2*extent*i/360;path.lineTo(u,this.front(u,s,t));}
    path.lineTo(extent,extent);path.lineTo(-extent,extent);path.closePath();
    return path;
  }
  curl(s,t) {
    // Retained for developer tools; the new wave is one continuous water mass.
    return new Path2D();
  }
  drawLetters(ctx,a,t) {
    for(const g of this.characters(a,t)){ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.rotation);ctx.drawImage(g.img,-g.w/2,-g.h/2,g.w,g.h);ctx.restore();}
  }
  render(ctx,a,t,width,height,scale,mode='all') {
    const s=this.state(a),phi=(this.roll-this.screenRotation)*Math.PI/180;
    this.visibleExtent=Math.hypot(width,height)/(2*scale)+.08;
    ctx.save();ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);ctx.translate(width/2,height*.5);ctx.scale(scale,scale);
    // Back ridge stays above the floating letters. The ocean's frame follows projected gravity.
    if(mode==='all') {ctx.save();ctx.rotate(phi);this.back(ctx,s,t);ctx.restore();}
    if(mode!=='water')this.drawLetters(ctx,a,t);
    ctx.save();ctx.rotate(phi);const contour=this.contour(s,t);
    ctx.fillStyle='#000';ctx.fill(contour);
    if(mode==='all'||mode==='water')this.foam(ctx,s,t,contour,scale);
    ctx.restore();ctx.restore();
  }
  back(ctx,s,t) {
    const sea=new Path2D();sea.moveTo(-6,6);sea.lineTo(-6,-.435+this.ridge(-6,t)*1.5);
    for(let i=0;i<=300;i++){const u=-6+i/25;sea.lineTo(u,-.435+this.ridge(u,t)*1.5);}
    sea.lineTo(6,6);sea.closePath();
    const shade=ctx.createLinearGradient(0,-.5,0,1.4);shade.addColorStop(0,'#454545');shade.addColorStop(.22,'#171717');shade.addColorStop(1,'#090909');ctx.fillStyle=shade;ctx.fill(sea);
  }
  foam(ctx,s,t,contour,scale) {
    const energy=Math.sin(Math.PI*s.p);
    ctx.save();ctx.clip(contour);
    // Project the supplied photograph's water onto the rising face, never its sky or shore.
    ctx.fillStyle='#bcbcbc';ctx.fillRect(-6,-6,12,12);
    if(!this.waterTexture)this.waterTexture=this.makeWaterTexture();
    // Warp on an unrotated pixel-aligned surface first, so adjacent columns cannot leave seams.
    const extent=this.visibleExtent||3,size=Math.min(1100,Math.ceil(extent*2*scale)),res=size/(extent*2);
    if(!this.faceCanvas)this.faceCanvas=document.createElement('canvas');
    const face=this.faceCanvas;if(face.width!==size||face.height!==size){face.width=size;face.height=size;}
    const faceCtx=face.getContext('2d'),material=faceCtx.createPattern(this.waterTexture,'repeat');
    material.setTransform(new DOMMatrix().translate((extent-t*.012)*res,(extent+this.slosh*.03-t*.008)*res).scale(.006*res,.0032*res));
    const faceDepth=.22+.85*energy;
    for(let i=0;i<size;i++){
      const u=-extent+(i+.5)/res,top=this.front(u,s,t);
      faceCtx.save();faceCtx.translate(0,top*res);faceCtx.fillStyle=material;faceCtx.fillRect(i,-top*res,1,size);faceCtx.restore();
      const shade=faceCtx.createLinearGradient(0,(top+extent)*res,0,(top+extent+faceDepth)*res);
      shade.addColorStop(0,'rgba(255,255,255,.55)');shade.addColorStop(.07,'rgba(245,245,245,.18)');
      shade.addColorStop(.25,'rgba(15,15,15,.28)');shade.addColorStop(.62,'rgba(30,30,30,.06)');shade.addColorStop(1,'rgba(255,255,255,.12)');
      faceCtx.fillStyle=shade;faceCtx.fillRect(i,0,1,size);
    }
    ctx.drawImage(face,-extent,-extent,extent*2,extent*2);
    // Light is pulled down the curved face in short, irregular moving rivulets.
    const random=n=>{const z=Math.sin(n*127.1+43.7)*43758.5453;return z-Math.floor(z);};
    for(let i=0;i<130;i++){
      const u=-5+10*random(i+11),depth=.08+random(i+391)*1.3,length=.025+random(i+81)*(.08+.2*energy);
      const start=this.front(u,s,t)+depth,drift=.012*Math.sin(t*.23+u*9+depth*7);
      ctx.beginPath();ctx.moveTo(u,start);ctx.bezierCurveTo(u+drift,start+length*.4,u-drift,start+length*.8,u+.006,start+length);
      ctx.strokeStyle='rgba(245,245,245,'+(.05+.13*energy*random(i+871))+')';ctx.lineWidth=.0015+.004*random(i+461);ctx.stroke();
    }
    const lip=new Path2D();
    for(let i=0;i<=480;i++){const u=-6+i*.025,v=this.front(u,s,t);i?lip.lineTo(u,v):lip.moveTo(u,v);}
    for(let i=480;i>=0;i--){const u=-6+i*.025,depth=.013+energy*.075*(1+.45*Math.sin(u*5+t*.12));lip.lineTo(u,this.front(u,s,t)+depth+energy*(.009*Math.sin(u*47-t*.2)+.005*Math.sin(u*91)));}
    lip.closePath();
    const foamMaterial=ctx.createPattern(this.foamTexture,'repeat');
    foamMaterial.setTransform(new DOMMatrix().translate(-t*.018,t*.005).scale(.006,.0009));
    ctx.fillStyle=foamMaterial;ctx.fill(lip);
    // Small, elongated foam flecks move along the spilling sheet; calm turns have almost none.
    for(let i=0;i<1250;i++){
      const u=-5+10*random(i+1),r=random(i+991),depth=.005+r*r*(.04+.32*energy);
      if(random(i+7001)>.08+.78*energy)continue;
      const v=this.front(u,s,t)+depth+.018*energy*Math.sin(u*7-depth*4-t*.2);
      const radius=.001+random(i+3101)*(.002+.004*energy);
      ctx.fillStyle=i%4?'#f4f4f4':'#dfdfdf';ctx.beginPath();ctx.ellipse(u+.012*Math.sin(t*.3+depth*9),v,radius*(2+depth*3),radius*.7,-.1,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    // Spray disappears continuously as the entire swell settles at the quarter turn.
    ctx.fillStyle='#fafafa';
    for(let i=0;i<100;i++){
      const u=-2+4*random(i+991),r=(.001+random(i+9)*.003)*energy;
      if(r<.0001)continue;const v=this.front(u,s,t)-energy*(.009+.12*random(i+81)**2);
      ctx.beginPath();ctx.ellipse(u,v,r,r*1.5,-.3*s.sweep,0,Math.PI*2);ctx.fill();
    }
  }
  makeWaterTexture() {
    const crop=document.createElement('canvas');crop.width=256;crop.height=512;
    const x=crop.getContext('2d');
    // Safe interior of the photographed wave: no diagonal sky edge, rocks, beach or lettering.
    x.drawImage(this.referencePhoto,8,245,100,245,0,0,256,512);
    const im=x.getImageData(0,0,256,512);
    for(let k=0;k<im.data.length;k+=4){
      const lum=(.2126*im.data[k]+.7152*im.data[k+1]+.0722*im.data[k+2])/255;
      const whiteWater=100+Math.pow(lum,.62)*150;
      im.data[k]=im.data[k+1]=im.data[k+2]=whiteWater;im.data[k+3]=255;
    }
    x.putImageData(im,0,0);
    // Mirrored water-only tiles have continuous boundaries when the flow crosses a tile.
    const tile=document.createElement('canvas');tile.width=512;tile.height=1024;const c=tile.getContext('2d');
    c.drawImage(crop,0,0);c.save();c.translate(512,0);c.scale(-1,1);c.drawImage(crop,0,0);c.restore();
    c.save();c.translate(0,1024);c.scale(1,-1);c.drawImage(tile,0,0,512,512,0,0,512,512);c.restore();
    // Sample an oblique strip just inside the photographed breaking crest for real foam grain.
    const source=document.createElement('canvas');source.width=this.referencePhoto.width;source.height=this.referencePhoto.height;
    const sourceCtx=source.getContext('2d');sourceCtx.drawImage(this.referencePhoto,0,0);
    const pixels=sourceCtx.getImageData(0,0,source.width,source.height).data;
    this.foamTexture=document.createElement('canvas');this.foamTexture.width=512;this.foamTexture.height=128;
    const foamCtx=this.foamTexture.getContext('2d'),foam=foamCtx.createImageData(512,128);
    for(let py=0;py<128;py++)for(let px=0;px<512;px++){
      const sy=Math.floor(80+270*px/512),sx=Math.max(0,Math.floor(.66*sy-7-py/128*35));
      const from=(sy*source.width+sx)*4,to=(py*512+px)*4;
      const lum=(.2126*pixels[from]+.7152*pixels[from+1]+.0722*pixels[from+2])/255;
      foam.data[to]=foam.data[to+1]=foam.data[to+2]=165+90*Math.sqrt(lum);foam.data[to+3]=255;
    }
    foamCtx.putImageData(foam,0,0);
    return tile;
  }
}
