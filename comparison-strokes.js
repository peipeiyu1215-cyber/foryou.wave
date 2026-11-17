'use strict';
function cleanComparisonStroke(image) {
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  const {data,width:w,height:h}=pixels,seen=new Uint8Array(w*h);
  for(let seed=0;seed<w*h;seed++){
    if(seen[seed]||data[seed*4+3]<30)continue;
    const component=[seed];seen[seed]=1;
    for(let k=0;k<component.length;k++){
      const p=component[k],x=p%w,y=Math.floor(p/w);
      for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++){
        const q=yy*w+xx;if(!seen[q]&&data[q*4+3]>=30){seen[q]=1;component.push(q);}
      }
    }
    if(component.length<10)for(const p of component)data[p*4+3]=0;
  }
  for(let p=0;p<w*h;p++)if(data[p*4+3]<30)data[p*4+3]=0;
  ctx.putImageData(pixels,0,0);return canvas;
}
