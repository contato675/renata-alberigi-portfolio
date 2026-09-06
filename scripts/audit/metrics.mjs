// This function runs inside the browser against actual computed layout.
export function inspectLayout() {
  const visible=(el)=>el.getClientRects().length>0 && getComputedStyle(el).visibility!=='hidden';
  const controls=[...document.querySelectorAll('a,button')].filter(visible);
  const small=controls.filter((el)=>{const box=el.getBoundingClientRect();return box.width<43.5||box.height<43.5;}).map((el)=>({text:el.textContent.trim(),width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
  const unnamed=controls.filter((el)=>!el.textContent.trim()&&!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby')).map((el)=>el.outerHTML.slice(0,100));
  const imageProblems=[...document.images].filter(visible).filter((im)=>!im.complete||im.naturalWidth===0||!im.hasAttribute('alt')||!im.getAttribute('width')||!im.getAttribute('height')||im.getAttribute('draggable')!=='false').map((im)=>im.getAttribute('src'));
  let maxGridDrift=0;
  const offsets=[];
  for(const el of document.querySelectorAll('.hero-copy,.portrait,.section-title,.section-content,.project,.work-images,.work-info')) {
    const parent=el.parentElement;if(!parent.classList.contains('grid'))continue;
    const css=getComputedStyle(parent),rect=parent.getBoundingClientRect(),box=el.getBoundingClientRect();
    const tracks=css.gridTemplateColumns.split(' ').map(parseFloat),gap=parseFloat(css.columnGap),starts=[],ends=[];
    let left=rect.left+parseFloat(css.paddingLeft);
    for(const track of tracks){starts.push(left);ends.push(left+track);left+=track+gap;}
    const drift=Math.max(Math.min(...starts.map((x)=>Math.abs(x-box.left))),Math.min(...ends.map((x)=>Math.abs(x-box.right))));
    maxGridDrift=Math.max(maxGridDrift,drift);
  }
  const luminance=(rgb)=>rgb.map((x)=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
  const rgb=(str)=>str.match(/[\d.]+/g).slice(0,3).map(Number);
  const body=getComputedStyle(document.body),background=luminance(rgb(body.backgroundColor));
  const contrast=(color)=>{const fg=luminance(rgb(color));return (Math.max(fg,background)+.05)/(Math.min(fg,background)+.05);};
  const secondary=document.querySelector('.meta')||document.body;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  for(const heading of document.querySelectorAll('h1,h2')) {
    const css=getComputedStyle(heading);ctx.font=`${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
    offsets.push({text:heading.textContent.slice(0,60),firstGlyphInset:-ctx.measureText(heading.textContent.trim()[0]||'').actualBoundingBoxLeft});
  }
  return {width:innerWidth,overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),h1:document.querySelectorAll('h1').length,smallControls:small,unnamedControls:unnamed,imageProblems,maxGridDrift,bodyContrast:contrast(body.color),secondaryContrast:contrast(getComputedStyle(secondary).color),language:document.documentElement.lang,font:body.fontFamily,opticalObservations:offsets};
}
