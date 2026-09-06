/* Native horizontal scrolling, explicit navigation, no automatic rotation. */
for(const block of document.querySelectorAll('[data-brand-carousel]')) {
  const rail=block.querySelector('.brand-rail'),items=[...rail.children];
  const controls=block.querySelector('[data-brand-controls]');
  const previous=block.querySelector('[data-brand-prev]'),next=block.querySelector('[data-brand-next]');
  const output=block.querySelector('output');let frame=false;
  function update(){
    const box=rail.getBoundingClientRect();
    const visible=items.map((item,index)=>({rect:item.getBoundingClientRect(),index})).filter(({rect})=>rect.right>box.left+8&&rect.left<box.right-8);
    const first=(visible[0]?.index??0)+1,last=(visible.at(-1)?.index??0)+1;
    output.textContent=`${first}${last!==first?'–'+last:''} ${output.dataset.of} ${items.length}`;
    previous.disabled=rail.scrollLeft<=1;
    next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;
  }
  function move(direction){
    const step=items[0].getBoundingClientRect().width+parseFloat(getComputedStyle(rail).gap);
    const count=Math.max(1,Math.floor(rail.clientWidth/step));
    rail.scrollBy({left:direction*step*count,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  controls.hidden=items.length<2;
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  rail.addEventListener('scroll',()=>{if(!frame)requestAnimationFrame(()=>{frame=false;update();});frame=true;},{passive:true});
  new ResizeObserver(update).observe(rail);update();
}
