'use strict';
const COLS=10, ROWS=20;
const SHAPES={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
const COLORS={I:'#69dfe5',O:'#f4d16f',T:'#bb9afa',S:'#91ddb1',Z:'#f28e99',J:'#7caaf2',L:'#f5ae78'};
const empty=()=>Array.from({length:ROWS},()=>Array(COLS).fill(null));
const copy=m=>m.map(row=>row.slice());
function rotate(m,dir){return m.map((row,y)=>row.map((_,x)=>dir===1?m[m.length-1-x][y]:m[x][m.length-1-y]));}
class Game{
 constructor(random=Math.random){this.random=random;this.reset()}
 reset(){this.board=empty();this.bag=[];this.queue=[this.take(),this.take(),this.take()];this.score=0;this.lines=0;this.level=1;this.held=null;this.canHold=true;this.over=false;this.spawn()}
 take(){if(!this.bag.length){this.bag=Object.keys(SHAPES);for(let i=this.bag.length-1;i>0;i--){let j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]]}}return this.bag.pop()}
 spawn(type){type=type||this.queue.shift();if(this.queue.length<3)this.queue.push(this.take());this.piece={type,m:copy(SHAPES[type]),x:3,y:0};if(this.collides(this.piece))this.over=true}
 collides(p){return p.m.some((row,y)=>row.some((v,x)=>v&&(p.x+x<0||p.x+x>=COLS||p.y+y>=ROWS||(p.y+y>=0&&this.board[p.y+y][p.x+x]))))}
 move(dx,dy){let p={...this.piece,x:this.piece.x+dx,y:this.piece.y+dy};if(this.collides(p))return false;this.piece=p;return true}
 turn(dir){let m=rotate(this.piece.m,dir);for(const [dx,dy] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]]){let p={...this.piece,m,x:this.piece.x+dx,y:this.piece.y+dy};if(!this.collides(p)){this.piece=p;return true}}return false}
 lock(){let p=this.piece;p.m.forEach((row,y)=>row.forEach((v,x)=>{if(v&&p.y+y>=0)this.board[p.y+y][p.x+x]=p.type}));let n=0;this.board=this.board.filter(row=>{if(row.every(Boolean)){n++;return false}return true});while(this.board.length<ROWS)this.board.unshift(Array(COLS).fill(null));this.score+=([0,100,300,500,800][n]||0)*this.level;this.lines+=n;this.level=1+Math.floor(this.lines/10);this.canHold=true;this.spawn()}
 step(){if(!this.move(0,1))this.lock()}
 drop(){let n=0;while(this.move(0,1))n++;this.score+=n*2;this.lock()}
 hold(){if(!this.canHold)return;let old=this.held;this.held=this.piece.type;this.spawn(old||undefined);this.canHold=false}
 ghost(){let p={...this.piece};while(!this.collides({...p,y:p.y+1}))p.y++;return p}
}
if(typeof module!=='undefined')module.exports={Game,rotate,SHAPES};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id), board=$('board'),ctx=board.getContext('2d'),next=$('next').getContext('2d'),hold=$('hold').getContext('2d');let game=new Game(),state='ready',last=0,elapsed=0,best=0;try{best=Number(localStorage.stacklightBest)||0}catch(e){};
 function tile(c,x,y,size,color,ghost=false){c.fillStyle=ghost?'#ffffff12':color;c.strokeStyle=ghost?color:'#ffffff50';c.lineWidth=ghost?1:1.5;c.beginPath();c.roundRect(x*size+2,y*size+2,size-4,size-4,3);c.fill();c.stroke();if(!ghost){c.fillStyle='#ffffff33';c.fillRect(x*size+5,y*size+5,size-10,2)}}
 function piece(c,p,size,ghost=false){p.m.forEach((row,y)=>row.forEach((v,x)=>{if(v&&p.y+y>=0)tile(c,p.x+x,p.y+y,size,COLORS[p.type],ghost)}))}
 function preview(c,type){c.clearRect(0,0,100,100);if(!type)return;let m=SHAPES[type],coords=[];m.forEach((r,y)=>r.forEach((v,x)=>{if(v)coords.push([x,y])}));let minX=Math.min(...coords.map(p=>p[0])),maxX=Math.max(...coords.map(p=>p[0])),minY=Math.min(...coords.map(p=>p[1])),maxY=Math.max(...coords.map(p=>p[1]));c.save();c.translate((100-(maxX-minX+1)*20)/2-minX*20,(100-(maxY-minY+1)*20)/2-minY*20);piece(c,{type,m,x:0,y:0},20);c.restore()}
 function render(){ctx.clearRect(0,0,300,600);ctx.strokeStyle='#ffffff0b';ctx.lineWidth=1;for(let x=0;x<=10;x++){ctx.beginPath();ctx.moveTo(x*30,0);ctx.lineTo(x*30,600);ctx.stroke()}for(let y=0;y<=20;y++){ctx.beginPath();ctx.moveTo(0,y*30);ctx.lineTo(300,y*30);ctx.stroke()}game.board.forEach((row,y)=>row.forEach((v,x)=>{if(v)tile(ctx,x,y,30,COLORS[v])}));if(!game.over){piece(ctx,game.ghost(),30,true);piece(ctx,game.piece,30)}preview(next,game.queue[0]);preview(hold,game.held);$('score').textContent=game.score.toLocaleString();$('lines').textContent=game.lines;$('level').textContent=game.level;$('best').textContent=best.toLocaleString()}
 function overlay(title,text,button){$('overlay').classList.remove('hidden');$('overlay').querySelector('h2').innerHTML=title;$('overlay').querySelector('p').textContent=text;$('start').innerHTML=button+' <span>↗</span>'}
 function end(){state='over';if(game.score>best){best=game.score;try{localStorage.stacklightBest=best}catch(e){}}overlay('Nice stacking.','You scored '+game.score.toLocaleString()+' points. Ready for another round?','PLAY AGAIN')}
 function pause(){if(state==='playing'){state='paused';overlay('Take a breath.','Your game is paused.','RESUME')}else if(state==='paused'){state='playing';$('overlay').classList.add('hidden');last=0}}
 function action(a){if(a==='pause'){pause();return}if(state!=='playing')return;switch(a){case'left':game.move(-1,0);break;case'right':game.move(1,0);break;case'down':if(game.move(0,1))game.score++;else game.lock();break;case'cw':game.turn(1);break;case'ccw':game.turn(-1);break;case'drop':game.drop();break;case'hold':game.hold()}if(game.over)end();render()}
 $('start').addEventListener('click',()=>{if(state!=='paused')game.reset();state='playing';elapsed=0;last=0;$('overlay').classList.add('hidden');render()});$('pause').addEventListener('click',pause);
 const keys={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'cw',x:'cw',X:'cw',z:'ccw',Z:'ccw',' ':'drop',c:'hold',C:'hold',p:'pause',P:'pause'};document.addEventListener('keydown',e=>{let a=keys[e.key];if(!a)return;e.preventDefault();if(e.repeat&&['drop','hold','pause','cw','ccw'].includes(a))return;action(a)});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
 document.querySelectorAll('[data-action]').forEach(b=>{let timer,repeat;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);action(b.dataset.action);if(['left','right','down'].includes(b.dataset.action))timer=setTimeout(()=>{repeat=setInterval(()=>action(b.dataset.action),80)},250)});function stop(){clearTimeout(timer);clearInterval(repeat)}b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('lostpointercapture',stop);b.addEventListener('click',e=>{if(e.detail===0)action(b.dataset.action)})});
 function loop(t){if(state==='playing'){if(last)elapsed+=Math.min(t-last,100);if(elapsed>=Math.max(80,800*Math.pow(.82,game.level-1))){game.step();elapsed=0;if(game.over)end();render()}}last=t;requestAnimationFrame(loop)}render();requestAnimationFrame(loop)
}
