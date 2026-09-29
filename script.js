(function(){
  var KEY="quran-treasure-board-v1";
  var ar=function(n){return Number(n).toLocaleString("ar-EG");};
  var STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#st"/></svg>';
  var TICK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function toggles(prefix,n,label){
    var h="";for(var i=0;i<n;i++){h+='<button type="button" class="tg" data-k="'+prefix+i+'" aria-pressed="false" aria-label="'+label+' '+ar(i+1)+'">'+STAR+'</button>';}
    return h;
  }

  /* Groups: soft, harmonious colors */
  var groups=[
    {f:"🍎",n:"مجموعة التفاحة",c:"#E04A36"},
    {f:"🥭",n:"مجموعة المانجو",c:"#F08A1C"},
    {f:"🍇",n:"مجموعة العنب",c:"#9A4DB8"},
    {f:"🍌",n:"مجموعة الموز",c:"#E3AE12"},
    {f:"🍓",n:"مجموعة الفراولة",c:"#E3457A"}
  ];
  var gh="";
  groups.forEach(function(g,i){
    var mem="";for(var m=0;m<6;m++){mem+='<li><b>'+ar(m+1)+'</b><div contenteditable="true" data-k="gr'+i+'.m'+m+'" aria-label="اسم العضو '+ar(m+1)+'"></div></li>';}
    gh+='<div class="card grp" id="grp'+i+'" style="--ca:'+g.c+'">'+
      '<div class="ghead"><span class="fruit" aria-hidden="true">'+g.f+'</span>'+
      '<div class="gname" contenteditable="true" data-k="gr'+i+'.name">'+g.n+'</div>'+
      '<span class="count" id="gc'+i+'"></span></div>'+
      '<div class="stars">'+toggles("gr"+i+".s",10,"نجمة")+'</div>'+
      '<ol class="members">'+mem+'</ol></div>';
  });
  document.getElementById("groups").innerHTML=gh;

  /* Goals: 5 empty lines */
  var gl="";
  for(var q=0;q<5;q++){
    gl+='<li class="goal" id="goal'+q+'">'+
      '<button type="button" class="gchk" data-k="gc.'+q+'" aria-pressed="false" aria-label="تم الهدف '+ar(q+1)+'">'+TICK+'</button>'+
      '<div class="gtext" contenteditable="true" data-k="g.'+q+'" aria-label="هدف '+ar(q+1)+'"></div></li>';
  }
  document.getElementById("goals").innerHTML=gl;

  /* Students outside their group */
  var oc=["#E0584B","#E3A21A","#4FA34A","#2F8FC0","#A14E8F"];
  var oh="";
  oc.forEach(function(c,i){
    oh+='<div class="card orow" id="o'+i+'" style="--ca:'+c+'">'+
      '<div class="otop"><div class="oname ph" contenteditable="true" data-k="o'+i+'.name" data-ph="اسم الطالب" aria-label="اسم الطالب"></div>'+
      '<div class="opick" role="group" aria-label="مجموعته">'+groups.map(function(g,gi){return '<button type="button" class="ogrp" data-o="'+i+'" data-g="'+gi+'" aria-pressed="false" aria-label="'+g.n+'">'+g.f+'</button>';}).join("")+'</div>'+
      '<span class="count" id="oc'+i+'"></span></div>'+
      '<div class="stars">'+toggles("o"+i+".s",5,"نجمة")+'</div>'+
      '<span class="back"></span></div>';
  });
  document.getElementById("outs").innerHTML=oh;

  /* State */
  var state;
  try{state=JSON.parse(localStorage.getItem(KEY));}catch(e){state=null;}
  if(!state||typeof state!=="object"){state={t:{},e:{}};}
  state.t=state.t||{};state.e=state.e||{};
  var timer;
  function save(){clearTimeout(timer);timer=setTimeout(function(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}},250);}
  function hydrate(){
    document.querySelectorAll("button[data-k]").forEach(function(b){b.setAttribute("aria-pressed",state.t[b.dataset.k]?"true":"false");});
    document.querySelectorAll("[contenteditable][data-k]").forEach(function(el){if(el.dataset.k in state.e)el.textContent=state.e[el.dataset.k];});
  }
  function count(prefix,n){var c=0;for(var i=0;i<n;i++)if(state.t[prefix+i])c++;return c;}

  var board=document.getElementById("board"),chest=document.getElementById("chest");
  var pending=[null,null,null,null,null];
  function setText(k,v){state.e[k]=v;var el=document.querySelector('[data-k="'+k+'"]');if(el)el.textContent=v;}
  function same(a,b){return (a||"").replace(/\s+/g," ").trim()===(b||"").replace(/\s+/g," ").trim();}

  /* When a student is sent out: take their name off their group's list */
  function detach(o){
    var name=state.e["o"+o+".name"],g=state.e["o"+o+".grp"];
    if(!name||!name.trim()||g===undefined||g==="")return;
    for(var m=0;m<6;m++){if(same(state.e["gr"+g+".m"+m],name)){setText("gr"+g+".m"+m,"");}}
  }
  /* After 5 stars: write the name back in the group and clear the row */
  function moveBack(o){
    pending[o]=null;
    var name=(state.e["o"+o+".name"]||"").trim(),g=state.e["o"+o+".grp"];
    if(!name||g===undefined||g===""||count("o"+o+".s",5)!==5)return;
    var slot=-1,already=false;
    for(var m=0;m<6;m++){
      var cur=state.e["gr"+g+".m"+m];
      if(same(cur,name))already=true;
      if(slot<0&&!(cur||"").trim())slot=m;
    }
    if(!already&&slot<0)return;
    if(!already){
      setText("gr"+g+".m"+slot,name);
      var li=document.querySelector('[data-k="gr'+g+'.m'+slot+'"]').parentNode;
      li.classList.remove("new");void li.offsetWidth;li.classList.add("new");
    }
    var card=document.getElementById("grp"+g);
    card.classList.remove("welcome");void card.offsetWidth;card.classList.add("welcome");
    setText("o"+o+".name","");
    delete state.e["o"+o+".grp"];
    for(var i=0;i<5;i++){delete state.t["o"+o+".s"+i];}
    document.querySelectorAll('#o'+o+' .tg').forEach(function(b){b.setAttribute("aria-pressed","false");b.classList.remove("pop");});
    refresh();save();
    setTimeout(fit,50);
  }

  function refresh(){
    for(var g=0;g<5;g++){
      var n=count("gr"+g+".s",10);
      document.getElementById("grp"+g).classList.toggle("full",n===10);
      document.getElementById("gc"+g).innerHTML="⭐ <b>"+ar(n)+"</b> من "+ar(10);
    }
    var written=0,checked=0;
    for(var q=0;q<5;q++){
      var d=!!state.t["gc."+q];
      document.getElementById("goal"+q).classList.toggle("done",d);
      if((state.e["g."+q]||"").trim()){written++;if(d)checked++;}
    }
    chest.classList.toggle("open",written>0&&checked===written);
    for(var o=0;o<5;o++){
      var row=document.getElementById("o"+o),c=count("o"+o+".s",5),full=c===5;
      document.getElementById("oc"+o).innerHTML="⭐ <b>"+ar(c)+"</b> من "+ar(5);
      var gsel=state.e["o"+o+".grp"];gsel=(gsel===undefined||gsel==="")?-1:+gsel;
      row.classList.toggle("full",full);
      row.style.setProperty("--ca",gsel>=0?groups[gsel].c:oc[o]);
      row.querySelectorAll(".ogrp").forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.g===gsel?"true":"false");});
      var name=(state.e["o"+o+".name"]||"").trim();
      row.querySelector(".back").textContent=(gsel<0)?"اختر مجموعته 👆":(name?"✓ عاد إلى مجموعته":"اكتب اسمه");
      var ready=full&&gsel>=0&&name;
      if(ready&&!pending[o]){pending[o]=setTimeout(moveBack.bind(null,o),1500);}
      else if(!ready&&pending[o]){clearTimeout(pending[o]);pending[o]=null;}
    }
  }

  board.addEventListener("click",function(e){
    var b=e.target.closest("button[data-k]");if(!b)return;
    var k=b.dataset.k;state.t[k]=!state.t[k];
    b.setAttribute("aria-pressed",state.t[k]?"true":"false");
    if(b.classList.contains("tg")){b.classList.remove("pop");if(state.t[k]){void b.offsetWidth;b.classList.add("pop");}}
    refresh();save();
  });
  board.addEventListener("click",function(e){
    var b=e.target.closest(".ogrp");if(!b)return;
    var o=b.dataset.o,g=b.dataset.g,k="o"+o+".grp";
    state.e[k]=(state.e[k]===g)?"":g;
    detach(o);refresh();save();
  });
  board.addEventListener("focusout",function(e){
    var el=e.target.closest("[data-k$='.name']");
    if(el&&/^o\d/.test(el.dataset.k)){detach(el.dataset.k.charAt(1));refresh();save();}
  });
  board.addEventListener("input",function(e){
    var el=e.target.closest("[contenteditable][data-k]");if(!el)return;
    if(el.textContent.trim()==="")el.innerHTML="";
    state.e[el.dataset.k]=el.textContent;save();refresh();
  });
  board.addEventListener("keydown",function(e){
    if(e.key==="Enter"&&e.target.closest("[contenteditable]")){e.preventDefault();e.target.blur();}
  });
  board.addEventListener("paste",function(e){
    if(!e.target.closest("[contenteditable]"))return;
    e.preventDefault();
    var t=(e.clipboardData||window.clipboardData).getData("text").replace(/\s*\n\s*/g," ");
    document.execCommand("insertText",false,t);
  });

  /* New class: wipes everything that was typed or ticked, including member names */
  var nb=document.getElementById("newClass"),ct;
  nb.addEventListener("click",function(){
    if(!nb.classList.contains("confirm")){
      nb.classList.add("confirm");nb.textContent="اضغط مرة أخرى لمسح كل شيء";
      ct=setTimeout(function(){nb.classList.remove("confirm");nb.textContent="حصة جديدة";},3000);return;
    }
    clearTimeout(ct);
    pending.forEach(function(t,i){if(t){clearTimeout(t);pending[i]=null;}});
    state={t:{},e:{}};
    document.querySelectorAll("[contenteditable][data-k]").forEach(function(el){
      var m=el.dataset.k.match(/^gr(\d)\.name$/);
      el.textContent=m?groups[+m[1]].n:"";
    });
    hydrate();refresh();save();
    document.querySelectorAll(".tg.pop").forEach(function(b){b.classList.remove("pop");});
    nb.classList.remove("confirm");nb.textContent="حصة جديدة";
    setTimeout(fit,50);
  });

  hydrate();refresh();

  /* Scale the whole board to the largest size that fits the screen */
  var cols=document.querySelectorAll(".col");
  function fits(){
    for(var i=0;i<cols.length;i++){if(cols[i].scrollHeight>cols[i].clientHeight+1)return false;}
    var ps=document.querySelectorAll(".panel");
    for(var k=0;k<ps.length;k++){if(ps[k].scrollHeight>ps[k].clientHeight)return false;}
    var els=document.querySelectorAll(".card,.sign,.ghead,.otop,.members li,.goal,.top");
    for(var j=0;j<els.length;j++){if(els[j].scrollWidth>els[j].clientWidth+1)return false;}
    return true;
  }
  function fit(){
    var lo=6,hi=Math.max(12,Math.min(innerWidth*0.02,innerHeight*0.035));
    for(var n=0;n<14;n++){
      var mid=(lo+hi)/2;document.body.style.fontSize=mid+"px";
      if(fits())lo=mid;else hi=mid;
    }
    document.body.style.fontSize=lo+"px";
  }
  var rt;
  board.addEventListener("focusout",function(e){if(e.target.closest("[contenteditable]")){clearTimeout(rt);rt=setTimeout(fit,60);}});
  window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(fit,120);});
  fit();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
})();
