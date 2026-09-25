
var _pdfExported=false; /* 「PDF出力有無」記録用フラグ：printDirect()実行時にtrueになる */
var D={mar:'既婚',ch:0,par:'両方故人',si:0,deadSib:0,nephews:0,halfSib:0,gpar:'',deadCh:0,grandCh:0,done:[],worry:[],ar:{},
  sibTypes:{ani:0,otouto:0,ane:0,imouto:0},
  halfSibTypes:{hAni:0,hOtouto:0,hAne:0,hImouto:0},
  deadSibDetails:[]
};
/* ── 兄弟姉妹ヘルパー関数 ── */
function _sibInfo(){var st=D.sibTypes||{};var ht=D.halfSibTypes||{};return{ani:st.ani||0,otouto:st.otouto||0,ane:st.ane||0,imouto:st.imouto||0,hAni:ht.hAni||0,hOtouto:ht.hOtouto||0,hAne:ht.hAne||0,hImouto:ht.hImouto||0};}
function getTotalSib(){var s=_sibInfo();return s.ani+s.otouto+s.ane+s.imouto+s.hAni+s.hOtouto+s.hAne+s.hImouto;}
function getTotalHalfSib(){var s=_sibInfo();return s.hAni+s.hOtouto+s.hAne+s.hImouto;}
function getTotalDeadSib(){return(D.deadSibDetails||[]).length;}
function getTotalNephews(){return(D.deadSibDetails||[]).reduce(function(sum,d){return sum+(d.nephews||0);},0);}
function _syncLegacySibFields(){D.si=getTotalSib();D.halfSib=getTotalHalfSib();D.deadSib=getTotalDeadSib();D.nephews=getTotalNephews();}
function getSibList(){
  var s=_sibInfo();var list=[];
  var types=[
    {cnt:s.ani,pfx:'ani',base:'兄',half:false},
    {cnt:s.otouto,pfx:'otouto',base:'弟',half:false},
    {cnt:s.ane,pfx:'ane',base:'姉',half:false},
    {cnt:s.imouto,pfx:'imouto',base:'妹',half:false},
    {cnt:s.hAni,pfx:'hAni',base:'半血兄',half:true},
    {cnt:s.hOtouto,pfx:'hOtouto',base:'半血弟',half:true},
    {cnt:s.hAne,pfx:'hAne',base:'半血姉',half:true},
    {cnt:s.hImouto,pfx:'hImouto',base:'半血妹',half:true}
  ];
  types.forEach(function(t){for(var i=1;i<=t.cnt;i++){list.push({key:t.pfx+'_'+i,label:t.cnt>1?t.base+i:t.base,isHalf:t.half});}});
  return list;
}
function getSibLabel(key){var sl=getSibList();var f=sl.find(function(x){return x.key===key;});return f?f.label:key;}
function cnSibType(type,d){
  if(!D.sibTypes)D.sibTypes={ani:0,otouto:0,ane:0,imouto:0};
  D.sibTypes[type]=Math.max(0,(D.sibTypes[type]||0)+d);
  /* 半血数が全血を超えないよう調整 */
  _fixDeadSibDetails();_syncLegacySibFields();renderProxy();
}
function cnHalfSibType(type,d){
  if(!D.halfSibTypes)D.halfSibTypes={hAni:0,hOtouto:0,hAne:0,hImouto:0};
  D.halfSibTypes[type]=Math.max(0,(D.halfSibTypes[type]||0)+d);
  _fixDeadSibDetails();_syncLegacySibFields();renderProxy();
}
function _fixDeadSibDetails(){
  /* 削除された兄弟に対応するdeadSibDetailsエントリを除去 */
  var sl=getSibList();var keys=sl.map(function(x){return x.key;});
  D.deadSibDetails=(D.deadSibDetails||[]).filter(function(d){return keys.indexOf(d.sibKey)>-1;});
}
function toggleDeadSib(sibKey){
  var idx=(D.deadSibDetails||[]).findIndex(function(d){return d.sibKey===sibKey;});
  if(idx>-1){D.deadSibDetails.splice(idx,1);}else{D.deadSibDetails.push({sibKey:sibKey,nephews:0});}
  _syncLegacySibFields();renderProxy();
}
function cnDeadSibNephews(sibKey,d){
  var entry=(D.deadSibDetails||[]).find(function(x){return x.sibKey===sibKey;});
  if(entry){entry.nephews=Math.max(0,(entry.nephews||0)+d);}
  _syncLegacySibFields();renderProxy();
}
function renderSibTypeCounters(){
  var types=[{pfx:'ani',lbl:'兄（全血）'},{pfx:'otouto',lbl:'弟（全血）'},{pfx:'ane',lbl:'姉（全血）'},{pfx:'imouto',lbl:'妹（全血）'}];
  var st=D.sibTypes||{};var h='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  types.forEach(function(t){
    var v=st[t.pfx]||0;
    h+='<div style="background:var(--bg2);border:0.5px solid var(--border);border-radius:var(--r);padding:8px 10px">'
      +'<div style="font-size:12px;color:var(--text2);margin-bottom:5px">'+t.lbl+'</div>'
      +'<div class="nw"><button class="nb" onclick="cnSibType(\''+t.pfx+'\',-1)">−</button>'
      +'<span class="nv" id="sit-'+t.pfx+'-v">'+v+'</span>'
      +'<button class="nb" onclick="cnSibType(\''+t.pfx+'\',1)">＋</button>'
      +'<span style="font-size:12px;color:#555">人</span></div></div>';
  });
  h+='</div>';
  var el=document.getElementById('sib-type-cont');if(el)el.innerHTML=h;
}
function renderHalfSibTypeCounters(){
  var types=[{pfx:'hAni',lbl:'半血兄'},{pfx:'hOtouto',lbl:'半血弟'},{pfx:'hAne',lbl:'半血姉'},{pfx:'hImouto',lbl:'半血妹'}];
  var ht=D.halfSibTypes||{};var h='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">';
  types.forEach(function(t){
    var v=ht[t.pfx]||0;
    h+='<div style="background:#F3EFFF;border:0.5px solid #A08CDE;border-radius:var(--r);padding:8px 10px">'
      +'<div style="font-size:12px;color:#4A3080;margin-bottom:5px">'+t.lbl+'</div>'
      +'<div class="nw"><button class="nb" onclick="cnHalfSibType(\''+t.pfx+'\',-1)">−</button>'
      +'<span class="nv" id="hst-'+t.pfx+'-v">'+v+'</span>'
      +'<button class="nb" onclick="cnHalfSibType(\''+t.pfx+'\',1)">＋</button>'
      +'<span style="font-size:12px;color:#555">人</span></div></div>';
  });
  h+='</div>';
  return h;
}
var EN={};
/* ===== 事前指示書（ADV） ===== */
var ADV={place:'',placeFamily:'',placeOther:'',cpr:'',cprFamily:'',cprOther:'',injection:'',injectionFamily:'',injectionOther:'',nutrition:'',nutritionFamily:'',nutritionOther:'',blood:'',bloodFamily:'',bloodOther:'',organ:'',organPartial:'',organOther:'',body:'',bodyWishUniv:'',bodyWishContact:'',bodyReg:'',bodyRegContact:'',bodyOther:'',other:''};
var ADV_OPTS={
  place:['家で最期を迎えたい','病院で治療してください','判断は家族に任せます','判断は担当医師に任せます','その他'],
  cpr:['救急蘇生処置をしないでください','蘇生処置はしても人工呼吸器につながないでください','積極的に蘇生処置をしてください','判断は家族に任せます','判断は担当医師に任せます','その他'],
  injection:['食事の代わりの点滴（中心静脈栄養・高カロリー輸液）はしないでください','必要なら中心静脈栄養・高カロリー輸液をしてください','判断は家族に任せます','判断は担当医師に任せます','その他'],
  nutrition:['自分で食べられなくなっても胃管・胃瘻を作らないでください（そのために生きていけなくなってもかまいません）','栄養をとるために必要なら胃管を入れてください（胃瘻は作らないでください）','必要ならば胃管・胃瘻を作ってください','判断は家族に任せます','判断は担当医師に任せます','その他'],
  blood:['輸血はしないでください','必要なら輸血をしてください','判断は家族に任せます','判断は担当医師に任せます','その他'],
  organ:['臓器提供を希望します（全臓器）','臓器提供を希望します（一部のみ）','臓器提供を希望しません','意思表示カードに記載しています','判断は家族に任せます','その他'],
  body:['献体を希望します','献体を希望しません','既に献体登録済みです','判断は家族に任せます','その他']
};
function advRadio(sec){
  var opts=ADV_OPTS[sec];
  var container=document.getElementById('adv-'+sec+'-opts');
  if(!container)return;
  var cur=ADV[sec]||'';
  var html='';
  opts.forEach(function(o){
    var checked=(cur===o)?'checked':'';
    html+='<label class="adv-opt-row"><input type="radio" name="adv-'+sec+'" value="'+o+'" '+checked+' onchange="ADV[\''+sec+'\']=this.value;advShowSub(\''+sec+'\')"> '+o+'</label>';
  });
  container.innerHTML=html;
  advShowSub(sec);
}
function advShowSub(sec){
  var v=ADV[sec]||'';
  var fw=document.getElementById('adv-'+sec+'-family-wrap');
  var ow=document.getElementById('adv-'+sec+'-other-wrap');
  if(fw){
    var show=v==='判断は家族に任せます';
    fw.style.display=show?'block':'none';
    if(!show){ADV[sec+'Family']='';var fi=document.getElementById('adv-'+sec+'-family');if(fi)fi.value='';}
  }
  /* 臓器提供「一部のみ」専用欄 */
  if(sec==='organ'){
    var pw=document.getElementById('adv-organ-partial-wrap');
    if(pw){
      var showP=(v==='臓器提供を希望します（一部のみ）');
      pw.style.display=showP?'block':'none';
      if(!showP){ADV.organPartial='';var pi=document.getElementById('adv-organ-partial');if(pi)pi.value='';}
    }
  }
  /* 献体登録済み専用欄 */
  if(sec==='body'){
    var ww=document.getElementById('adv-body-wish-wrap');
    if(ww){
      var showW=(v==='献体を希望します');
      ww.style.display=showW?'block':'none';
      if(!showW){ADV.bodyWishUniv='';ADV.bodyWishContact='';var wu=document.getElementById('adv-body-wish-univ');if(wu)wu.value='';var wc=document.getElementById('adv-body-wish-contact');if(wc)wc.value='';}
    }
    var rw=document.getElementById('adv-body-reg-wrap');
    if(rw){
      var showR=(v==='既に献体登録済みです');
      rw.style.display=showR?'block':'none';
      if(!showR){ADV.bodyReg='';ADV.bodyRegContact='';var ui=document.getElementById('adv-body-reg-univ');if(ui)ui.value='';var ci=document.getElementById('adv-body-reg-contact');if(ci)ci.value='';}
    }
  }
  /* その他（全セクション共通） */
  if(ow){
    var show2=(v==='その他');
    ow.style.display=show2?'block':'none';
    if(!show2){ADV[sec+'Other']='';var oi=document.getElementById('adv-'+sec+'-other');if(oi)oi.value='';}
  }
}
function openADV(){/* パネルをステップ5に移行済み - 使用不可 */}
function closeADV(){/* パネルをステップ5に移行済み - 使用不可 */}
function printADV(){
  /* WL: sessionStorageから事務所情報を取得 */
  var _wl=(function(){try{return JSON.parse(sessionStorage.getItem('wl_office_data'))||{};}catch(e){return {};}})();
  var _wlName=_wl.name||'一般社団法人 相続手続士業の会';
  function escH(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}
  function advRow(label,sec){
    var v=ADV[sec]||'';
    var opts=ADV_OPTS[sec]||[];
    var rows='';
    if(!v){
      rows='<div style="font-size:12px;color:#aaa;font-style:italic">（未回答）</div>';
    } else {
      opts.forEach(function(o){
        var isSel=(v===o);
        var suffix='';
        if(isSel){
          if(o==='判断は家族に任せます'&&ADV[sec+'Family'])suffix=' （'+ADV[sec+'Family']+'）';
          else if(o==='その他'&&ADV[sec+'Other'])suffix='：'+ADV[sec+'Other'];
          else if(sec==='organ'&&o==='臓器提供を希望します（一部のみ）'&&ADV.organPartial)suffix=' （希望臓器：'+ADV.organPartial+'）';
          else if(sec==='body'&&o==='献体を希望します'){
            if(ADV.bodyWishUniv)suffix+=' （希望先：'+ADV.bodyWishUniv;
            if(ADV.bodyWishContact)suffix+=(ADV.bodyWishUniv?'　':' （')+'連絡先：'+ADV.bodyWishContact;
            if(ADV.bodyWishUniv||ADV.bodyWishContact)suffix+='）';
          }
          else if(sec==='body'&&o==='既に献体登録済みです'){
            if(ADV.bodyReg)suffix+=' （大学名：'+ADV.bodyReg;
            if(ADV.bodyRegContact)suffix+=(ADV.bodyReg?'　':' （')+'連絡先：'+ADV.bodyRegContact;
            if(ADV.bodyReg||ADV.bodyRegContact)suffix+='）';
          }
        }
        var rowBg=isSel?'background:#f0fbf5;':'';
        var markColor=isSel?'color:#1D9E75;font-size:15px':'color:#ccc;font-size:15px';
        var textStyle=isSel?'font-size:13px;font-weight:bold;color:#0a5c3d':'font-size:12px;color:#666';
        rows+='<div style="display:flex;align-items:flex-start;gap:8px;padding:4px 6px;border-radius:3px;'+rowBg+'">'
          +'<span style="'+markColor+';flex-shrink:0;line-height:1.4">'+(isSel?'☑':'☐')+'</span>'
          +'<span style="'+textStyle+';line-height:1.5">'+escH(o)+escH(suffix)+'</span>'
          +'</div>';
      });
    }
    return '<tr><td style="padding:8px 12px;font-size:13px;font-weight:bold;color:#444;white-space:nowrap;border-bottom:1px solid #eee;width:32%;vertical-align:top;background:#fafafa">'+label+'</td>'
      +'<td style="padding:6px 10px;border-bottom:1px solid #eee">'+rows+'</td></tr>';
  }
  var CSS='body{font-family:"Hiragino Kaku Gothic Pro","Meiryo",sans-serif;margin:0;padding:0;color:#222}@media print{@page{margin:20mm 15mm}}';
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>私の診療に関する希望書（事前指示書）</title><style>'+CSS+'</style></head><body>'
    +'<div style="max-width:700px;margin:0 auto;padding:32px 24px">'
    +'<h1 style="font-size:20px;font-weight:700;text-align:center;border-bottom:2px solid #1D9E75;padding-bottom:10px;margin-bottom:6px">私の診療に関する希望書（事前指示書）</h1>'
    +'<p style="font-size:12px;text-align:right;color:#888;margin:0 0 20px">'+escH(_wlName)+'</p>'
    +'<div style="font-size:12px;color:#444;line-height:1.8;background:#f8f8f8;border-left:4px solid #1D9E75;padding:14px 16px;margin-bottom:24px;border-radius:0 6px 6px 0">'
    +'私および私の家族（身元保証人含む）は、私の具合が悪くなり、死期が近く、このまま何も治療をしなければ救命することはできないが、治療しても私が希望する健康状態までの回復は期待できず、かつ自分で意思表示ができなくなったと判断されたときには、以下のように考えていただくようにお願いします。ただしここに書かれたことは現在私が考えていることであり、私の意思で今後変更することもあります。<br><br>'
    +'<strong>※ 予期しない突発的な事故の場合（例：交通事故・転倒で意識を失った・のどにものが詰まった等）は、ここに書かれた内容によらず、通常の医療をお願いします。</strong>'
    +'</div>'
    +'<table style="width:100%;border-collapse:collapse;border:1px solid #ddd;border-radius:6px;overflow:hidden;margin-bottom:24px">'
    +advRow('最期を迎える場所の希望','place')
    +advRow('心肺蘇生（CPR）','cpr')
    +advRow('注射（中心静脈栄養）','injection')
    +advRow('栄養（胃管・胃瘻）','nutrition')
    +advRow('輸血','blood')
    +advRow('臓器提供','organ')
    +advRow('献体','body')
    +'</table>'
    +(ADV.other?'<div style="margin-bottom:24px"><div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#1D9E75">その他の希望</div><div style="font-size:13px;line-height:1.8;border:1px solid #ddd;padding:10px 14px;border-radius:6px">'+escH(ADV.other)+'</div></div>':'')
    +'<div style="margin-top:48px;padding-top:20px;border-top:1px solid #ccc">'
    +'<table style="width:100%;border-collapse:collapse">'
    +'<tr>'
    +'<td style="font-size:13px;padding:6px 0;width:60%">令和&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</td>'
    +'<td style="font-size:13px;padding:6px 0">本人署名</td>'
    +'</tr>'
    +'<tr>'
    +'<td></td>'
    +'<td style="border-bottom:1px solid #888;height:60px;min-width:200px;position:relative">'
    +'<span style="position:absolute;right:8px;bottom:6px;font-size:11px;color:#888">（実印）</span>'
    +'</td>'
    +'</tr>'
    +'</table>'
    +'</div>'
    +'</div></body></html>';
  var w=window.open('','_blank','width=760,height=900');
  if(!w){alert('ポップアップがブロックされました。ポップアップを許可してから再度お試しください。');return;}
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(function(){w.print();},400);
}
var CT_DEFS=[
  {id:'denki',   label:'電気',                   type:'normal', coPh:'中部電力',          noLoc:true},
  {id:'gasu',    label:'ガス',                   type:'normal', coPh:'東邦ガス',           noLoc:true},
  {id:'suido',   label:'水道',                   type:'normal', coPh:'名古屋市・管理組合', noLoc:true},
  {id:'nhk',     label:'ＮＨＫ',                 type:'normal', noCo:true,                 noLoc:true},
  {id:'shinbun', label:'新聞',                   type:'normal', coPh:'〇〇販売店',         noLoc:true},
  {id:'milk',    label:'牛乳・配達弁当',         type:'normal', coPh:'〇〇販売店',         noLoc:true},
  {id:'teiki',   label:'定期購入物',             type:'normal', locLbl:'購入物', locPh:'雑誌・化粧品・健康食品', noLoc:true},
  {id:'ktTel',   label:'固定電話',               type:'normal', coPh:'NTT・KDDI等',       noLoc:true, numLbl:'自宅の電話番号', numPh:'0000-00-0000'},
  {id:'net',     label:'インターネット',         type:'normal', coPh:'ドコモ光・BIGLOBE等'},
  {id:'catv',    label:'ＣＡＴＶ・ＢＳ・ＣＳ', type:'normal', coPh:'J:COM・スターキャット等'},
  {id:'card',    label:'クレジットカード',       type:'card'},
  {id:'jaf',     label:'ＪＡＦ',                type:'normal', noCo:true, noLoc:true},
  {id:'rental',  label:'レンタル品',             type:'normal', locLbl:'レンタルしている物', locPh:'車イス・介護ベット等'},
  {id:'kaiken',  label:'会員権等',               type:'normal', coPh:'〇〇スポーツ倶楽部等', locLbl:'会員の種類', locPh:'スポーツクラブ・ゴルフ会員等'},
  {id:'amazon',  label:'Amazonプライム',        type:'subsc'},
  {id:'netflix', label:'Netflix',               type:'subsc'},
  {id:'disney',  label:'Disney+',               type:'subsc'},
  {id:'hulu',    label:'Hulu',                  type:'subsc'},
  {id:'unext',   label:'U-NEXT',                type:'subsc'},
  {id:'appletv', label:'Apple TV+',             type:'subsc'},
  {id:'youtube', label:'YouTube Premium',       type:'subsc'},
  {id:'sub1',    label:'その他サブスク①',       type:'normal', locLbl:'サブスクの種類', locPh:'VOD・音楽・漫画・食品・ファッション等'},
  {id:'sub2',    label:'その他サブスク②',       type:'normal', locLbl:'サブスクの種類', locPh:'VOD・音楽・漫画・食品・ファッション等'},
  {id:'menkyo',  label:'免許証',                type:'doc'},
  {id:'passport',label:'パスポート',            type:'doc'},
  {id:'mynum',   label:'マイナンバーカード',    type:'doc'},
  {id:'nenkin',  label:'年金手帳',              type:'doc'},
  {id:'hanko',   label:'印鑑手帳・カード',      type:'doc'},
  {id:'kenri',   label:'土地の登記済証（権利書）', type:'doc'},
  {id:'keiro',   label:'敬老パス',              type:'doc'}
];
var CT_GROUPS=[
  {label:'公共・生活インフラ', ids:['denki','gasu','suido','nhk','shinbun','milk','teiki']},
  {label:'通信',               ids:['ktTel','net','catv']},
  {label:'クレジットカード',   ids:['card']},
  {label:'サービス・その他',   ids:['jaf','rental','kaiken']},
  {label:'サブスクリプション', ids:['amazon','netflix','disney','hulu','unext','appletv','youtube','sub1','sub2']},
  {label:'書類・証明書',       ids:['menkyo','passport','mynum','nenkin','hanko','kenri','keiro']}
];
var CT_STATE={};
function ctDefaultEntry(id){
  if(id==='card')  return {co:'',brand:'',num:'',tel:'',cardUsage:'',cardUsageDetail:''};
  if(id==='hoken') return {memo:'',co:'',tel:'',hokenType:'',policyNo:'',benefName:'',benefTel:'',benefRel:''};
  if(id==='shoken') return {co:'',branch:'',tel:'',num:''};
  return {memo:'',co:'',tel:'',num:'',loc:''};
}
CT_DEFS.forEach(function(d){
  CT_STATE[d.id]=d.type==='doc'
    ?{active:false,loc:''}
    :{active:false,entries:[ctDefaultEntry(d.id)]};
});

function ctDef(id){return CT_DEFS.find(function(d){return d.id===id;});}
function ctToggle(id,val){CT_STATE[id].active=val;ctRender();}
function ctAddEntry(id){CT_STATE[id].entries.push(ctDefaultEntry(id));ctRender();}
function ctRemEntry(id,ei){
  var es=CT_STATE[id].entries;
  if(es.length<=1){es[0]=ctDefaultEntry(id);ctRender();return;}
  es.splice(ei,1);ctRender();
}

function ctNormalHTML(id){
  var e=CT_STATE[id].entries[0];
  var def=ctDef(id);
  var coLbl=def.coLbl||'会社名・機関名';
  var coPh=def.coPh?'例：'+def.coPh:'';
  var numLbl=def.numLbl||'お客様番号・ID等';
  var numPh=def.numPh||'';
  var locLbl=def.locLbl||'書類の保管場所';
  var locPh=def.locPh?'例：'+def.locPh:'例：自宅金庫';
  var html='<div class="ct-entry">';
  if(!def.noCo){
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:5px">'
      +'<div class="en-fw"><span class="en-lbl">'+coLbl+'</span><input type="text" value="'+esc2(e.co||'')+'" placeholder="'+coPh+'" oninput="CT_STATE[\''+id+'\'].entries[0].co=this.value"></div>'
      +'<div class="en-fw"><span class="en-lbl">連絡先（電話番号）</span><input type="text" value="'+esc2(e.tel||'')+'" placeholder="0120-000-000" oninput="CT_STATE[\''+id+'\'].entries[0].tel=this.value"></div>'
      +'</div>';
  }else{
    html+='<div class="mb-5">'
      +'<div class="en-fw"><span class="en-lbl">連絡先（電話番号）</span><input type="text" value="'+esc2(e.tel||'')+'" placeholder="0120-000-000" oninput="CT_STATE[\''+id+'\'].entries[0].tel=this.value"></div>'
      +'</div>';
  }
  html+='<div style="display:grid;grid-template-columns:'+(def.noLoc?'1fr':'1fr 1fr')+';gap:6px">'
    +'<div class="en-fw"><span class="en-lbl">'+numLbl+'</span><input type="text" value="'+esc2(e.num||'')+'" placeholder="'+numPh+'" oninput="CT_STATE[\''+id+'\'].entries[0].num=this.value"></div>';
  if(!def.noLoc){
    html+='<div class="en-fw"><span class="en-lbl">'+locLbl+'</span><input type="text" value="'+esc2(e.loc||'')+'" placeholder="'+locPh+'" oninput="CT_STATE[\''+id+'\'].entries[0].loc=this.value"></div>';
  }
  html+='</div></div>';
  return html;
}

function ctMultiEntryHTML(id,ei){
  var e=CT_STATE[id].entries[ei];
  var def=ctDef(id);
  var memoPh=id==='keitai'?'例：ドコモ':id==='card'?'例：楽天カード':id==='hoken'?'例：日本生命':'';
  var coLbl=def.coLbl||'会社名・機関名';
  var coPh=def.coPh?'例：'+def.coPh:'';
  var numLbl=def.numLbl||'お客様番号・ID等';
  var numPh=def.numPh||'';
  var locLbl=def.locLbl||'書類の保管場所';
  var locPh=def.locPh?'例：'+def.locPh:'例：自宅金庫';
  var html='<div class="ct-entry">'
    +'<div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:5px">'
    +'<div class="en-fw" style="flex:1"><span class="en-lbl">名称・メモ（'+memoPh+'）</span>'
    +'<input type="text" value="'+esc2(e.memo||'')+'" placeholder="'+memoPh+'" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].memo=this.value"></div>'
    +'<button class="delbtn mb-2" onclick="ctRemEntry(\''+id+'\','+ei+')">×</button>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:5px">'
    +'<div class="en-fw"><span class="en-lbl">'+coLbl+'</span><input type="text" value="'+esc2(e.co||'')+'" placeholder="'+coPh+'" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].co=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">連絡先（電話番号）</span><input type="text" value="'+esc2(e.tel||'')+'" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].tel=this.value"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:'+(def.noLoc?'1fr':'1fr 1fr')+';gap:6px">'
    +'<div class="en-fw"><span class="en-lbl">'+numLbl+'</span><input type="text" value="'+esc2(e.num||'')+'" placeholder="'+numPh+'" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].num=this.value"></div>';
  if(!def.noLoc){
    html+='<div class="en-fw"><span class="en-lbl">'+locLbl+'</span><input type="text" value="'+esc2(e.loc||'')+'" placeholder="'+locPh+'" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].loc=this.value"></div>';
  }
  html+='</div></div>';
  return html;
}
function ctCardEntryHTML(id,ei){
  var e=CT_STATE[id].entries[ei];
  var delBtn=CT_STATE[id].entries.length>1
    ?'<button class="delbtn mb-2" onclick="ctRemEntry(\''+id+'\','+ei+')">×</button>'
    :'';
  var usageOpts=['クレカ払いは使用していない','単発の買い物にだけ使用','定期的な支払いをクレカでしている'];
  var radioH=usageOpts.map(function(o){
    var sel=(e.cardUsage||'')=== o;
    return '<label class="rb'+(sel?' sel':'')+'" onclick="CT_STATE[\''+id+'\'].entries['+ei+'].cardUsage=\''+o+'\';ctRender()">'+o+'</label>';
  }).join('');
  var detailH=(e.cardUsage==='定期的な支払いをクレカでしている')
    ?'<div class="en-fw" style="margin-top:6px"><span class="en-lbl">定期支払いの内容</span><input type="text" value="'+esc2(e.cardUsageDetail||'')+'" placeholder="例：携帯代、家賃、光熱費、サブスクの利用料等" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].cardUsageDetail=this.value"></div>'
    :'';
  return '<div class="ct-entry">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="font-size:11px;font-weight:600;color:var(--text2)">カード '+(ei+1)+'</span>'+delBtn+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:5px">'
    +'<div class="en-fw"><span class="en-lbl">会社名（例：楽天カード・三井住友等）</span><input type="text" value="'+esc2(e.co||'')+'" placeholder="例：楽天カード" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].co=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">ブランド名（例：VISA・JCB等）</span><input type="text" value="'+esc2(e.brand||'')+'" placeholder="例：VISA" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].brand=this.value"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">'
    +'<div class="en-fw"><span class="en-lbl">カード下4桁</span><input type="text" value="'+esc2(e.num||'')+'" placeholder="例：1234" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].num=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">カード会社の連絡先</span><input type="text" value="'+esc2(e.tel||'')+'" placeholder="0120-000-000" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].tel=this.value"></div>'
    +'</div>'
    +'<div style="font-size:11.5px;font-weight:600;color:var(--text2);margin-bottom:5px">カード払いしている内容</div>'
    +'<div class="rg" style="flex-wrap:wrap;gap:4px;margin-bottom:4px">'+radioH+'</div>'
    +detailH
    +'</div>';
}
function ctHokenEntryHTML(id,ei){
  var e=CT_STATE[id].entries[ei];
  var delBtn=CT_STATE[id].entries.length>1
    ?'<button class="delbtn mb-2" onclick="ctRemEntry(\''+id+'\','+ei+')">×</button>'
    :'';
  return '<div class="ct-entry">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="font-size:11px;font-weight:600;color:var(--text2)">保険 '+(ei+1)+'</span>'+delBtn+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:5px">'
    +'<div class="en-fw"><span class="en-lbl">保険会社名</span><input type="text" value="'+esc2(e.memo||'')+'" placeholder="例：日本生命・アフラック等" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].memo=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">保険の種類</span><input type="text" value="'+esc2(e.hokenType||'')+'" placeholder="例：生命・医療・ガン・個人年金等" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].hokenType=this.value"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:5px">'
    +'<div class="en-fw"><span class="en-lbl">連絡先（電話番号）</span><input type="text" value="'+esc2(e.tel||'')+'" placeholder="0120-000-000" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].tel=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">保険証券番号</span><input type="text" value="'+esc2(e.policyNo||'')+'" placeholder="例：12-345-6789" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].policyNo=this.value"></div>'
    +'</div>'
    +'<div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:4px">受取人</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">'
    +'<div class="en-fw"><span class="en-lbl">氏名</span><input type="text" value="'+esc2(e.benefName||'')+'" placeholder="例：山田 花子" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].benefName=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">連絡先</span><input type="text" value="'+esc2(e.benefTel||'')+'" placeholder="090-0000-0000" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].benefTel=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">関係</span><input type="text" value="'+esc2(e.benefRel||'')+'" placeholder="例：長女・妻" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].benefRel=this.value"></div>'
    +'</div></div>';
}
function ctShokenEntryHTML(id,ei){
  var e=CT_STATE[id].entries[ei];
  var delBtn=CT_STATE[id].entries.length>1
    ?'<button class="delbtn mb-2" onclick="ctRemEntry(\''+id+'\','+ei+')">×</button>'
    :'';
  return '<div class="ct-entry">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="font-size:11px;font-weight:600;color:var(--text2)">口座 '+(ei+1)+'</span>'+delBtn+'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:5px">'
    +'<div class="en-fw"><span class="en-lbl">証券会社名</span><input type="text" value="'+esc2(e.co||'')+'" placeholder="例：野村証券・楽天証券" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].co=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">支店（取扱店）</span><input type="text" value="'+esc2(e.branch||'')+'" placeholder="例：名古屋支店・ネット" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].branch=this.value"></div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
    +'<div class="en-fw"><span class="en-lbl">連絡先（電話番号）</span><input type="text" value="'+esc2(e.tel||'')+'" placeholder="0120-000-000" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].tel=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">お客様番号・ID</span><input type="text" value="'+esc2(e.num||'')+'" oninput="CT_STATE[\''+id+'\'].entries['+ei+'].num=this.value"></div>'
    +'</div></div>';
}
function ctDocHTML(id){
  var st=CT_STATE[id];
  return '<div class="ct-entry">'
    +'<div class="en-fw"><span class="en-lbl">保管場所</span>'
    +'<input type="text" value="'+esc2(st.loc)+'" placeholder="例：自宅金庫、引き出し" oninput="CT_STATE[\''+id+'\'].loc=this.value"></div>'
    +'</div>';
}

function ctSubscHTML(id){
  var e=CT_STATE[id].entries[0];
  return '<div class="ct-entry">'
    +'<div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">ログイン情報</div>'
    +'<div class="en-fw mb-6"><span class="en-lbl">メールアドレス・携帯電話番号</span>'
    +'<input type="text" value="'+esc2(e.co||'')+'" placeholder="例：mail@example.com" oninput="CT_STATE[\''+id+'\'].entries[0].co=this.value"></div>'
    +'<div class="en-fw"><span class="en-lbl">普段の視聴状況</span>'
    +'<input type="text" value="'+esc2(e.loc||'')+'" placeholder="例：テレビ・PC・スマホ・タブレット" oninput="CT_STATE[\''+id+'\'].entries[0].loc=this.value"></div>'
    +'</div>';
}

function ctRender(){
  var cont=document.getElementById('ct-container');if(!cont)return;
  var html='';
  CT_GROUPS.forEach(function(grp){
    html+='<div class="ct-grp-hd">'+grp.label+'</div>';
    grp.ids.forEach(function(id){
      var def=ctDef(id),st=CT_STATE[id];
      var isActive=st.active;
      html+='<div class="ct-item">';
      html+='<div class="ct-item-hd'+(isActive?' active':'')+'">';
      html+='<span class="ct-lbl">'+def.label+'</span>';
      html+='<div style="display:flex;gap:4px">';
      html+='<label class="rb'+(isActive?' sel':'')+'" onclick="ctToggle(\''+id+'\',true)">あり</label>';
      html+='<label class="rb'+(!isActive?' sel':'')+'" onclick="ctToggle(\''+id+'\',false)">なし</label>';
      html+='</div></div>';
      if(isActive){
        html+='<div class="ct-item-body">';
        if(def.type==='doc'){
          html+=ctDocHTML(id);
        }else if(def.type==='card'){
          st.entries.forEach(function(e,ei){html+=ctCardEntryHTML(id,ei);});
          html+='<button class="addbtn" style="margin-top:4px" onclick="ctAddEntry(\''+id+'\')">＋ 追加</button>';
        }else if(def.type==='hoken'){
          st.entries.forEach(function(e,ei){html+=ctHokenEntryHTML(id,ei);});
          html+='<button class="addbtn" style="margin-top:4px" onclick="ctAddEntry(\''+id+'\')">＋ 追加</button>';
        }else if(def.type==='shoken'){
          st.entries.forEach(function(e,ei){html+=ctShokenEntryHTML(id,ei);});
          html+='<button class="addbtn" style="margin-top:4px" onclick="ctAddEntry(\''+id+'\')">＋ 追加</button>';
        }else if(def.type==='multi'){
          st.entries.forEach(function(e,ei){html+=ctMultiEntryHTML(id,ei);});
          html+='<button class="addbtn" style="margin-top:4px" onclick="ctAddEntry(\''+id+'\')">＋ 追加</button>';
        }else if(def.type==='subsc'){
          html+=ctSubscHTML(id);
        }else{
          html+=ctNormalHTML(id);
        }
        html+='</div>';
      }
      html+='</div>';
    });
  });
  cont.innerHTML=html;
}var DONE_OPTS=['遺言書（自筆）を作成済','遺言書（公正証書）を作成済','遺言書（法務局保管制度）を利用済','エンディングノートを作成済','任意後見契約を締結済','死後事務委任契約を締結済','家族信託を設定済','相続税対策（生前贈与等）を実施済','特に対策は何もしていない'];
var WORRY_OPTS=['遺産の行き先が心配','相続税が心配','認知症になった場合が心配','葬儀・納骨などの死後手続','身元保証人がいない','遺品整理をどうするか','子供や親戚に負担をかけたくない','特定の家族への手当てをしたい','借金を相続させたくない','兄妹へ財産を渡したくない','死後の手続で兄妹を頼りたくない','自分の死後のペットのこと'];
var NONE_DONE='特に対策は何もしていない';
var ASECS=[
  {id:'re',t:'不動産',c:'#1D9E75',debt:false,cols:[{k:'addr',l:'所在地',tp:'text',ph:'例：名古屋市中区…',w:'33%'},{k:'use',l:'用途',tp:'sel',opts:['自宅','収益物件','駐車場','その他'],w:'15%'},{k:'owner',l:'名義人',tp:'text',ph:'本人',w:'18%'},{k:'val',l:'評価額(円)',tp:'num',ph:'0',w:'18%',amt:true}]},
  {id:'bk',t:'預貯金',c:'#185FA5',debt:false,cols:[{k:'bank',l:'金融機関',tp:'text',ph:'例：三菱UFJ銀行',w:'24%'},{k:'br',l:'支店',tp:'text',ph:'名古屋支店',w:'19%'},{k:'ac',l:'種別',tp:'sel',opts:['普通預金','定期預金','当座','その他'],w:'15%'},{k:'no',l:'末尾4桁',tp:'text',ph:'****',w:'12%'},{k:'val',l:'残高(円)',tp:'num',ph:'0',w:'13%',amt:true}]},
  {id:'sc',t:'有価証券',c:'#534AB7',debt:false,cols:[{k:'co',l:'証券会社',tp:'text',ph:'例：野村証券',w:'28%'},{k:'br',l:'支店',tp:'text',ph:'名古屋支店',w:'22%'},{k:'tp',l:'種別',tp:'sel',opts:['株式','投資信託','債券','外貨建','その他'],w:'20%'},{k:'val',l:'評価額(円)',tp:'num',ph:'0',w:'20%',amt:true}]},
  {id:'ins',t:'生命保険・保険',c:'#BA7517',debt:false,cols:[{k:'co',l:'保険会社',tp:'text',ph:'例：日本生命',w:'24%'},{k:'tp',l:'種別',tp:'sel',opts:['生命保険','医療保険','個人年金','損害保険','その他'],w:'20%'},{k:'ben',l:'受取人',tp:'text',ph:'例：配偶者',w:'18%'},{k:'val',l:'保険金額(円)',tp:'num',ph:'0',w:'18%',amt:true}]},
  {id:'vc',t:'車両・動産',c:'#888780',debt:false,cols:[{k:'md',l:'車種・品名',tp:'text',ph:'例：トヨタ プリウス',w:'40%'},{k:'pl',l:'ナンバー',tp:'text',ph:'愛知300 あ1234',w:'28%'},{k:'val',l:'評価額(円)',tp:'num',ph:'0',w:'22%',amt:true}]},
  {id:'ot',t:'その他財産（貴金属・骨董等）',c:'#D4537E',debt:false,cols:[{k:'desc',l:'品目',tp:'text',ph:'例：金の延べ棒',w:'50%'},{k:'loc',l:'保管場所',tp:'text',ph:'例：自宅金庫',w:'26%'},{k:'val',l:'評価額(円)',tp:'num',ph:'0',w:'16%',amt:true}]},
  {id:'db',t:'負債・借入金',c:'#E24B4A',debt:true,cols:[{k:'tp',l:'種別',tp:'sel',opts:['住宅ローン','カードローン','消費者金融','事業借入','その他'],w:'22%'},{k:'cr',l:'借入先',tp:'text',ph:'例：三菱UFJ銀行',w:'26%'},{k:'pur',l:'目的',tp:'text',ph:'例：自宅購入',w:'22%'},{k:'val',l:'残債額(円)',tp:'num',ph:'0',w:'20%',amt:true}]}
];
ASECS.forEach(function(s){D.ar[s.id]=[blk(s)];});
function blk(s){var r={};s.cols.forEach(function(c){r[c.k]=c.tp==='sel'?c.opts[0]:''});return r;}
function acol(s){return s.cols.find(function(c){return c.amt;});}
function stot(sid){var s=ASECS.find(function(x){return x.id===sid;});var a=acol(s);if(!a)return 0;return D.ar[sid].reduce(function(sum,r){return sum+(parseFloat(r[a.k])||0);},0);}
function fmn(n){return n.toLocaleString()+'円';}
function upd(){
  var ta=0,td=0;
  ASECS.forEach(function(s){var t=stot(s.id);var el=document.getElementById('at-'+s.id);if(el)el.textContent=t>0?fmn(t):'';if(s.debt)td+=t;else ta+=t;});
  document.getElementById('sa').textContent=fmn(ta);document.getElementById('sd').textContent=fmn(td);
  var net=ta-td;var nel=document.getElementById('sn2');nel.textContent=fmn(net);nel.className='sumv '+(net>=0?'pos':'neg');
}
function renderAsecs(){
  var c=document.getElementById('asec-cont');c.innerHTML='';
  ASECS.forEach(function(s){
    var div=document.createElement('div');div.className='asec';
    div.innerHTML='<div class="ash" onclick="atog(\''+s.id+'\')">'
      +'<div class="asl"><div class="asd" style="background:'+s.c+'"></div><span class="ast">'+s.t+'</span></div>'
      +'<div class="asr"><span class="astot" id="at-'+s.id+'"></span><span id="atog-'+s.id+'">▾</span></div></div>'
      +'<div class="asb" id="ab-'+s.id+'"><table class="atbl"><thead><tr>'
      +s.cols.map(function(c){return '<th style="width:'+c.w+'">'+c.l+'</th>';}).join('')
      +'<th style="width:26px"></th></tr></thead><tbody id="atb-'+s.id+'"></tbody></table>'
      +'<button class="addbtn" onclick="aAdd(\''+s.id+'\')">＋ 行を追加</button></div>';
    c.appendChild(div);aRows(s.id);
  });upd();
}
function atog(sid){var b=document.getElementById('ab-'+sid);var t=document.getElementById('atog-'+sid);var h=b.style.display==='none';b.style.display=h?'':'none';t.textContent=h?'▾':'▸';}
function aRows(sid){
  var s=ASECS.find(function(x){return x.id===sid;});
  var tb=document.getElementById('atb-'+sid);tb.innerHTML='';
  D.ar[sid].forEach(function(row,ri){
    var tr=document.createElement('tr');
    s.cols.forEach(function(col){
      var td=document.createElement('td');
      if(col.tp==='sel'){var sel=document.createElement('select');col.opts.forEach(function(o){var op=document.createElement('option');op.value=o;op.textContent=o;if(row[col.k]===o)op.selected=true;sel.appendChild(op);});sel.onchange=(function(si,ri2,k){return function(e){D.ar[si][ri2][k]=e.target.value;upd();}})(sid,ri,col.k);td.appendChild(sel);}
      else{var inp=document.createElement('input');inp.type=col.tp==='num'?'number':col.tp;inp.value=row[col.k]||'';if(col.ph)inp.placeholder=col.ph;if(col.tp==='num'){inp.min='0';inp.style.textAlign='right';}inp.oninput=(function(si,ri2,k){return function(e){D.ar[si][ri2][k]=e.target.value;upd();}})(sid,ri,col.k);td.appendChild(inp);}
      tr.appendChild(td);
    });
    var dtd=document.createElement('td');var db=document.createElement('button');db.className='delbtn';db.textContent='×';db.onclick=(function(si,ri2){return function(){aRm(si,ri2);};})(sid,ri);dtd.appendChild(db);tr.appendChild(dtd);tb.appendChild(tr);
  });
}
function aAdd(sid){var s=ASECS.find(function(x){return x.id===sid;});D.ar[sid].push(blk(s));aRows(sid);upd();}
function aRm(sid,ri){var s=ASECS.find(function(x){return x.id===sid;});if(D.ar[sid].length<=1)D.ar[sid][0]=blk(s);else D.ar[sid].splice(ri,1);aRows(sid);upd();}
function rRadio(id,opts,key,cb){var el=document.getElementById(id);if(!el)return;el.innerHTML='';opts.forEach(function(o){var b=document.createElement('label');b.className='rb'+(D[key]===o?' sel':'');b.innerHTML='<input type="radio">'+o;b.onclick=function(){D[key]=o;rRadio(id,opts,key,cb);if(cb)cb();};el.appendChild(b);});}
function rRadioEN(id,opts,key,cb){var el=document.getElementById(id);if(!el)return;el.innerHTML='';opts.forEach(function(o){var cur=EN[key]||opts[0];var b=document.createElement('label');b.className='rb'+(cur===o?' sel':'');b.innerHTML='<input type="radio">'+o;b.onclick=function(){EN[key]=o;rRadioEN(id,opts,key,cb);if(cb)cb();};el.appendChild(b);});}
function rChecksDone(){var el=document.getElementById('done-list');if(!el)return;el.innerHTML='';DONE_OPTS.forEach(function(o){var sel=D.done.indexOf(o)>-1;var isN=o===NONE_DONE;var b=document.createElement('div');b.className='cb'+(sel?(isN?' none-sel':' sel'):'');b.innerHTML='<div class="ci">'+(sel?'✓':'')+'</div><span>'+o+'</span>';b.onclick=function(){if(o===NONE_DONE){D.done=sel?[]:[NONE_DONE];}else{var ni=D.done.indexOf(NONE_DONE);if(ni>-1)D.done.splice(ni,1);var i=D.done.indexOf(o);if(i>-1)D.done.splice(i,1);else D.done.push(o);}rChecksDone();};el.appendChild(b);});}
function rChecks(id,key,opts){var el=document.getElementById(id);if(!el)return;el.innerHTML='';opts.forEach(function(o){var sel=D[key].indexOf(o)>-1;var b=document.createElement('div');b.className='cb'+(sel?' sel':'');b.innerHTML='<div class="ci">'+(sel?'✓':'')+'</div><span>'+o+'</span>';b.onclick=function(){var i=D[key].indexOf(o);if(i>-1)D[key].splice(i,1);else D[key].push(o);rChecks(id,key,opts);};el.appendChild(b);});}
function cn(key,d){
  D[key]=Math.max(0,(D[key]||0)+d);
  var el=document.getElementById(key+'-v');if(el)el.textContent=D[key];
  if(key==='ch'){if((D.deadCh||0)>D.ch)D.deadCh=D.ch;renderProxy();renderGpar();}
}
function cnDeadCh(d){D.deadCh=Math.max(0,Math.min(D.ch,(D.deadCh||0)+d));if(!D.deadCh)D.grandCh=0;renderProxy();}
function cnGrandCh(d){D.grandCh=Math.max(0,(D.grandCh||0)+d);renderProxy();}
function shouldProxy(){return D.mar!=='既婚'&&D.ch===0&&D.par==='両方故人'&&getTotalSib()>0;}
function renderGpar(){
  var el=document.getElementById('gpar-sec');if(!el)return;
  /* 子が相続人になる場合は祖父母確認不要 */
  if(D.ch>0||D.par!=='両方故人'){el.innerHTML='';D.gpar='';return;}
  var opts=['祖父存命','祖母存命','祖父母共に存命','祖父母共に故人'];
  var h='<div class="dv"></div>'
    +'<div style="background:#FFF8E1;border:0.5px solid #FFD54F;border-radius:8px;padding:12px">'
    +'<div style="font-size:13px;font-weight:600;color:#7A5200;margin-bottom:4px">祖父母の状況</div>'
    +'<div style="font-size:12px;color:#5A3B00;margin-bottom:10px;line-height:1.6">ご両親が既に他界されている場合、<strong>存命の祖父母（直系尊属）</strong>が相続人になる場合があります。</div>'
    +'<div class="fg"><span class="fl fl--sm">祖父母の生存状況</span><div class="rg">';
  opts.forEach(function(o){
    h+='<label class="rb'+(D.gpar===o?' sel':'')+'" onclick="D.gpar=\''+o+'\';renderGpar()">'+o+'</label>';
  });
  h+='</div></div></div>';
  el.innerHTML=h;
}
function renderProxy(){
  var el=document.getElementById('proxy-sec');if(!el)return;
  /* sibling counters UI refresh */
  renderSibTypeCounters();
  var h='';

  /* 子が相続人になる場合：兄弟姉妹関連チェックは不要。代わりに死亡した子の孫代襲確認のみ表示 */
  if(D.ch>0){
    var maxDeadCh=D.ch;
    if((D.deadCh||0)>maxDeadCh)D.deadCh=maxDeadCh;
    var dc=D.deadCh||0,gc=D.grandCh||0;
    h+='<div class="dv"></div>'
      +'<div style="background:#E1F5EE;border:0.5px solid #5DCAA5;border-radius:8px;padding:12px">'
      +'<div style="font-size:13px;font-weight:600;color:#0F6E56;margin-bottom:4px">代襲相続の確認（お子さんの代襲）</div>'
      +'<div style="font-size:12px;color:#085041;margin-bottom:10px;line-height:1.6">先に亡くなっているお子さんがいる場合、そのお子さんの子（お孫さん）が代わりに相続します（代襲相続）。</div>'
      +'<div class="fg"><span class="fl fl--sm">先に亡くなっているお子さんの人数</span>'
      +'<div class="nw"><button class="nb" onclick="cnDeadCh(-1)">−</button><span class="nv" id="dch-v">'+dc+'</span><button class="nb" onclick="cnDeadCh(1)">＋</button><span style="font-size:13px;color:#555">人</span></div></div>';
    if(dc>0){
      h+='<div class="fg" style="margin-top:8px"><span class="fl fl--sm">代襲相続人となるお孫さんの合計人数</span>'
        +'<div class="nw"><button class="nb" onclick="cnGrandCh(-1)">−</button><span class="nv" id="gch-v">'+gc+'</span><button class="nb" onclick="cnGrandCh(1)">＋</button><span style="font-size:13px;color:#555">人</span></div></div>';
    }
    h+='</div>';
    el.innerHTML=h;
    return;
  }

  /* ── 子なしの場合：半血の兄弟姉妹（兄弟が1人以上いれば表示） ── */
  var totalSib=getTotalSib();
  if(totalSib>0){
    h+='<div class="dv"></div>'
      +'<div style="background:#F3EFFF;border:0.5px solid #A08CDE;border-radius:8px;padding:12px">'
      +'<div style="font-size:13px;font-weight:600;color:#4A3080;margin-bottom:4px">半血の兄弟姉妹の確認</div>'
      +'<div style="font-size:12px;color:#3A2060;margin-bottom:10px;line-height:1.6">両親の一方だけが同じ兄弟姉妹（異父・異母）がいる場合、その方の法定相続分は全血の兄弟姉妹の<strong>½（半分）</strong>になります（民法900条4号）。続柄別に人数を入力してください。</div>'
      + renderHalfSibTypeCounters()
      +'</div>';
  }

  /* ── 代襲相続（配偶者・子・親なし＋兄弟あり の場合のみ） ── */
  if(!shouldProxy()){el.innerHTML=h;return;}

  var allSibs=getSibList();
  var deadDetails=D.deadSibDetails||[];
  var deadKeys=deadDetails.map(function(d){return d.sibKey;});

  h+='<div class="dv"></div>'
    +'<div style="background:#E1F5EE;border:0.5px solid #5DCAA5;border-radius:8px;padding:12px">'
    +'<div style="font-size:13px;font-weight:600;color:#0F6E56;margin-bottom:4px">代襲相続の確認</div>'
    +'<div style="font-size:12px;color:#085041;margin-bottom:10px;line-height:1.6">先に亡くなっている兄弟姉妹がいるときは、その子（甥・姪）が代わりに相続します（代襲相続）。該当する兄弟姉妹を選択してください。</div>';

  if(allSibs.length>0){
    h+='<div class="fg"><span class="fl fl--sm">先に亡くなっている兄弟姉妹を選択（複数選択可）</span>'
      +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">';
    allSibs.forEach(function(sib){
      var isDead=deadKeys.indexOf(sib.key)>-1;
      h+='<label class="rb'+(isDead?' sel':'')+'" style="cursor:pointer" onclick="toggleDeadSib(\''+sib.key+'\')">'
        +(isDead?'✓ ':'')+(sib.isHalf?'<span style="font-size:10px;color:#7D6CC8">半血</span> ':'')+sib.label
        +'</label>';
    });
    h+='</div></div>';

    /* 各亡兄弟の甥・姪人数入力 */
    if(deadDetails.length>0){
      h+='<div class="dv" style="margin:8px 0"></div>';
      h+='<div style="font-size:12px;font-weight:600;color:#0F6E56;margin-bottom:8px">各兄弟姉妹の甥・姪の人数</div>';
      deadDetails.forEach(function(entry){
        var lbl=getSibLabel(entry.sibKey);
        var ne=entry.nephews||0;
        h+='<div style="background:#f5fffa;border:0.5px solid #9FE1CB;border-radius:var(--r);padding:7px 10px;margin-bottom:6px;display:flex;align-items:center;gap:12px">'
          +'<span style="font-size:12px;font-weight:600;color:#0F6E56;min-width:60px">'+lbl+'の子</span>'
          +'<div class="nw"><button class="nb" onclick="cnDeadSibNephews(\''+entry.sibKey+'\',-1)">−</button>'
          +'<span class="nv" style="font-size:14px">'+ne+'</span>'
          +'<button class="nb" onclick="cnDeadSibNephews(\''+entry.sibKey+'\',1)">＋</button>'
          +'<span style="font-size:12px;color:#555">人（甥・姪）</span></div></div>';
      });
    }
  }else{
    h+='<div style="font-size:12px;color:#888">兄弟姉妹を登録してください。</div>';
  }
  h+='</div>';
  el.innerHTML=h;
}
function buildHeirSVG(){
  var NW=52,NH=26,NR=4,HG=14,VG=72,MG=28,PAD=24,LBL=26;
  var sp=D.mar==='既婚';var nk=D.ch;
  var parB=D.par==='両方存命',parO=D.par==='一方存命';var np=parB?2:parO?1:0;
  var gparAlive=D.par==='両方故人'&&D.gpar&&D.gpar!=='祖父母共に故人';
  var gparBoth=gparAlive&&D.gpar==='祖父母共に存命';
  var gparLabel=D.gpar==='祖父存命'?'祖父':D.gpar==='祖母存命'?'祖母':'祖父母';
  if(gparAlive)np=gparBoth?2:1;
  var ns=getTotalSib(),nd=getTotalDeadSib(),nn=getTotalNephews(),nl=ns-nd;
  /* ★修正1: denには「全兄弟の半血総数」（死亡含む）を使う */
  var nHalfSibAll=getTotalHalfSib();
  var nHalfSib=nHalfSibAll; /* SVG内のden計算用 */
  var nDeadCh=Math.min(D.deadCh||0,nk); /* 先に亡くなった子 */
  var nGrandCh=D.grandCh||0; /* 代襲する孫の数 */
  var nLiveCh=nk-nDeadCh; /* 生存している子 */
  /* 名前付き兄弟リスト */
  var _allSibList=getSibList();
  var _deadSibDetails=D.deadSibDetails||[];
  var _deadSibKeys=_deadSibDetails.map(function(d){return d.sibKey;});
  var _livingSibs=_allSibList.filter(function(s){return _deadSibKeys.indexOf(s.key)<0;});
  var _deadSibsWithData=_deadSibDetails.filter(function(d){return d.nephews>0||true;}).map(function(d){
    return {key:d.sibKey,label:getSibLabel(d.sibKey),nephews:d.nephews||0,isHalf:(_allSibList.find(function(s){return s.key===d.sibKey;})||{}).isHalf||false};
  });
  var p=[],W=300,H=160,note='';
  function gcd2(a,b){return b?gcd2(b,a%b):a;}
  function fr(n,d){if(!n||!d)return '';var g=gcd2(Math.abs(n),Math.abs(d));var n2=Math.round(n/g),d2=Math.round(d/g);return d2===1?'(全部)':'('+n2+'/'+d2+')';}
  function bx(cx,cy,lbl,sh,typ){
    var bg=typ==='self'?'#185FA5':typ==='dead'?'#B4B2A9':typ==='half'?'#7D6CC8':'#1D9E75';var tc=typ==='dead'?'#444':'white';
    var s='<rect x="'+(cx-NW/2)+'" y="'+(cy-NH/2)+'" width="'+NW+'" height="'+NH+'" rx="'+NR+'" fill="'+bg+'"/>';
    s+='<text x="'+cx+'" y="'+(cy+4)+'" text-anchor="middle" font-size="10" font-weight="500" fill="'+tc+'">'+lbl+'</text>';
    if(sh)s+='<text x="'+cx+'" y="'+(cy+NH/2+LBL*0.6)+'" text-anchor="middle" font-size="10" fill="#0F6E56">'+sh+'</text>';
    return s;
  }
  function ln(x1,y1,x2,y2,c,w,da){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(c||'#555')+'" stroke-width="'+(w||1.5)+'"'+(da?' stroke-dasharray="'+da+'"':'')+' stroke-linecap="round"/>';}
  function dbl(cx1,cx2,cy){return ln(cx1+NW/2,cy-2.5,cx2-NW/2,cy-2.5,'#444',1)+ln(cx1+NW/2,cy+2.5,cx2-NW/2,cy+2.5,'#444',1);}
  /* ★修正3: 被代襲者の相続分(sibNum/sibDen)を受け取り、甥姪1人分を正確に表示 */
  function subTNamed(dsCX,ry1,ryN,nephews,sibNum,sibDen){
    var NNS=Math.min(nephews,6),nTW=NNS*NW+(NNS-1)*HG,nSt=dsCX-nTW/2+NW/2,nbky=ryN-NH/2-14;
    if(NNS===0)return;
    p.push(ln(dsCX,ry1+NH/2,dsCX,nbky));if(NNS>1)p.push(ln(nSt,nbky,nSt+(NNS-1)*(NW+HG),nbky));
    for(var ni=0;ni<NNS;ni++){
      var nc=nSt+ni*(NW+HG);
      p.push(ln(nc,nbky,nc,ryN-NH/2));
      /* 甥姪1人の取り分 = 被代襲者の取り分 ÷ 甥姪人数 */
      var nepFr=fr(sibNum, sibDen*nephews);
      p.push(bx(nc,ryN,nephews===1?'甥・姪':'甥姪'+(ni+1),nepFr,'heir'));
    }
    if(nephews>NNS)p.push('<text x="'+(nSt+NNS*(NW+HG))+'" y="'+(ryN+4)+'" font-size="10" fill="#888">他'+(nephews-NNS)+'人</text>');
  }
  function subT(dsCX,ry1,ryN){
    /* 旧API互換（呼ばれることはないが念のため残す） */
    var sw=2,sd=Math.max(ns,1);subTNamed(dsCX,ry1,ryN,nn,sw,sd);
  }
  /* ★修正2用ヘルパー: 被代襲者の全血/半血重みを返す */
  function svgSibWeight(sibKey){
    var sib=_allSibList.find(function(s){return s.key===sibKey;});
    return (sib&&sib.isHalf)?1:2;
  }
  if(sp&&nk>0){
    /* 表示する子ボックス数: 生存 + 亡（最大合計5個）*/
    var showLive=Math.min(nLiveCh,4),showDead=Math.min(nDeadCh,4-showLive>0?4-showLive:0);
    var NK=showLive+showDead;if(NK===0)NK=1;
    var chW=NK*NW+(NK-1)*HG;W=Math.max(chW,NW+MG+NW)+2*PAD;var cx=W/2;
    /* 孫がいる場合は高さを拡張 */
    var hasGrand=nDeadCh>0&&nGrandCh>0;
    var ry1=PAD+NH/2,ry2=ry1+VG,bky=ry2-NH/2-16;
    H=ry2+NH/2+LBL+PAD+14+(hasGrand?VG+NH/2+LBL:0);
    var sCX=cx-(MG/2+NW/2),spCX=cx+(MG/2+NW/2);
    p.push(bx(sCX,ry1,'本人','','self'));p.push(bx(spCX,ry1,'配偶者',fr(1,2),'heir'));p.push(dbl(sCX,spCX,ry1));p.push(ln(cx,ry1+NH/2,cx,bky));
    var cs=cx-chW/2+NW/2;
    /* 生存している子 */
    for(var i=0;i<showLive;i++){var cc=cs+i*(NW+HG);p.push(bx(cc,ry2,nLiveCh===1&&nDeadCh===0?'子':'子'+(i+1),fr(1,2*nk),'heir'));p.push(ln(cc,bky,cc,ry2-NH/2));}
    /* 亡くなった子 */
    for(var i=0;i<showDead;i++){var cc=cs+(showLive+i)*(NW+HG);p.push(ln(cc,bky,cc,ry2-NH/2,'#888',1,'4,3'));p.push(bx(cc,ry2,nDeadCh===1?'亡子':'亡子'+(i+1),'','dead'));}
    if(NK>1)p.push(ln(cs,bky,cs+(NK-1)*(NW+HG),bky));
    if(nLiveCh>showLive)p.push('<text x="'+(cs+NK*(NW+HG))+'" y="'+(ry2+4)+'" font-size="10" fill="#888">他'+(nLiveCh-showLive)+'人</text>');
    /* 孫（代襲）: 亡子ボックスの下に展開 */
    if(hasGrand){
      var dsCX=cs+(showLive)*(NW+HG); /* 最初の亡子の中心X */
      var NG=Math.min(nGrandCh,4),gTW=NG*NW+(NG-1)*HG,gSt=dsCX-gTW/2+NW/2,gbky=ry2+NH/2+14;
      p.push(ln(dsCX,ry2+NH/2,dsCX,gbky));
      if(NG>1)p.push(ln(gSt,gbky,gSt+(NG-1)*(NW+HG),gbky));
      for(var gi=0;gi<NG;gi++){var gc=gSt+gi*(NW+HG);p.push(ln(gc,gbky,gc,ry2+VG-NH/2));p.push(bx(gc,ry2+VG,nGrandCh===1?'孫':'孫'+(gi+1),fr(1,2*nk*nGrandCh),'heir'));}
      if(nGrandCh>NG)p.push('<text x="'+(gSt+NG*(NW+HG))+'" y="'+(ry2+VG+4)+'" font-size="10" fill="#888">他'+(nGrandCh-NG)+'人</text>');
    }
    var noteBase=nk>1?'各'+fr(1,2*nk):'全部';
    note='配偶者'+fr(1,2)+'　子'+nk+'人で'+fr(1,2)+'を分割 各'+fr(1,2*nk)+(nDeadCh>0&&nGrandCh>0?' 亡子の代わりに孫'+nGrandCh+'人が代襲':'');
  } else if(sp&&nk===0&&np>0){
    var twoAscB=parB||gparBoth;
    var ph=twoAscB?(NW+HG/2):NW/2,sCXB=PAD+ph,spCXB=sCXB+NW+MG;W=Math.max(spCXB+NW/2+PAD,sCXB*2+PAD);if(W<240)W=240;
    var ry1B=PAD+NH/2,ry2B=ry1B+VG;H=ry2B+NH/2+LBL+PAD+14;
    if(parB){p.push(bx(sCXB-NW/2-HG/2,ry1B,'父',fr(1,6),'heir'));p.push(bx(sCXB+NW/2+HG/2,ry1B,'母',fr(1,6),'heir'));p.push(ln(sCXB-HG/2,ry1B,sCXB+HG/2,ry1B));}
    else if(gparBoth){p.push(bx(sCXB-NW/2-HG/2,ry1B,'祖父',fr(1,6),'heir'));p.push(bx(sCXB+NW/2+HG/2,ry1B,'祖母',fr(1,6),'heir'));p.push(ln(sCXB-HG/2,ry1B,sCXB+HG/2,ry1B));}
    else p.push(bx(sCXB,ry1B,gparAlive?gparLabel:'親',fr(1,3),'heir'));
    p.push(ln(sCXB,ry1B+NH/2,sCXB,ry2B-NH/2));p.push(bx(sCXB,ry2B,'本人','','self'));p.push(bx(spCXB,ry2B,'配偶者',fr(2,3),'heir'));p.push(dbl(sCXB,spCXB,ry2B));
    note='配偶者'+fr(2,3)+'　直系尊属'+fr(1,3)+(parB?'（父母各'+fr(1,6)+'）':gparBoth?'（祖父・祖母 各'+fr(1,6)+'）':gparAlive?'（'+gparLabel+'）':'');
  } else if(sp&&nk===0&&np===0&&ns>0&&(nl>0||(nd>0&&nn>0))){
    /* ── 配偶者あり＋兄弟姉妹 ── 動的列幅レイアウト */
    var showLivSibs=_livingSibs.slice(0,6);
    var showDeadSibs=_deadSibsWithData.filter(function(d){return d.nephews>0;}).slice(0,6);
    var hasNephews=showDeadSibs.length>0&&nn>0;
    var gap=36,MAX_NEP=6;
    var denC=2*ns-nHalfSib;
    /* 各兄弟の列幅を計算 */
    var sibCols=[];
    showLivSibs.forEach(function(s){sibCols.push({type:'live',sib:s,colW:NW});});
    showDeadSibs.forEach(function(ds){
      var nShow=Math.min(ds.nephews,MAX_NEP);
      var nephW=nShow>0?nShow*NW+(nShow-1)*HG:NW;
      sibCols.push({type:'dead',sib:ds,colW:Math.max(NW,nephW),nephShow:nShow});
    });
    /* X座標を計算（各列の中心） */
    var sCXC=PAD+NW/2,spCXC=sCXC+NW+MG;
    var sibStartX=spCXC+NW/2+gap;
    var curX=sibStartX;
    sibCols.forEach(function(col,i){
      col.cx=curX+col.colW/2;
      curX+=col.colW+(i<sibCols.length-1?HG:0);
    });
    var lastSibX=sibCols.length>0?sibCols[sibCols.length-1].cx:sibStartX;
    var totalRightEdge=curX;
    var bkyC=PAD+16,ry1C=bkyC+26;
    W=Math.max(totalRightEdge+PAD,spCXC+NW/2+PAD);if(W<320)W=320;
    H=ry1C+NH/2+LBL+PAD+14;if(hasNephews)H+=VG+NH/2+LBL;
    /* 横線 */
    p.push(ln(sCXC,bkyC,lastSibX,bkyC,'#888',1));
    p.push(ln(sCXC,bkyC,sCXC,ry1C-NH/2,'#555',1.5));
    p.push(bx(sCXC,ry1C,'本人','','self'));p.push(bx(spCXC,ry1C,'配偶者',fr(3,4),'heir'));p.push(dbl(sCXC,spCXC,ry1C));
    /* 各兄弟を描画 */
    sibCols.forEach(function(col){
      if(col.type==='live'){
        p.push(ln(col.cx,bkyC,col.cx,ry1C-NH/2,'#555',1.5));
        p.push(bx(col.cx,ry1C,col.sib.label,fr(col.sib.isHalf?1:2,4*denC),col.sib.isHalf?'half':'heir'));
      }else{
        p.push(ln(col.cx,bkyC,col.cx,ry1C-NH/2,'#888',1,'4,3'));
        p.push(bx(col.cx,ry1C,'亡'+col.sib.label,'','dead'));
        if(col.sib.nephews>0){
          var sw=svgSibWeight(col.sib.key);
          subTNamed(col.cx,ry1C,ry1C+VG,col.sib.nephews,sw,4*denC);
        }
      }
    });
    if(_livingSibs.length>6)p.push('<text x="'+(totalRightEdge+8)+'" y="'+(ry1C+4)+'" font-size="10" fill="#888">他'+(_livingSibs.length-6)+'人</text>');
    note='配偶者'+fr(3,4)+'　兄弟姉妹で'+fr(1,4)+'を分割'+(nHalfSib>0?' ※半血は全血の½':'')+'　※遺留分なし';
  } else if(!sp&&nk>0){
    var showLiveD=Math.min(nLiveCh,4),showDeadD=Math.min(nDeadCh,4-showLiveD>0?4-showLiveD:0);
    var NKD=showLiveD+showDeadD;if(NKD===0)NKD=1;
    var chWD=NKD*NW+(NKD-1)*HG;W=Math.max(chWD,NW)+2*PAD;var cxD=W/2;
    var hasGrandD=nDeadCh>0&&nGrandCh>0;
    var ry1D=PAD+NH/2,ry2D=ry1D+VG,bkyD=ry2D-NH/2-16;
    H=ry2D+NH/2+LBL+PAD+14+(hasGrandD?VG+NH/2+LBL:0);
    p.push(bx(cxD,ry1D,'本人','','self'));p.push(ln(cxD,ry1D+NH/2,cxD,bkyD));
    var csD=cxD-chWD/2+NW/2;
    /* 生存している子 */
    for(var iD=0;iD<showLiveD;iD++){var ccD=csD+iD*(NW+HG);p.push(bx(ccD,ry2D,nLiveCh===1&&nDeadCh===0?'子':'子'+(iD+1),fr(1,nk),'heir'));p.push(ln(ccD,bkyD,ccD,ry2D-NH/2));}
    /* 亡くなった子 */
    for(var iD=0;iD<showDeadD;iD++){var ccD=csD+(showLiveD+iD)*(NW+HG);p.push(ln(ccD,bkyD,ccD,ry2D-NH/2,'#888',1,'4,3'));p.push(bx(ccD,ry2D,nDeadCh===1?'亡子':'亡子'+(iD+1),'','dead'));}
    if(NKD>1)p.push(ln(csD,bkyD,csD+(NKD-1)*(NW+HG),bkyD));
    if(nLiveCh>showLiveD)p.push('<text x="'+(csD+NKD*(NW+HG))+'" y="'+(ry2D+4)+'" font-size="10" fill="#888">他'+(nLiveCh-showLiveD)+'人</text>');
    /* 孫（代襲） */
    if(hasGrandD){
      var dsCXD=csD+(showLiveD)*(NW+HG);
      var NGD=Math.min(nGrandCh,4),gTWD=NGD*NW+(NGD-1)*HG,gStD=dsCXD-gTWD/2+NW/2,gbkyD=ry2D+NH/2+14;
      p.push(ln(dsCXD,ry2D+NH/2,dsCXD,gbkyD));
      if(NGD>1)p.push(ln(gStD,gbkyD,gStD+(NGD-1)*(NW+HG),gbkyD));
      for(var giD=0;giD<NGD;giD++){var gcD=gStD+giD*(NW+HG);p.push(ln(gcD,gbkyD,gcD,ry2D+VG-NH/2));p.push(bx(gcD,ry2D+VG,nGrandCh===1?'孫':'孫'+(giD+1),fr(1,nk*nGrandCh),'heir'));}
      if(nGrandCh>NGD)p.push('<text x="'+(gStD+NGD*(NW+HG))+'" y="'+(ry2D+VG+4)+'" font-size="10" fill="#888">他'+(nGrandCh-NGD)+'人</text>');
    }
    note='子'+nk+'人で均等分割 各'+fr(1,nk)+(nDeadCh>0&&nGrandCh>0?' 亡子の代わりに孫'+nGrandCh+'人が代襲':'');
  } else if(!sp&&nk===0&&np>0){
    var twoAscE=parB||gparBoth;
    var phE=twoAscE?(NW+HG/2):NW/2,cxE=PAD+phE;W=Math.max(cxE+phE+PAD,200);
    var ry1E=PAD+NH/2,ry2E=ry1E+VG;H=ry2E+NH/2+LBL+PAD+14;
    if(parB){p.push(bx(cxE-NW/2-HG/2,ry1E,'父',fr(1,2),'heir'));p.push(bx(cxE+NW/2+HG/2,ry1E,'母',fr(1,2),'heir'));p.push(ln(cxE-HG/2,ry1E,cxE+HG/2,ry1E));}
    else if(gparBoth){p.push(bx(cxE-NW/2-HG/2,ry1E,'祖父',fr(1,2),'heir'));p.push(bx(cxE+NW/2+HG/2,ry1E,'祖母',fr(1,2),'heir'));p.push(ln(cxE-HG/2,ry1E,cxE+HG/2,ry1E));}
    else p.push(bx(cxE,ry1E,gparAlive?gparLabel:'親','(全部)','heir'));
    p.push(ln(cxE,ry1E+NH/2,cxE,ry2E-NH/2));p.push(bx(cxE,ry2E,'本人','','self'));
    note=parB?'両親が相続　父'+fr(1,2)+'母'+fr(1,2):gparBoth?'祖父・祖母が相続　各'+fr(1,2):gparAlive?gparLabel+'が全部相続（直系尊属）':'直系尊属が全部相続';
  } else if(!sp&&nk===0&&np===0&&ns>0&&(nl>0||(nd>0&&nn>0))){
    /* ── 配偶者なし＋兄弟姉妹のみ ── 動的列幅レイアウト */
    var showLivSibsF=_livingSibs.slice(0,6);
    var showDeadSibsF=_deadSibsWithData.filter(function(d){return d.nephews>0;}).slice(0,6);
    var hasNephewsF=showDeadSibsF.length>0&&nn>0;
    var gapF=36,MAX_NEP_F=6;
    var denF=2*ns-nHalfSib;
    /* 各兄弟の列幅を計算 */
    var sibColsF=[];
    showLivSibsF.forEach(function(s){sibColsF.push({type:'live',sib:s,colW:NW});});
    showDeadSibsF.forEach(function(ds){
      var nShowF=Math.min(ds.nephews,MAX_NEP_F);
      var nephWF=nShowF>0?nShowF*NW+(nShowF-1)*HG:NW;
      sibColsF.push({type:'dead',sib:ds,colW:Math.max(NW,nephWF),nephShow:nShowF});
    });
    /* X座標を計算 */
    var sCXF=PAD+NW/2;
    var sibStartXF=sCXF+gapF;
    var curXF=sibStartXF;
    sibColsF.forEach(function(col,i){
      col.cx=curXF+col.colW/2;
      curXF+=col.colW+(i<sibColsF.length-1?HG:0);
    });
    var lastXF=sibColsF.length>0?sibColsF[sibColsF.length-1].cx:sCXF;
    var totalRightEdgeF=curXF;
    W=Math.max(totalRightEdgeF+PAD,200);if(W<280)W=280;
    var bkyF=PAD+16,ry1F=bkyF+26;H=ry1F+NH/2+LBL+PAD+14;if(hasNephewsF)H+=VG+NH/2+LBL;
    /* 横線 */
    p.push(ln(sCXF,bkyF,lastXF,bkyF,'#888',1));
    p.push(ln(sCXF,bkyF,sCXF,ry1F-NH/2,'#555',1.5));
    p.push(bx(sCXF,ry1F,'本人','','self'));
    /* 各兄弟を描画 */
    sibColsF.forEach(function(col){
      if(col.type==='live'){
        p.push(ln(col.cx,bkyF,col.cx,ry1F-NH/2,'#555',1.5));
        p.push(bx(col.cx,ry1F,col.sib.label,fr(col.sib.isHalf?1:2,denF),col.sib.isHalf?'half':'heir'));
      }else{
        p.push(ln(col.cx,bkyF,col.cx,ry1F-NH/2,'#888',1,'4,3'));
        p.push(bx(col.cx,ry1F,'亡'+col.sib.label,'','dead'));
        if(col.sib.nephews>0){
          var swF=svgSibWeight(col.sib.key);
          subTNamed(col.cx,ry1F,ry1F+VG,col.sib.nephews,swF,denF);
        }
      }
    });
    if(_livingSibs.length>6)p.push('<text x="'+(totalRightEdgeF+8)+'" y="'+(ry1F+4)+'" font-size="10" fill="#888">他'+(_livingSibs.length-6)+'人</text>');
    note='兄弟姉妹'+ns+'人で分割'+(nHalfSib>0?' うち半血'+nHalfSib+'人（相続分は全血の½）':'　均等')+(hasNephewsF?' 代襲あり':'')+'　※遺留分なし';
  } else{W=260;H=80;p.push(bx(130,40,'本人','','self'));p.push('<text x="130" y="74" text-anchor="middle" font-size="10" fill="#A32D2D">法定相続人がいない可能性があります</text>');}
  if(note)p.push('<text x="'+(W/2)+'" y="'+(H-5)+'" text-anchor="middle" font-size="9.5" fill="#888">'+note+'</text>');
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block;max-width:'+W+'px;margin:0 auto" xmlns="http://www.w3.org/2000/svg">'+p.join('')+'</svg>';
}

/* ===== 郵便番号自動入力 ===== */
function zipFmt(inp){
  var v=inp.value.replace(/[^0-9]/g,'');
  if(v.length>3)v=v.slice(0,3)+'-'+v.slice(3,7);
  inp.value=v;
}
function lookupZip(){
  var zip=document.getElementById('en-zip').value.replace(/-/g,'');
  var msg=document.getElementById('zip-msg');
  if(zip.length!==7){msg.className='zip-msg err';msg.textContent='7桁の郵便番号を入力してください';return;}
  msg.className='zip-msg';msg.textContent='検索中...';
  fetch('https://zipcloud.ibsnet.co.jp/api/search?zipcode='+zip)
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.results&&d.results.length>0){
        var r=d.results[0];
        var addr=r.address1+r.address2+r.address3;
        document.getElementById('en-addr').value=addr;
        msg.className='zip-msg ok';msg.textContent='✓ 住所を取得しました（番地・建物名を追記してください）';
      }else{
        msg.className='zip-msg err';msg.textContent='該当する住所が見つかりませんでした';
      }
    })
    .catch(function(){
      msg.className='zip-msg err';msg.textContent='通信エラーが発生しました。手動で入力してください';
    });
}


function startDiagnosis(){
  document.getElementById('intro-screen').style.display='none';
  document.getElementById('main-screen').style.display='';
  
  window.scrollTo({top:0,behavior:"instant"});
}
function goTab(n){
  // Allow direct navigation - if going forward, allow; if going back, always allow
  go(n);
}
function _wlOfficeName(){
  try{var d=JSON.parse(sessionStorage.getItem('wl_office_data'))||{};return d.name||'';}catch(e){return '';}
}
function go(n){
  if(n===6)buildResult();
  if(n===5){['place','cpr','injection','nutrition','blood','organ','body'].forEach(advRadio);var ot=document.getElementById('adv-other-text');if(ot)ot.value=ADV.other||'';}
  [0,1,2,3,4,5,6].forEach(function(i){document.getElementById('s'+i).style.display=i===n?'':'none';var p2=document.getElementById('p'+i);p2.className='ps'+(i===n?' active':i<n?' done':'');});
  
  window.scrollTo({top:0,behavior:"instant"});
 } 
  
function getHeirShares(){
  var sp=D.mar==='既婚',nk=D.ch;
  var parB=D.par==='両方存命',parO=D.par==='一方存命';
  var gparAlive=D.par==='両方故人'&&D.gpar&&D.gpar!=='祖父母共に故人';
  var gparBoth=gparAlive&&D.gpar==='祖父母共に存命';
  var gparLabel=D.gpar==='祖父存命'?'祖父':D.gpar==='祖母存命'?'祖母':'祖父母';
  var np=parB?2:parO?1:0;if(gparAlive)np=gparBoth?2:1;
  var ns=getTotalSib(),nd=getTotalDeadSib(),nn=getTotalNephews(),nl=ns-nd;
  /* ★修正1: denには「全兄弟の半血総数」（死亡含む）を使う */
  var nHalfSibAll=getTotalHalfSib();
  var den_sib=2*ns-nHalfSibAll; /* 全兄弟の重み合計。配偶者あり=4*den_sib、なし=den_sib が分母 */
  function gcd(a,b){return b?gcd(b,a%b):a;}
  function mk(name,num,den){var g=gcd(Math.abs(num),Math.abs(den));return{name:name,n:num/g,d:den/g};}
  var list=[];
  var _allSL=getSibList();
  var _deadKeys=(D.deadSibDetails||[]).map(function(d){return d.sibKey;});
  var _liveSL=_allSL.filter(function(s){return _deadKeys.indexOf(s.key)<0;});
  /* ★修正2: 被代襲者の全血/半血から正しい分子を返すヘルパー */
  function sibWeight(sibKey){
    var sib=_allSL.find(function(s){return s.key===sibKey;});
    return (sib&&sib.isHalf)?1:2;
  }
  if(sp&&nk>0){
    list.push(mk('配偶者',1,2));
    var nDC=Math.min(D.deadCh||0,nk),nGC=D.grandCh||0,nLC=nk-nDC;
    for(var i=0;i<nLC;i++)list.push(mk(nLC===1&&nDC===0?'子':'子'+(i+1),1,2*nk));
    if(nDC>0&&nGC>0){for(var i=0;i<Math.min(nGC,6);i++)list.push(mk(nGC===1?'孫（代襲）':'孫'+(i+1)+'（代襲）',1,2*nk*nGC));}
  }else if(sp&&nk===0&&np>0){
    list.push(mk('配偶者',2,3));
    if(parB){list.push(mk('父',1,6));list.push(mk('母',1,6));}
    else if(gparBoth){list.push(mk('祖父',1,6));list.push(mk('祖母',1,6));}
    else list.push(mk(gparAlive?gparLabel:'親',1,3));
  }else if(sp&&nk===0&&np===0&&ns>0&&(nl>0||(nd>0&&nn>0))){
    list.push(mk('配偶者',3,4));
    /* 存命兄弟：各自の全血/半血重みで計算 */
    _liveSL.forEach(function(s){list.push(mk(s.label,s.isHalf?1:2,4*den_sib));});
    /* ★修正2: 甥・姪の分子 = 被代襲者の重み(全血2/半血1) ÷ 甥姪数 */
    (D.deadSibDetails||[]).forEach(function(entry){
      if(entry.nephews>0){
        var ne=Math.min(entry.nephews,6);
        var sibLbl=getSibLabel(entry.sibKey);
        var sw=sibWeight(entry.sibKey);
        for(var i=0;i<ne;i++)
          list.push(mk(ne===1?sibLbl+'→甥・姪':sibLbl+'→甥姪'+(i+1), sw, 4*den_sib*entry.nephews));
      }
    });
  }else if(!sp&&nk>0){
    var nDC2=Math.min(D.deadCh||0,nk),nGC2=D.grandCh||0,nLC2=nk-nDC2;
    for(var i=0;i<nLC2;i++)list.push(mk(nLC2===1&&nDC2===0?'子':'子'+(i+1),1,nk));
    if(nDC2>0&&nGC2>0){for(var i=0;i<Math.min(nGC2,6);i++)list.push(mk(nGC2===1?'孫（代襲）':'孫'+(i+1)+'（代襲）',1,nk*nGC2));}
  }else if(!sp&&nk===0&&np>0){
    if(parB){list.push(mk('父',1,2));list.push(mk('母',1,2));}
    else if(gparBoth){list.push(mk('祖父',1,2));list.push(mk('祖母',1,2));}
    else list.push(mk(gparAlive?gparLabel:'親',1,1));
  }else if(!sp&&nk===0&&np===0&&ns>0&&(nl>0||(nd>0&&nn>0))){
    /* 存命兄弟：各自の全血/半血重みで計算 */
    _liveSL.forEach(function(s){list.push(mk(s.label,s.isHalf?1:2,den_sib));});
    /* ★修正2: 甥・姪の分子 = 被代襲者の重み(全血2/半血1) ÷ 甥姪数 */
    (D.deadSibDetails||[]).forEach(function(entry){
      if(entry.nephews>0){
        var ne=Math.min(entry.nephews,6);
        var sibLbl=getSibLabel(entry.sibKey);
        var sw=sibWeight(entry.sibKey);
        for(var i=0;i<ne;i++)
          list.push(mk(ne===1?sibLbl+'→甥・姪':sibLbl+'→甥姪'+(i+1), sw, den_sib*entry.nephews));
      }
    });
  }
  return list;
}

function buildDistribution(){
  var heirs=getHeirShares();
  function frStr(n,d){return d===1?'全部':'('+n+'/'+d+')';}
  function amtRnd(tot,n,d){return Math.round(tot*n/d);}
  if(heirs.length===0)return '<div style="font-size:12px;color:#888;padding:8px 0">相続人が確認できないため、分配シミュレーションを表示できません。家族構成を入力してください。</div>';
  var divTot=stot('bk')+stot('sc');
  var hasIndiv=stot('re')>0||stot('vc')>0||stot('ot')>0;
  var debtTot=stot('db'),insTot=stot('ins');
  if(divTot===0&&!hasIndiv&&debtTot===0)return '<div style="font-size:12px;color:#888;padding:8px 0">財産目録が未入力のため、シミュレーションを表示できません。<br>財産目録ステップで財産情報を入力するとここに分配シミュレーションが表示されます。</div>';
  var h='<div style="font-size:11px;color:#666;line-height:1.7;background:var(--bg2);border-radius:var(--r);padding:9px 12px;margin-bottom:12px;border:0.5px solid var(--border)">財産目録の入力をもとに、<strong>法定相続分による仮の分配</strong>をシミュレーションしています。実際の分配は遺産分割協議で決定されます。</div>';
  /* ── 相続人バッジ ── */
  h+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px">';
  heirs.forEach(function(hr){h+='<div style="background:var(--teal3);border:0.5px solid var(--teal);border-radius:20px;padding:3px 11px;font-size:12px"><span style="font-weight:600;color:var(--teal2)">'+hr.name+'</span><span style="color:#555;margin-left:3px">'+frStr(hr.n,hr.d)+'</span></div>';});
  h+='</div>';
  /* ── 分割可能（預貯金・有価証券） ── */
  if(divTot>0){
    var divRows=[];
    [{id:'bk',t:'預貯金'},{id:'sc',t:'有価証券'}].forEach(function(s){var t=stot(s.id);if(t>0)divRows.push({t:s.t,tot:t});});
    h+='<div class="dist-sh">💰 分割可能な財産（金融資産）</div>';
    h+='<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:14px">';
    h+='<table style="width:100%;min-width:'+Math.max(260,120+heirs.length*96)+'px;border-collapse:collapse;font-size:11.5px">';
    h+='<thead><tr><th style="text-align:left;padding:5px 8px;background:var(--bg2);border:0.5px solid var(--border);white-space:nowrap">財産</th><th style="text-align:right;padding:5px 8px;background:var(--bg2);border:0.5px solid var(--border);white-space:nowrap">総額</th>';
    heirs.forEach(function(hr){h+='<th style="text-align:right;padding:5px 8px;background:var(--teal3);border:0.5px solid var(--border);white-space:nowrap;color:var(--teal2)">'+hr.name+'<br><small style="font-weight:400;font-size:9px">'+frStr(hr.n,hr.d)+'</small></th>';});
    h+='</tr></thead><tbody>';
    var hTotals=heirs.map(function(){return 0;});
    divRows.forEach(function(row){
      h+='<tr><td style="padding:5px 8px;border:0.5px solid var(--border)">'+row.t+'</td><td style="padding:5px 8px;border:0.5px solid var(--border);text-align:right">'+row.tot.toLocaleString()+'円</td>';
      heirs.forEach(function(hr,i){var a=amtRnd(row.tot,hr.n,hr.d);hTotals[i]+=a;h+='<td style="padding:5px 8px;border:0.5px solid var(--border);text-align:right">'+a.toLocaleString()+'円</td>';});
      h+='</tr>';
    });
    h+='<tr style="font-weight:600;background:var(--bg2)"><td style="padding:5px 8px;border:0.5px solid var(--border)">合計</td><td style="padding:5px 8px;border:0.5px solid var(--border);text-align:right">'+divTot.toLocaleString()+'円</td>';
    heirs.forEach(function(hr,i){h+='<td style="padding:5px 8px;border:0.5px solid var(--border);text-align:right;color:var(--teal2)">'+hTotals[i].toLocaleString()+'円</td>';});
    h+='</tr></tbody></table></div>';
  }
  /* ── 不可分財産（不動産・車両等） ── */
  if(hasIndiv){
    h+='<div class="dist-sh">🏠 共有持分が生じる財産（不動産・車両等）</div>';
    var indivConf=[{id:'re',lk:'addr',fb:'不動産'},{id:'vc',lk:'md',fb:'車両・動産'},{id:'ot',lk:'desc',fb:'その他財産'}];
    indivConf.forEach(function(conf){
      var s=ASECS.find(function(x){return x.id===conf.id;});
      var valCol=s.cols.find(function(c){return c.amt;});
      D.ar[conf.id].forEach(function(row){
        var empty=s.cols.every(function(c){return !row[c.k]||(c.tp==='sel'&&row[c.k]===c.opts[0]);});
        if(empty)return;
        var label=row[conf.lk]||conf.fb;
        var val=valCol?(parseFloat(row[valCol.k])||0):0;
        h+='<div style="border:0.5px solid var(--border);border-radius:var(--r);padding:8px 10px;margin-bottom:6px;background:var(--bg)">';
        h+='<div style="font-size:12px;font-weight:600;margin-bottom:6px">🔷 '+esc(label)+(val>0?' <span style="font-weight:400;color:var(--text2);font-size:11px">（'+val.toLocaleString()+'円）</span>':'')+'</div>';
        h+='<div style="display:flex;flex-wrap:wrap;gap:4px">';
        heirs.forEach(function(hr){h+='<div style="background:var(--blue3);border:0.5px solid #A8C8F0;border-radius:4px;padding:3px 9px;font-size:11px"><span style="color:#555">'+hr.name+'：</span><span style="font-weight:600;color:var(--blue)">持分'+frStr(hr.n,hr.d)+'</span></div>';});
        h+='</div></div>';
      });
    });
    if(heirs.length>1){
      h+='<div style="background:#FFFDE7;border:0.5px solid #F9A825;border-radius:var(--r);padding:10px 12px;margin-top:4px">';
      h+='<div style="font-size:12px;font-weight:600;color:#7A5A00;margin-bottom:5px">⚠️ 共有状態になる場合の注意</div>';
      h+='<div style="font-size:11.5px;color:#5A3F00;line-height:1.75">不動産・車両等が複数の相続人で<strong>共有</strong>になると、売却・処分には<strong>相続人全員の同意と印鑑証明書</strong>が必要となります。相続人の一人でも連絡が取れない・反対する場合は手続きが止まり、売却できない状況が生じます。<br>→ <strong>遺言書</strong>で特定の相続人に財産を帰属させることで、共有状態を防ぎスムーズな承継が可能になります。</div>';
      h+='</div>';
    }
  }
  /* ── 負債 ── */
  if(debtTot>0){
    h+='<div class="dist-sh" style="margin-top:12px">📋 負債の承継</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">';
    heirs.forEach(function(hr){h+='<div style="background:#FFF5F5;border:0.5px solid #FFCDD2;border-radius:var(--r);padding:4px 10px;font-size:12px"><span style="color:#666">'+hr.name+'：</span><span style="font-weight:600;color:#C62828">'+amtRnd(debtTot,hr.n,hr.d).toLocaleString()+'円</span></div>';});
    h+='</div><div style="font-size:11px;color:#888">※負債は各相続人が法定相続分に応じて承継します。相続放棄・限定承認も検討できます。</div>';
  }
  /* ── 生命保険メモ ── */
  if(insTot>0)h+='<div style="margin-top:10px;font-size:11px;color:#888;padding:6px 10px;border-left:2px solid var(--border);background:var(--bg2)">生命保険金（'+insTot.toLocaleString()+'円）は受取人に直接支払われるため、相続財産の分配対象外です。</div>';
  return h;
}
function buildResult(){
  document.getElementById('hchart').innerHTML=buildHeirSVG();
  document.getElementById('dist-cont').innerHTML=buildDistribution();
  var adv=buildAdvice();
  document.getElementById('alist').innerHTML=adv.map(function(a){
    var priClass=a.p==='phi'?'ai--high':a.p==='pme'?'ai--med':'ai--low';
    var contractHtml='';
    if(a.contracts&&a.contracts.length){
      contractHtml='<div class="ai-contracts">'+a.contracts.map(function(c){return '<span class="ai-contract">📌 '+c+'</span>';}).join('')+'</div>';
    }
    return '<li class="ai '+priClass+'">'
      +'<div class="ai-icon">'+(a.icon||'●')+'</div>'
      +'<div class="ai-body">'
      +(a.h?'<div class="ai-hed">'+a.h+'</div>':'')
      +'<div class="atxt">'+a.t+'</div>'
      +'<div class="ai-foot"><span class="apri '+a.p+'">'+a.l+'</span>'+contractHtml+'</div>'
      +'</div></li>';
  }).join('');
  document.getElementById('explist').innerHTML=buildExperts().map(function(e){return '<div class="expitem"><span class="expbadge '+e.cls+'">'+e.type+'</span><div><div style="font-size:13px;font-weight:600">'+e.type+'</div><div style="font-size:11px;color:#555">'+e.desc+'</div></div></div>';}).join('');
}
function buildAdvice(){
  var adv=[],done=D.done,worry=D.worry;

  /* ── 基本フラグ ── */
  var hasWill=done.indexOf('遺言書（自筆）を作成済')>-1||done.indexOf('遺言書（公正証書）を作成済')>-1;
  var noAction=done.indexOf(NONE_DONE)>-1;
  var sp=D.mar==='既婚';
  var nk=D.ch;
  var parB=D.par==='両方存命',parO=D.par==='一方存命';
  var gparAlive=D.par==='両方故人'&&D.gpar&&D.gpar!=='祖父母共に故人';
  var np=parB?2:parO?1:0;if(gparAlive)np=1;
  var ns=getTotalSib(),nd=getTotalDeadSib(),nn=getTotalNephews();
  var nHalf=getTotalHalfSib();
  var hasProxy=nd>0&&nn>0;

  /* ── 財産フラグ ── */
  var reTot=stot('re'),bkTot=stot('bk'),scTot=stot('sc'),vcTot=stot('vc'),otTot=stot('ot');
  var insTot=stot('ins'),dbTot=stot('db');
  var totalAssets=reTot+bkTot+scTot+vcTot+otTot;
  var netAssets=totalAssets-dbTot;
  var financialTot=bkTot+scTot;
  var hasIndiv=reTot>0||vcTot>0||otTot>0;
  var hasJitaku=D.ar['re'].some(function(r){return r.use==='自宅'&&(parseFloat(r.val)||0)>0;});

  /* ── デジタル資産フラグ ── */
  var digitalBankKw=['ネット','PayPay','楽天','SBI','住信','LINE','GMO','UI銀行','オリックス','あおぞら','ソニー銀行','イオン','セブン','ジャパンネット','みんなの銀行','auじぶん'];
  var hasNetBank=D.ar['bk'].some(function(r){return digitalBankKw.some(function(k){return (r.bank||'').indexOf(k)>-1;});});
  var hasCrypto=D.ar['ot'].some(function(r){var d=r.desc||'';return ['暗号','仮想通貨','ビットコイン','Bitcoin','NFT','ポイント','マイル','電子マネー'].some(function(k){return d.indexOf(k)>-1;});});
  var hasDigital=hasNetBank||hasCrypto;

  /* ── 相続人フラグ ── */
  var heirs=getHeirShares();
  var heirCount=heirs.length;
  var basicDeduction=heirCount>0?30000000+6000000*heirCount:36000000;

  /* ── 家族パターン ── */
  var sibHir=!sp&&nk===0&&np===0&&ns>0;
  var sibWithSp=sp&&nk===0&&np===0&&ns>0;

  /* ── 悩みフラグ ── */
  var wDementia=worry.indexOf('認知症になった場合が心配')>-1;
  var wAfterDeath=worry.indexOf('葬儀・納骨などの死後手続')>-1;
  var wGuarantor=worry.indexOf('身元保証人がいない')>-1;
  var wBurden=worry.indexOf('子供や親戚に負担をかけたくない')>-1;
  var wNoSib=worry.indexOf('死後の手続で兄妹を頼りたくない')>-1;
  var wNoSibProp=worry.indexOf('兄妹へ財産を渡したくない')>-1;
  var wSpecific=worry.indexOf('特定の家族への手当てをしたい')>-1;
  var wTax=worry.indexOf('相続税が心配')>-1;
  var wDebt=worry.indexOf('借金を相続させたくない')>-1;
  var wPet=worry.indexOf('自分の死後のペットのこと')>-1;
  var wRelics=worry.indexOf('遺品整理をどうするか')>-1;
  var wHeir=worry.indexOf('遺産の行き先が心配')>-1;

  /* ━━ [組合せ①] 生前〜死後 一体型サポート ━━ */
  var needsFullSupport=(wDementia&&wAfterDeath)||(wDementia&&wGuarantor)||(wAfterDeath&&wGuarantor);
  if(needsFullSupport&&(done.indexOf('任意後見契約を締結済')===-1||done.indexOf('死後事務委任契約を締結済')===-1)){
    var supportC=[];
    if(wDementia)supportC.push('任意後見契約');
    if(wAfterDeath||wNoSib||wBurden)supportC.push('死後事務委任契約');
    if(wGuarantor)supportC.push('身元保証サービス');
    adv.push({
      h:'生前〜死後をまとめてカバーする包括的な契約が必要です',
      icon:'🛡️',
      t:'複数の不安をお持ちの場合は、'+supportC.join('・')+'を組み合わせた包括対策が最も効果的です。認知症になってからでは任意後見契約を結ぶことができなくなります。早めのご相談を強くお勧めします。一般社団法人 相続手続士業の会ではワンストップでのサポート体制をご提供しています。',
      p:'phi',l:'優先度高',contracts:supportC
    });
  }

  /* ━━ [組合せ②] 認知症 × 不動産 → 家族信託 ━━ */
  var hasTrustNeeds=wDementia&&reTot>0&&done.indexOf('家族信託を設定済')===-1;
  if(hasTrustNeeds){
    adv.push({
      h:'認知症 × 不動産 → 家族信託による管理が有効です',
      icon:'🏡',
      t:'認知症になると不動産（約'+reTot.toLocaleString()+'円）の売却・賃貸・担保設定が法的にできなくなります。任意後見では対応できない部分を家族信託が補完します。信頼できるご家族を受託者に設定し、判断能力があるうちに財産管理の権限を移す仕組みです。任意後見契約と組み合わせることで生前から死後まで継続的な保護が可能になります。',
      p:'phi',l:'優先度高',contracts:['家族信託','任意後見契約（補完）']
    });
  }

  /* ━━ [組合せ③] 遺産の行き先 × 特定の家族への手当て → 公正証書遺言 ━━ */
  if((wHeir&&wSpecific)&&!hasWill){
    adv.push({
      h:'「誰に」「何を」「どれだけ」渡すか — 公正証書遺言で確実に',
      icon:'📜',
      t:'遺産の行き先への不安と、特定の方への手当てのご希望が重なっています。公正証書遺言は公証人が作成するため法的安全性が高く、紛失・偽造リスクもありません。遺留分（法定相続分の1/2）を配慮しながら、ご希望の分配をしっかり文書に残しましょう。',
      p:'phi',l:'優先度高',contracts:['公正証書遺言','遺留分侵害額への対応策']
    });
  }

  /* ━━ 1. 未対策 ━━ */
  if(noAction){
    adv.push({
      h:'終活対策がまだ何も始まっていません',
      icon:'📋',
      t:'まずはエンディングノートの作成と財産目録の整理から始めましょう。'+(totalAssets>0?'総資産約'+totalAssets.toLocaleString()+'円の財産がある場合、相続人への明確な意思表示が特に重要です。':'')+'小さな一歩から始めることが、ご家族への最大の思いやりになります。',
      p:'phi',l:'優先度高',contracts:['エンディングノート作成','財産目録の整理']
    });
  }

  /* ━━ 2. 遺言書（家族構成別） ━━ */
  if(!hasWill&&!(wHeir&&wSpecific)){
    var wt,wtc=['遺言書作成'];
    if(heirCount===0){
      wt='法定相続人がいない可能性があります。遺言書がなければ財産は最終的に国庫へ帰属します。信頼できる方への遺贈や公益団体への寄附を遺言書で定めることができます。';
      wtc=['公正証書遺言（遺贈）'];
    }else if(sibWithSp){
      wt='お子さんがいない場合、配偶者の他に兄弟姉妹も相続人になります（兄弟姉妹の取り分：遺産の1/4）。配偶者にすべての財産を遺したい場合は遺言書が必須です。兄弟姉妹に遺留分はないため遺言書で自由に指定できます。';
    }else if(sibHir){
      wt='兄弟姉妹が相続人になる場合、遺留分がないため遺言書で相続先を自由に指定できます。遺言書がないと意図しない相手への財産分配が生じやすくなります。';
    }else if(!sp&&nk===0&&np>0){
      wt='配偶者がいない場合、財産は両親・祖父母が相続します。特定の方に財産を遺したい場合は遺言書で明確にしておきましょう。';
    }else{
      wt='遺言書の作成をお勧めします。相続人への財産分配を明確にしておくことで、遺産分割をめぐるトラブルを防ぎます。';
    }
    adv.push({h:'遺言書の作成をお勧めします',icon:'📜',t:wt,p:'phi',l:'優先度高',contracts:wtc});
  }

  /* ━━ 3. 【財産状況】不動産偏重による流動性リスク ━━ */
  if(reTot>3000000&&(financialTot===0||reTot>financialTot*2.5)){
    adv.push({
      h:'【資産偏重リスク】不動産に資産が集中しています',
      icon:'⚠️',
      t:'不動産評価額（約'+reTot.toLocaleString()+'円）が金融資産（約'+financialTot.toLocaleString()+'円）を大きく上回っています。不動産は現金化に時間がかかるため、相続税の納付（申告期限：相続開始から10ヶ月）や代償分割の資金が不足するリスクがあります。生命保険の非課税枠活用や、代償金準備のための預貯金を意識的に確保することをお勧めします。',
      p:'phi',l:'優先度高',contracts:['遺言書（代償分割の指定）','生命保険の活用','税理士への相談']
    });
  }

  /* ━━ 4. 不可分財産の共有リスク ━━ */
  if(hasIndiv&&heirCount>1&&!hasWill){
    adv.push({
      h:'不動産・動産の「共有状態」を防いでください',
      icon:'🔒',
      t:'不動産・車両等の財産が相続人'+heirCount+'人で共有になると、売却・処分には全員の同意と印鑑証明書が必要となります。一人でも連絡が取れない・反対する場合は手続きが止まってしまいます。遺言書で特定の相続人に帰属させることで共有状態を防ぎ、後のトラブルを回避できます。',
      p:'phi',l:'優先度高',contracts:['遺言書（特定相続分の指定）']
    });
  }

  /* ━━ 5. 配偶者居住権 ━━ */
  if(sp&&nk>0&&hasJitaku&&!hasWill){
    adv.push({
      h:'配偶者が自宅に住み続けるための「配偶者居住権」を',
      icon:'🏠',
      t:'配偶者が自宅（約'+reTot.toLocaleString()+'円）に住み続けられるよう「配偶者居住権」の設定をご検討ください。遺言書で自宅を配偶者に帰属させるか配偶者居住権を設定することで、お子さんとの遺産分割においても配偶者の住まいを確保できます。',
      p:'pme',l:'優先度中',contracts:['遺言書（配偶者居住権の設定）']
    });
  }

  /* ━━ 6. 相続税リスク ━━ */
  if(totalAssets>0&&(totalAssets>basicDeduction||wTax)){
    var taxTxt;
    if(totalAssets>basicDeduction){
      taxTxt='財産総額（約'+totalAssets.toLocaleString()+'円）が相続税の基礎控除（3,000万＋600万×法定相続人'+heirCount+'人＝'+basicDeduction.toLocaleString()+'円）を超えています。申告期限は相続開始から10ヶ月です。税理士への早期相談と生前贈与（年110万円の暦年贈与）・生命保険の活用をお勧めします。';
    }else{
      taxTxt='財産規模によっては相続税の申告が必要になる場合があります。税理士への相談と生前贈与の活用をご検討ください。';
    }
    adv.push({h:'相続税の申告・節税対策が必要です',icon:'💰',t:taxTxt,p:'phi',l:'優先度高',contracts:['税理士への相談','生前贈与・暦年贈与の活用']});
  }

  /* ━━ 7. 【財産状況】負債 + 相続放棄期限3ヶ月 ━━ */
  if(dbTot>0){
    if(netAssets<0){
      adv.push({
        h:'⏰ 負債超過：相続放棄の期限（3ヶ月）を必ず伝えてください',
        icon:'🚨',
        t:'負債（'+dbTot.toLocaleString()+'円）が資産（'+totalAssets.toLocaleString()+'円）を上回っています（純資産：'+netAssets.toLocaleString()+'円）。相続人は「相続開始を知った日から3ヶ月以内」に家庭裁判所へ相続放棄または限定承認を申述しなければなりません。財産目録に負債の全容を明記し、相続人が早期に判断できる情報を残しておくことが最優先です。',
        p:'phi',l:'優先度高',contracts:['財産目録の整備（負債含む）','相続放棄・限定承認の準備']
      });
    }else{
      adv.push({
        h:'負債あり：相続放棄の期限（3ヶ月）を相続人に周知を',
        icon:'📅',
        t:'負債（'+dbTot.toLocaleString()+'円）があります。相続人が相続放棄・限定承認を検討できるよう、財産目録で正確な純資産（現在：約'+netAssets.toLocaleString()+'円）を把握しておくことが重要です。相続人は相続開始を知った日から3ヶ月以内に家庭裁判所へ申述が必要です。この期限を知らずに過ごすと相続放棄の権利を失う場合があります。',
        p:'pme',l:'優先度中',contracts:['財産目録の整備（負債含む）']
      });
    }
  }

  /* ━━ 8. 【財産状況】デジタル遺産対策 ━━ */
  if(hasDigital){
    var digitalDesc=[];
    if(hasNetBank)digitalDesc.push('ネットバンク口座');
    if(hasCrypto)digitalDesc.push('暗号資産・ポイント等');
    adv.push({
      h:'デジタル遺産への対策が必要です',
      icon:'💻',
      t:digitalDesc.join('・')+'のご入力があります。ネット口座・暗号資産・ポイントは通帳や証書が存在せず、相続人が存在を把握できないまま消滅・失効するリスクがあります。エンディングノートに「口座名・金融機関名・問い合わせ先（カスタマーサポート等）」を記録し、信頼できる方に開示の方法を伝えておきましょう。※パスワードは直接書かず「管理ツール名」や「保管場所」にとどめることをお勧めします。',
      p:'pme',l:'優先度中',contracts:['エンディングノートへのデジタル資産記録','死後事務委任契約（デジタル整理を含む）']
    });
  }

  /* ━━ 9. 認知症 + 任意後見・家族信託（単体） ━━ */
  if(wDementia&&!hasTrustNeeds&&!needsFullSupport&&done.indexOf('任意後見契約を締結済')===-1){
    adv.push({
      h:'認知症に備えた財産管理の準備を',
      icon:'🧠',
      t:'任意後見契約の締結をお勧めします。認知症になった後では新たに契約を結ぶことが法的にできなくなります。信頼できる方を任意後見人として指定し、財産管理・身上保護の権限を事前に設定しておきましょう。',
      p:'phi',l:'優先度高',contracts:['任意後見契約']
    });
  }else if(reTot>0&&!wDementia&&!hasTrustNeeds&&done.indexOf('任意後見契約を締結済')===-1&&done.indexOf('家族信託を設定済')===-1){
    adv.push({
      h:'不動産をお持ちの方への認知症リスク対策',
      icon:'🏘️',
      t:'不動産（約'+reTot.toLocaleString()+'円）をお持ちの場合、認知症等で判断能力が低下すると売却・担保設定・管理が法的にできなくなります。任意後見契約または家族信託の設定で事前に備えることをお勧めします。',
      p:'pme',l:'優先度中',contracts:['任意後見契約','家族信託（不動産）']
    });
  }

  /* ━━ 10. 死後事務委任（単体） ━━ */
  if((wAfterDeath||wNoSib||wBurden||wRelics)&&!needsFullSupport&&done.indexOf('死後事務委任契約を締結済')===-1){
    var afterTxt='死後事務委任契約の締結をご検討ください。葬儀・納骨・各種行政手続き';
    if(wRelics)afterTxt+='・遺品整理';
    afterTxt+=wNoSib?'を専門家に委任でき、兄弟姉妹に頼らない仕組みを作ることができます。':'を専門家に委任でき、ご家族の負担を大きく軽減できます。';
    if(wRelics)afterTxt+='一般社団法人 相続手続士業の会では遺品整理業者との連携サービスも提供しています。';
    adv.push({
      h:'死後の手続きを専門家に委任しましょう',
      icon:'📝',
      t:afterTxt,
      p:'pme',l:'優先度中',contracts:['死後事務委任契約']
    });
  }

  /* ━━ 11. 兄弟姉妹への希望 ━━ */
  if(wNoSibProp){
    adv.push({
      h:'兄弟姉妹への相続を防ぐには遺言書が有効です',
      icon:'🚫',
      t:'兄弟姉妹への相続を避けたい場合は遺言書の作成が有効です。兄弟姉妹には遺留分（最低限の相続権）がないため、遺言書で相続先を自由に指定できます。ただし配偶者・子・親には遺留分（法定相続分の1/2）があります。',
      p:'phi',l:'優先度高',contracts:['遺言書（公正証書推奨）']
    });
  }
  if(wNoSib&&!wAfterDeath&&!needsFullSupport&&done.indexOf('死後事務委任契約を締結済')===-1){
    adv.push({
      h:'兄弟姉妹に頼らない死後手続の体制を',
      icon:'🤝',
      t:'死後事務委任契約を締結することで、葬儀・納骨・行政手続きを専門家に一任でき、兄弟姉妹に頼らない仕組みを作ることができます。',
      p:'phi',l:'優先度高',contracts:['死後事務委任契約']
    });
  }

  /* ━━ 12. 複雑化リスク（半血・代襲・子多数） ━━ */
  if(nHalf>0&&heirCount>1&&!hasWill){
    adv.push({h:'半血の兄弟姉妹がいる場合の相続分に注意を',icon:'👨‍👩‍👧',t:'半血の兄弟姉妹（'+nHalf+'人）がいる場合、相続分が全血と異なるため遺産分割協議が複雑になることがあります。遺言書で各相続人への分配を具体的に指定することでトラブルを防げます。',p:'pme',l:'優先度中',contracts:['遺言書']});
  }
  if(hasProxy&&reTot>0&&!hasWill){
    adv.push({h:'代襲相続人（甥・姪）がいる場合の不動産共有リスク',icon:'👨‍👩‍👧‍👦',t:'甥・姪が代襲相続人になる場合、不動産が多人数の共有になる可能性があります。遺言書で帰属先を明確にしておくことをお勧めします。',p:'pme',l:'優先度中',contracts:['遺言書（不動産の帰属指定）']});
  }
  if(nk>=3&&reTot>0&&!hasWill){
    adv.push({h:'お子さん'+nk+'人での不動産遺産分割リスク',icon:'👨‍👩‍👧‍👦',t:'お子さんが'+nk+'人いる場合、不動産（約'+reTot.toLocaleString()+'円）の遺産分割には全員の合意が必要で複雑になりやすい状況です。遺言書で具体的な分配先を指定しておくことで協議をスムーズにできます。',p:'pme',l:'優先度中',contracts:['遺言書（分割方法の指定）']});
  }

  /* ━━ 13. 生命保険の非課税枠確認 ━━ */
  if(insTot>0&&heirCount>0){
    var insEx=5000000*heirCount;
    if(insTot>insEx){
      adv.push({h:'生命保険金が非課税枠を超えています',icon:'📊',t:'生命保険金（'+insTot.toLocaleString()+'円）が非課税枠（500万×相続人'+heirCount+'人＝'+insEx.toLocaleString()+'円）を超えています。超過分は相続税課税対象となる可能性があるため、受取人の設定や保険内容の見直しをご検討ください。',p:'pme',l:'優先度中',contracts:['保険内容の見直し（税理士相談）']});
    }else if(insEx-insTot>5000000&&totalAssets>basicDeduction){
      adv.push({h:'生命保険の非課税枠をさらに活用できます',icon:'💡',t:'生命保険の非課税枠（500万×'+heirCount+'人＝'+insEx.toLocaleString()+'円）にまだ余裕があります（現在：'+insTot.toLocaleString()+'円）。財産規模から相続税対策として生命保険の追加活用が有効な場合があります。',p:'plo',l:'確認推奨',contracts:['追加生命保険の検討（税理士相談）']});
    }
  }

  /* ━━ 14. 身元保証 ━━ */
  if(wGuarantor&&!needsFullSupport){
    adv.push({
      h:'身元保証人がいない場合の対策',
      icon:'🤝',
      t:'身元保証人がいない場合、入院・介護施設入居の際に手続きが困難になることがあります。死後事務委任契約・任意後見契約と合わせて、専門家による身元保証サービスの利用もご検討ください。',
      p:'phi',l:'優先度高',contracts:['身元保証サービス','任意後見契約','死後事務委任契約']
    });
  }

  /* ━━ 15. 特定の家族への手当て（単体） ━━ */
  if(wSpecific&&!wHeir){
    adv.push({
      h:'特定の方への財産承継を遺言書で確実に',
      icon:'💝',
      t:'特定の相続人に多く遺したい場合は、遺言書での指定が有効です。遺留分（法定相続分の1/2）を侵害しない範囲で自由に分配を指定できます。遺言書に「附言事項」として想いを綴ることで、ご家族への大切なメッセージを残すこともできます。',
      p:'phi',l:'優先度高',contracts:['遺言書（公正証書推奨）']
    });
  }

  /* ━━ 16. 借金の相続 ━━ */
  if(wDebt){
    adv.push({
      h:'相続人への負債承継を防ぐ準備を',
      icon:'💳',
      t:'相続人に借金を引き継がせたくない場合、財産目録で純資産（資産−負債）を明確にし、相続人が相続放棄を検討できる情報を残しておきましょう。生命保険の受取人指定で一定の生活資金を確保しながら相続放棄を選択する方法もあります。相続放棄の申述期限は相続開始を知った日から3ヶ月以内です。',
      p:'phi',l:'優先度高',contracts:['財産目録の整備','生命保険の受取人指定']
    });
  }

  /* ━━ 17. 収骨しない ━━ */
  if(EN['grave']==='収骨しない'){
    adv.push({
      h:'「収骨しない」選択は火葬場への事前確認が必要です',
      icon:'⚠️',
      t:'火葬後に遺骨を引き取らない選択ができる地域は限られています。自治体・火葬場によって対応が異なり、収骨を義務付けている地域では選択できない場合があります。ご利用予定の火葬場に事前にご確認いただくことをお勧めします。',
      p:'pme',l:'確認推奨',contracts:['火葬場への事前確認']
    });
  }

  /* ━━ 18. ペット ━━ */
  if(wPet){
    adv.push({
      h:'ペットの引き取り先を生前に確保しましょう',
      icon:'🐾',
      t:'ペットの行く末については、死後事務委任契約や遺言書に引き取り先と飼育内容（餌・通院先など）を明記しておきましょう。法律上ペットは「物」として扱われるため、遺産として承継先を指定することが必要です。信頼できる引き取り先を生前に確認・合意しておくことが最も重要です。',
      p:'phi',l:'優先度高',contracts:['死後事務委任契約（ペット対応）','遺言書（附言事項）']
    });
  }

  /* ━━ 19. エンディングノート ━━ */
  if(done.indexOf('エンディングノートを作成済')===-1){
    adv.push({
      h:'エンディングノートの作成をお勧めします',
      icon:'📔',
      t:'財産・連絡先・医療希望・葬儀の意向などをまとめておくと、万が一の際のご家族の負担を大きく軽減できます。法的効力はありませんが、遺言書と組み合わせることで最も効果的な終活対策になります。',
      p:'plo',l:'確認推奨',contracts:['エンディングノート作成']
    });
  }

  /* ━━ ▼▼▼ カテゴリA：葬儀・納骨関連 ▼▼▼ ━━ */
  var funChoice=EN['fun']||'';
  var graveChoice=EN['grave']||'';

  /* ━━ A-1. 直葬 × 死後手続きの担い手 ━━ */
  if(funChoice==='直葬（火葬のみ）'&&(wAfterDeath||wGuarantor||wBurden||wNoSib)&&done.indexOf('死後事務委任契約を締結済')===-1&&!needsFullSupport){
    adv.push({
      h:'直葬を希望 × 死後手続きの担い手を確保してください',
      icon:'🔥',
      t:'直葬は費用を抑えられますが、火葬・役所届出・遺骨の納骨手配などを担う方が必ず必要です。身寄りがいない場合や家族に負担をかけたくない場合は、死後事務委任契約で専門家に一任する仕組みを作ることが不可欠です。一般社団法人 相続手続士業の会では直葬後の手続き一式をサポートしています。',
      p:'phi',l:'優先度高',contracts:['死後事務委任契約（直葬対応）']
    });
  }

  /* ━━ A-2. 家族葬 × 訃報連絡先・参列者未整理 ━━ */
  if(funChoice==='家族葬'&&D_OBIT.length===0&&(D_FGUEST.length===0||FGUEST_NONE===false)){
    adv.push({
      h:'家族葬を希望 — 訃報連絡先リストを準備しましょう',
      icon:'📋',
      t:'家族葬では参列者を限定するため、「誰に知らせ・誰を呼ばないか」を生前に整理しておくことが重要です。事前の整理がないと、ご家族が急いで判断しなければならず混乱が生じます。また事後に「なぜ知らせてもらえなかったのか」とのトラブルになることもあります。訃報連絡先リストと招待範囲をエンディングノートに記載しておきましょう。',
      p:'pme',l:'優先度中',contracts:['エンディングノート（訃報連絡先・参列者の記入）']
    });
  }

  /* ━━ A-3. 生前見積もり未取得 ━━ */
  if(funChoice&&funChoice!=='お任せ'&&EN['estimate']==='なし'){
    var funCost=funChoice==='一般葬'?'80〜120万円':funChoice==='家族葬'?'30〜80万円':funChoice==='直葬（火葬のみ）'?'10〜30万円':'数十万円';
    adv.push({
      h:'「'+funChoice+'」を希望 — 生前見積もりの取得をお勧めします',
      icon:'💴',
      t:funChoice+'の費用相場は'+funCost+'程度ですが、まだ見積もりを取得されていません。実際の費用と準備額にギャップが生じると、ご家族が急いで現金を用意しなければならない状況になります。生前に複数の葬儀社から見積もりを取得し、希望内容と費用の目安を家族に伝えておくことで、万が一の際の混乱を防ぐことができます。',
      p:'pme',l:'優先度中',contracts:['葬儀社への生前見積もり依頼']
    });
  }

  /* ━━ A-4. 生前見積もり「検討中」→ 背中を押す ━━ */
  if(funChoice&&funChoice!=='お任せ'&&EN['estimate']==='検討中'){
    adv.push({
      h:'生前見積もりを「検討中」のまま先送りにしないでください',
      icon:'⏰',
      t:'生前見積もりを検討中とのことですが、終活の準備のうち「実際に動く必要があるもの」の一つです。葬儀社への問い合わせは無料で、事前に複数社を比較することで最適なプランを選べます。健康なうちに行動することが、ご家族への最大の安心につながります。',
      p:'plo',l:'確認推奨',contracts:['葬儀社への生前見積もり依頼（無料）']
    });
  }

  /* ━━ A-5. 互助会「加入あり」→ 相続・解約の注意 ━━ */
  if(EN['mutual']==='加入あり'){
    adv.push({
      h:'互助会への加入あり — 相続・解約の手続きを家族に伝えておきましょう',
      icon:'🏢',
      t:'互助会の積立金は相続財産に含まれますが、解約時の返還率は一般に50〜60%程度で全額は戻りません。死後に家族が解約・利用する際は委任状・相続人確認書類が必要で手続きが煩雑です。また「互助会のサービスで葬儀を行う」ことが前提のため、他の葬儀社を利用すると積立金が無駄になる場合もあります。会員番号・提携葬儀社・連絡先をエンディングノートに記録し、内容を家族に共有しておきましょう。',
      p:'pme',l:'確認推奨',contracts:['エンディングノート（互助会情報の記入）','家族への内容共有']
    });
  }

  /* ━━ A-6. 樹木葬/散骨 × 未契約 ━━ */
  if((graveChoice==='樹木葬'||graveChoice==='散骨')&&EN['natureContract']==='まだない'){
    var natureType=graveChoice==='散骨'?'散骨':'樹木葬';
    var natureTips=graveChoice==='散骨'
      ?'散骨は法的規制があり、河川や公共の海水浴場等では禁止される場合があります。信頼できる業者を選ぶことが重要で、全国散骨協議会加盟業者等を目安にしてください。'
      :'人気の樹木葬霊園は空きが少なく、希望の場所に入れない場合があります。見学・申込みはお早めに。';
    adv.push({
      h:natureType+'を希望 — 生前に具体的な手配を進めましょう',
      icon:'🌿',
      t:natureType+'をご希望ですが、まだ契約がされていません。'+natureTips+'希望する場所・方法を具体的に決め、できれば生前契約を締結しておくことで、ご家族の「どこに頼めばよいか」という負担を大きく減らせます。具体的な業者名・連絡先をエンディングノートに記載しておきましょう。',
      p:'pme',l:'優先度中',contracts:[natureType+'業者への問い合わせ・生前契約']
    });
  }

  /* ━━ A-7. 遺影「未準備」 ━━ */
  if(EN['portrait']==='未準備'){
    adv.push({
      h:'遺影の準備をしておきましょう',
      icon:'📷',
      t:'遺影が未準備の状態です。急逝の場合、ご家族が適切な写真を探す時間的・精神的負担は非常に大きくなります。元気なうちにお気に入りの写真を選んでおくか、遺影撮影サービスを利用することをお勧めします。エンディングノートに「使用希望の写真の保管場所・ファイル名」を記入しておくと、ご家族への大切な配慮になります。',
      p:'plo',l:'確認推奨',contracts:['遺影写真の準備・保管場所の記録']
    });
  }

  /* ━━ A-8. 散骨 × 海域規制・遺族への伝達 ━━ */
  if(graveChoice==='散骨'){
    adv.push({
      h:'散骨を希望 — 具体的な希望内容を遺族に伝えてください',
      icon:'⚓',
      t:'海洋散骨は日本では適切な方法で行えば違法ではありませんが、希望海域・業者名・立ち会いの有無などをエンディングノートに具体的に記載し、遺族に伝えておくことが重要です。また、散骨後は「墓所なし」の状態となるため、ご家族が手を合わせる場所（手元供養・ミニ仏壇等）の検討も合わせてご一考ください。',
      p:'pme',l:'確認推奨',contracts:['散骨希望内容のエンディングノートへの記載','業者の事前選定']
    });
  }
  /* ━━ ▲▲▲ カテゴリA：葬儀・納骨関連 ▲▲▲ ━━ */

  /* ━━ ▼▼▼ カテゴリB：契約・サブスク・デジタル整理 ▼▼▼ ━━ */
  var ctActiveCount=CT_DEFS.filter(function(d){return d.type!=='doc'&&CT_STATE[d.id]&&CT_STATE[d.id].active;}).length;
  var ctSubscIds=['amazon','netflix','disney','hulu','unext','appletv','youtube','sub1','sub2'];
  var ctSubscCount=ctSubscIds.filter(function(id){return CT_STATE[id]&&CT_STATE[id].active;}).length;
  var ctCardActive=CT_STATE['card']&&CT_STATE['card'].active;
  var ctNetIds=['net','amazon','netflix','disney','hulu','unext','appletv','youtube','sub1','sub2'];
  var ctNetCount=ctNetIds.filter(function(id){return CT_STATE[id]&&CT_STATE[id].active;}).length;
  var hasDoneAfter=done.indexOf('死後事務委任契約を締結済')>-1;

  /* ━━ B-1. 契約多数 → 解約手続きリストの作成推奨 ━━ */
  if(ctActiveCount>=4&&!hasDoneAfter){
    adv.push({
      h:'登録された契約が'+ctActiveCount+'件 — 死後の解約手続きを整理しましょう',
      icon:'📑',
      t:'各種契約・サービスが'+ctActiveCount+'件登録されています。死後にご家族がこれらを全て把握・解約するのは大きな負担です。特に自動引き落としが続くと遺産の目減りにもつながります。契約一覧をエンディングノートに整理するとともに、死後事務委任契約で契約解約の委任範囲に含めることも検討しましょう。',
      p:'pme',l:'優先度中',contracts:['死後事務委任契約（契約解約を含む）','契約一覧のエンディングノートへの記載']
    });
  }

  /* ━━ B-2. クレジットカード × 情報記録 ━━ */
  if(ctCardActive){
    var cardEntries=CT_STATE['card'].entries||[];
    var hasCardInfo=cardEntries.some(function(e){return e.co||e.brand||e.tel;});
    if(!hasCardInfo||cardEntries.length>1){
      adv.push({
        h:'クレジットカードの情報を記録・整理しておきましょう',
        icon:'💳',
        t:'クレジットカードがあります。死後も自動引き落としが継続するリスクがあるため、使用しないカードは生前に解約しておくことをお勧めします。残すカードはカード会社名・番号末尾4桁・緊急連絡先をエンディングノートに記録しておきましょう。遺族がカード会社に連絡する際の重要な情報になります。',
        p:'pme',l:'確認推奨',contracts:['不要なカードの生前解約','エンディングノートへのカード情報記入']
      });
    }
  }

  /* ━━ B-3. サブスクリプション多数 ━━ */
  if(ctSubscCount>=3){
    adv.push({
      h:'サブスクリプションが'+ctSubscCount+'件 — 解約漏れに注意してください',
      icon:'📱',
      t:'動画・音楽・その他サブスクリプションが'+ctSubscCount+'件登録されています。サブスクは通帳やカード明細に記録が残りにくく、遺族が把握するのが困難なため、死後も自動更新が続くことがあります。サービス名・登録メールアドレス・解約方法をエンディングノートに記載しておきましょう。生前に不要なサービスを整理しておくことも大切です。',
      p:'pme',l:'確認推奨',contracts:['サブスク一覧のエンディングノートへの記載','不要なサブスクの生前解約']
    });
  }

  /* ━━ B-4. 契約あり × 死後事務委任なし → 軽いナッジ ━━ */
  if(ctActiveCount>=2&&ctActiveCount<4&&!hasDoneAfter){
    adv.push({
      h:'各種契約の死後手続き — 死後事務委任契約でまとめて委任できます',
      icon:'🔑',
      t:'光熱費・通信・各種サービス契約の解約手続きは、死後事務委任契約の委任範囲に含めることができます。解約漏れや自動引き落としの継続を防ぎ、遺族の手続き負担を軽減できます。',
      p:'plo',l:'確認推奨',contracts:['死後事務委任契約（契約解約を含む）']
    });
  }

  /* ━━ B-5. ネット・デジタルサービス多数 → ID管理の記録 ━━ */
  if(ctNetCount>=2){
    adv.push({
      h:'ネット・デジタルサービスのログイン情報を記録しておきましょう',
      icon:'🔒',
      t:'インターネット関連サービスが'+ctNetCount+'件登録されています。各サービスのアカウント情報がわからないと、遺族による解約・退会手続きが非常に困難になります。パスワードを直接書かずとも「パスワード管理ツール名」や「IDを記録したメモの保管場所」だけでも記録しておくことで、デジタル遺品の整理が格段にスムーズになります。',
      p:'plo',l:'確認推奨',contracts:['エンディングノートへのデジタルサービス情報記録']
    });
  }
  /* ━━ ▲▲▲ カテゴリB：契約・サブスク・デジタル整理 ▲▲▲ ━━ */

  /* ━━ ▼▼▼ カテゴリC：ペット・形見分け・連絡先整理 ▼▼▼ ━━ */

  /* ━━ C-1. ペット登録あり × 引継ぎ先状況 ━━ */
  if(D_PET.length>0){
    var petNoHeir=D_PET.some(function(p){return !p.heir||p.heir.trim()==='';}); 
    if(petNoHeir){
      adv.push({
        h:'ペットの引き取り先が未決定のペットがいます',
        icon:'🐾',
        t:'ペットの引き取り先・後継者が決まっていないペットがいます。飼い主の死後、ペットが行き場を失うケースは少なくありません。死後事務委任契約にペットの引き渡し・世話の委任を盛り込むことができます。また、遺言書の「附言事項」で飼育上の希望（餌の種類・かかりつけ動物病院等）を記録しておきましょう。引き取り先候補と生前に十分話し合っておくことが最も重要です。',
        p:'phi',l:'優先度高',contracts:['死後事務委任契約（ペット引き渡し条項）','遺言書（附言事項：飼育希望の記載）']
      });
    } else {
      adv.push({
        h:'ペットの引き取り先を遺言書・死後事務委任契約で確実に',
        icon:'🐾',
        t:'ペットの引き取り先が記録されています。この方との合意が口約束のみの場合、死後に引き取りを拒否されるリスクがあります。遺言書の附言事項や死後事務委任契約に引き取り先・飼育内容を明記しておくことで、法的に近い形で意思を残すことができます。',
        p:'pme',l:'優先度中',contracts:['死後事務委任契約（ペット対応）','遺言書（附言事項）']
      });
    }
  }

  /* ━━ C-2. 形見分け登録あり × 遺言書なし ━━ */
  if(D_KEIMI.length>0&&!hasWill){
    adv.push({
      h:'形見分けの希望 — 遺言書で確実に伝えましょう',
      icon:'🎁',
      t:'形見分けの品物と渡してほしい方が記録されています。エンディングノートの記載は法的効力がなく、死後に無視されたり遺産分割協議で争いの種になる可能性があります。特に不動産や価値のある動産は遺言書で受取人を指定することが確実です。形見分けの内容を遺言書の附言事項や特定遺贈として盛り込むことを検討しましょう。',
      p:'pme',l:'優先度中',contracts:['遺言書（特定遺贈・附言事項）']
    });
  }

  /* ━━ C-3. 訃報連絡先未登録 ━━ */
  if(D_OBIT.length===0&&funChoice!=='直葬（火葬のみ）'){
    adv.push({
      h:'訃報連絡先のリストを作成しておきましょう',
      icon:'📞',
      t:'訃報をお知らせすべき方の連絡先がまだ登録されていません。急逝の場合、ご家族が連絡先を把握していないと、重要な人への連絡漏れや遅延が生じます。友人・知人・職場関係・親族の連絡先と「どの段階で連絡するか（死亡時/葬儀前/葬儀後等）」をエンディングノートに記録しておきましょう。',
      p:'pme',l:'確認推奨',contracts:['エンディングノート（訃報連絡先の記入）']
    });
  }

  /* ━━ C-4. 形見分けなし × 財産あり → 形見分けの検討提案 ━━ */
  if(D_KEIMI.length===0&&(totalAssets>0||otTot>0)){
    adv.push({
      h:'形見分けの希望を記録しておきましょう',
      icon:'💝',
      t:'財産や動産がある場合、形見分けしたい品物と渡してほしい方を事前に記録しておくことで、遺族間のトラブルを防ぐことができます。エンディングノートへの記録でも構いませんが、法的効力をもたせるには遺言書への記載が確実です。品物ごとに受取人を明確にしておきましょう。',
      p:'plo',l:'確認推奨',contracts:['エンディングノート（形見分けの記入）','遺言書（特定遺贈）']
    });
  }

  /* ━━ C-5. 葬儀参列者リスト未整理 × 一般葬 ━━ */
  if(funChoice==='一般葬'&&D_FGUEST.length===0&&!FGUEST_NONE){
    adv.push({
      h:'一般葬を希望 — 参列者リストを準備してください',
      icon:'👥',
      t:'一般葬では参列者が多くなるため、事前に参列をお願いしたい方のリストを作成しておくことをお勧めします。急逝の際にご家族が連絡先を一から調べる手間と混乱を大幅に軽減できます。氏名・連絡先・関係性をエンディングノートに記載しておきましょう。',
      p:'pme',l:'確認推奨',contracts:['エンディングノート（葬儀参列者リストの記入）']
    });
  }
  /* ━━ ▲▲▲ カテゴリC：ペット・形見分け・連絡先整理 ▲▲▲ ━━ */

  /* ━━ ▼▼▼ カテゴリD：医療・事前指示書関連 ▼▼▼ ━━ */
  var advAllBlank=!ADV.cpr&&!ADV.injection&&!ADV.nutrition&&!ADV.blood&&!ADV.place;
  var advFamilyDecideCount=['cpr','injection','nutrition','blood','place'].filter(function(k){return ADV[k]&&ADV[k].indexOf('家族に任せます')>-1;}).length;
  var advOrganWish=ADV.organ&&ADV.organ.indexOf('臓器提供を希望します')>-1;
  var advBodyRegistered=ADV.body==='既に献体登録済みです';
  var advBodyWish=ADV.body==='献体を希望します';

  /* ━━ D-1. 延命治療の意思が全項目未表明 ━━ */
  if(advAllBlank){
    adv.push({
      h:'延命治療に関する意思表示がまだ記録されていません',
      icon:'🏥',
      t:'意識がなくなった際に「どのような医療を受けるか・受けないか」を事前に記録しておくことは、ご家族にとっての大きな助けになります。延命治療の希望が伝わっていない場合、ご家族が苦しい判断を迫られることがあります。「医療の希望」タブから事前指示の内容を入力しておきましょう。任意後見契約の身上保護条項とセットにすることで、より確実に意思を実現できます。',
      p:'pme',l:'確認推奨',contracts:['事前指示書の作成','任意後見契約（身上保護）']
    });
  }

  /* ━━ D-2. 「家族に任せます」が多い → 家族への伝達 ━━ */
  if(advFamilyDecideCount>=3){
    adv.push({
      h:'医療の判断を「家族に任せる」場合、事前の話し合いが不可欠です',
      icon:'🗣️',
      t:'複数の項目で「判断は家族に任せます」と記録されています。しかし、判断を任された家族は「本当にこの判断でよいのか」と深く苦しむことになります。日ごろから自分の価値観・希望を家族に話しておくこと、またはエンディングノートや任意後見契約の身上保護条項に大まかな方針を記録しておくことが、家族への最大の配慮になります。',
      p:'pme',l:'確認推奨',contracts:['家族との終末期の話し合い（エンディングノートへの記録）','任意後見契約（身上保護）']
    });
  }

  /* ━━ D-3. 臓器提供希望 × 意思表示カード・家族共有 ━━ */
  if(advOrganWish){
    adv.push({
      h:'臓器提供を希望 — 意思表示カードの携帯と家族への伝達を',
      icon:'💗',
      t:'臓器提供を希望する場合、意思表示カード（または健康保険証・マイナンバーカードの裏面）への記入と携帯が必要です。また、死後に臓器提供を行うには遺族の同意が不可欠です。家族に希望を明確に伝え、了承を得ておくことが最も重要です。エンディングノートに希望内容と家族への説明の有無を記録しておきましょう。',
      p:'pme',l:'確認推奨',contracts:['意思表示カードへの記入・携帯','家族への臓器提供意思の伝達']
    });
  }

  /* ━━ D-4. 献体登録済み/希望 → 大学・家族への確認 ━━ */
  if(advBodyRegistered||advBodyWish){
    var bodyTxt=advBodyRegistered
      ?'献体登録済みとのことですが、登録した大学・医学部への最新の連絡先が家族に伝わっているか確認してください。献体の手続きは死後すぐに連絡が必要で、連絡が遅れると受け付けられない場合があります。'
      :'献体を希望する場合、希望する大学・医学部の「白菊会」等の登録団体に事前に登録が必要です。生前に登録を済ませ、登録証を家族に伝えておきましょう。';
    adv.push({
      h:'献体の希望 — 登録情報と家族への周知を確認してください',
      icon:'🔬',
      t:bodyTxt+'献体後は通常2〜5年後に返骨されます。家族がその後の供養を行えるよう、希望（散骨・樹木葬等）も合わせてエンディングノートに記録しておきましょう。',
      p:'pme',l:'確認推奨',contracts:['献体登録団体への確認','家族への献体情報の共有']
    });
  }
  /* ━━ ▲▲▲ カテゴリD：医療・事前指示書関連 ▲▲▲ ━━ */

  /* ━━ ▼▼▼ カテゴリE：家族構成の深掘り組合せ ▼▼▼ ━━ */

  /* ━━ E-1. おひとりさま（独身×子なし×親故人×兄弟なし）× 対策不十分 ━━ */
  var isSingleNoFamily=!sp&&nk===0&&np===0&&ns===0&&!gparAlive;
  if(isSingleNoFamily&&(done.indexOf('任意後見契約を締結済')===-1||done.indexOf('死後事務委任契約を締結済')===-1||!hasWill)){
    var singleMissing=[];
    if(!hasWill)singleMissing.push('遺言書');
    if(done.indexOf('任意後見契約を締結済')===-1)singleMissing.push('任意後見契約');
    if(done.indexOf('死後事務委任契約を締結済')===-1)singleMissing.push('死後事務委任契約');
    adv.push({
      h:'おひとりさまの方 — 生前・死後を包括的にカバーする対策が急務です',
      icon:'🏠',
      t:'独身で身寄りがいない場合、'+singleMissing.join('・')+'の準備がまだ不十分です。法定相続人がいないため遺産は最終的に国庫へ帰属します。また、意識を失った際に代わりに手続きができる人がいない状況は非常にリスクが高いです。遺言書（遺贈先の指定）・任意後見契約（生前の財産管理・身上保護）・死後事務委任契約（死後の手続き一式）の三点セットを早急にご準備ください。',
      p:'phi',l:'優先度高',contracts:singleMissing
    });
  }

  /* ━━ E-2. 子あり × 親存命 → 二次相続対策 ━━ */
  if(sp&&nk>0&&(parB||parO)&&reTot>0&&!hasWill){
    adv.push({
      h:'子あり × 親存命 — 二次相続（配偶者の死後）への備えを',
      icon:'👨‍👩‍👧',
      t:'お子さんがいてご両親が存命の場合、万が一配偶者よりご両親が先に亡くなり、その後配偶者も亡くなる「二次相続」が発生します。二次相続時に不動産（約'+reTot.toLocaleString()+'円）の扱いが未確定だと、お子さんとご両親の間で相続争いが生じるリスクがあります。一次・二次相続を見越した遺言書の作成を検討しましょう。',
      p:'pme',l:'優先度中',contracts:['遺言書（一次・二次相続を見越した設計）','税理士への相談']
    });
  }

  /* ━━ E-3. 相続人ゼロ × 財産あり → 遺贈・寄付の提案 ━━ */
  if(heirCount===0&&totalAssets>0&&!hasWill){
    adv.push({
      h:'法定相続人がいません — 遺産の行き先を遺言書で指定してください',
      icon:'🏛️',
      t:'法定相続人がいない場合、遺言書がなければ財産は最終的に国庫へ帰属します（民法959条）。遺言書で信頼できる個人への遺贈や、NPO・公益財団法人への寄附遺贈を指定することで、あなたの財産を大切な人・社会のために役立てることができます。一般社団法人 相続手続士業の会では遺贈寄付に対応した遺言書作成をサポートしています。',
      p:'phi',l:'優先度高',contracts:['公正証書遺言（遺贈・寄附遺贈）']
    });
  }

  /* ━━ E-4. 再婚 × 前婚の子の可能性 × 遺言書なし ━━ */
  /* 再婚の直接的フラグはないが、子あり×配偶者ありで子の数が多い場合に示唆 */
  if(sp&&nk>=2&&!hasWill&&reTot>0){
    adv.push({
      h:'お子さんが複数いる場合 — 前婚の子がいる場合は特に遺言書が重要です',
      icon:'👨‍👧‍👦',
      t:'お子さんが'+nk+'人いる場合、遺産分割協議には全員の同意が必要です。もし前婚のお子さんがいる場合、現在の配偶者との関係が複雑になり、不動産（約'+reTot.toLocaleString()+'円）を含む遺産分割が特に難しくなります。相続人全員が明確になっているか確認し、遺言書で具体的な分割方法を指定しておくことを強くお勧めします。',
      p:'pme',l:'優先度中',contracts:['遺言書（分割方法の指定）','相続人調査']
    });
  }

  /* ━━ E-5. 配偶者 × 子なし × 兄弟あり × 不動産 → 遺言の緊急性 ━━ */
  if(sibWithSp&&reTot>0&&!hasWill){
    adv.push({
      h:'配偶者 × 子なし × 兄弟あり — 遺言書なしでは不動産が危険です',
      icon:'🚨',
      t:'お子さんがいない場合、配偶者の他に兄弟姉妹（'+ns+'人）も相続人になります（兄弟姉妹の法定相続分：1/4）。不動産（約'+reTot.toLocaleString()+'円）が兄弟姉妹との共有になると、売却・処分には全員の同意が必要となり、配偶者が住み続けられなくなるリスクがあります。兄弟姉妹には遺留分がないため、遺言書で配偶者に全財産を遺すことが可能です。早急に遺言書を作成してください。',
      p:'phi',l:'優先度高',contracts:['公正証書遺言（配偶者へ全財産）']
    });
  }

  /* ━━ E-6. 子あり × 親存命 × 認知症心配 → 後見の波及リスク ━━ */
  if(nk>0&&(parB||parO)&&wDementia&&done.indexOf('任意後見契約を締結済')===-1){
    adv.push({
      h:'親御さんが存命 × 認知症不安 — 後見制度の波及リスクに備えを',
      icon:'👴',
      t:'ご両親が存命で認知症への不安がある場合、ご両親が認知症になると相続手続きが複雑になります（認知症の相続人は遺産分割協議に参加できず、法定後見人の選任が必要になります）。また、ご自身が認知症になった場合も同様です。任意後見契約を今のうちに締結し、ご両親の状況も含めた長期的な財産管理体制を整えておきましょう。',
      p:'pme',l:'優先度中',contracts:['任意後見契約（本人・家族状況を踏まえた設計）']
    });
  }
  /* ━━ ▲▲▲ カテゴリE：家族構成の深掘り組合せ ▲▲▲ ━━ */

  /* ━━ 全対策済み ━━ */
  if(adv.length===0){
    adv.push({
      h:'現在の対策は十分に整っています',
      icon:'✅',
      t:'定期的な内容の見直しと更新をお勧めします。家族構成や財産状況に変化があった場合は、ぜひ専門家へのご相談もご検討ください。',
      p:'plo',l:'良好',contracts:['定期的な内容見直し']
    });
  }
  return adv;
}
function buildExperts(){
  var list=[{cls:'bt',type:'司法書士・行政書士',desc:'遺言書・相続人調査・死後事務委任契約'}];
  if(D.worry.indexOf('認知症になった場合が心配')>-1)list.push({cls:'bb',type:'弁護士・司法書士',desc:'任意後見契約・家族信託の設計'});
  if(stot('bk')>500||stot('re')>0||D.worry.indexOf('相続税が心配')>-1)list.push({cls:'ba',type:'税理士',desc:'相続税試算・生前贈与対策・節税プランニング'});
  if(D.worry.indexOf('葬儀・納骨などの死後手続')>-1||D.worry.indexOf('死後の手続で兄妹を頼りたくない')>-1)list.push({cls:'bt',type:'終活コーディネーター',desc:'葬儀・納骨・遺品整理の事前手続き支援'});
  return list;
}
function gv(id){var e=document.getElementById(id);return e?e.value:'';}
function esc(s){if(!s)return '&nbsp;';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function buildPrintHTML(){
  /* WL: sessionStorageから事務所情報を取得 */
  var _wl=(function(){try{return JSON.parse(sessionStorage.getItem('wl_office_data'))||{};}catch(e){return {};}})();
  var _wlName   =_wl.name    ||'一般社団法人 相続手続士業の会';
  var _wlAddr   =_wl.address ||'〒106-0047 東京都港区南麻布4-12-25-201';
  var _wlTel    =_wl.tel     ||'03-6721-6811';
  var _wlHp     =_wl.hp      ||'sozoku-expert.net';
  var _wlHpDisp =_wlHp.replace(/^https?:\/\//,'').replace(/\/$/,'');

  var name=gv('en-name')||'　　　　　';var date=gv('en-date')||'　　年　月　日';
  var birth=gv('en-birth');
  /* 満年齢：画面上の計算済み表示値を取得（未入力時は空文字） */
  var ageDisp=(function(){
    var disp=document.getElementById('en-age-display');
    if(!disp)return '';
    var t=disp.textContent||'';
    return t.indexOf('--')===-1?t:'';
  })();

  /* ===== ① 表紙 ===== */
  var h='<div class="pcover">'
    +'<div class="pcover-line"></div>'
    +'<div class="pcover-title">終　活　診　断　書</div>'
    +'<div class="pcover-card"><table class="pcover-tbl"><tbody>'
    +'<tr><td>氏　　名</td><td>'+esc(name)+'</td></tr>'
    +(birth?'<tr><td>生年月日</td><td>'+esc(birth)+(ageDisp?' （'+esc(ageDisp)+'）':'')+'</td></tr>':'')
    +'<tr><td>作 成 日</td><td>'+esc(date)+'</td></tr>'
    +'</tbody></table></div>'
    +'<div class="pcover-contents">'
    +'<div class="pcover-ctit">■ 収録内容</div>'
    +'<div class="pcover-clist">① 相続人関係図（法定相続人・法定相続分）<br>② 財産目録（不動産・預貯金・有価証券・保険・その他財産・負債）<br>③ エンディングノート（医療・葬儀希望・書類保管場所・デジタル遺品・形見分け等）<br>④ 生前契約・解約が必要な契約一覧<br>⑤ 医療に関する希望（事前指示書／臓器提供・献体含む）<br>⑥ 処方箋（必要な終活対策のアドバイス）</div>'
    +'</div>'
    +'<div style="font-size:11px;color:#888;margin-bottom:16px">運営：'+esc(_wlName)+'　'+esc(_wlAddr)+'　TEL: '+esc(_wlTel)+'</div>'
    +'<div class="pcover-notice">本書類は参考資料の作成を目的としたものであり、法的効力を持ちません。相続・遺言書作成・任意後見契約等の具体的な手続きについては、専門家（司法書士・行政書士・弁護士・税理士）にご相談ください。</div>'
    +'</div>';

  /* ===== ② 相続人関係図 ===== */
  h+='<div class="pnewpage">'
    +'<div class="psec-hd">相 続 人 関 係 図</div>'
    +'<div class="heir-print-wrap">'+buildHeirSVG()+'</div>'
    +'<div class="pnotice" style="margin-top:14px">※上図は法定相続分を示します。遺言書がある場合は遺言の内容が優先されます。相続分は最終的に遺産分割協議で決定します。</div>'
    +'</div>';

  /* ===== ③ 財産目録 ===== */
  h+='<div class="pnewpage">'
    +'<div class="ptit">財　産　目　録</div>'
    +'<div class="pmeta">氏名：'+esc(name)+'　　作成日：'+esc(date)+'</div>';
  ASECS.forEach(function(s){
    var a=acol(s);var filled=D.ar[s.id].filter(function(r){return s.cols.some(function(c){return r[c.k]&&r[c.k]!==''&&!(c.tp==='sel'&&r[c.k]===c.opts[0]);});});
    h+='<div class="psec"><div class="psh">■ '+s.t+'</div><table class="ptbl"><thead><tr>'+s.cols.map(function(c){return '<th'+(c.amt?' class="num"':'')+'>'+c.l.replace('(円)','')+'</th>';}).join('')+'</tr></thead><tbody>';
    if(!filled.length)h+='<tr class="empty"><td colspan="'+s.cols.length+'">（記載なし）</td></tr>';
    else{filled.forEach(function(r){h+='<tr>'+s.cols.map(function(c){var v=r[c.k]||'';return c.amt?'<td class="num">'+(parseFloat(v)>0?parseFloat(v).toLocaleString()+'円':'—')+'</td>':'<td>'+esc(v)+'</td>';}).join('')+'</tr>';});if(a)h+='<tr class="sub"><td colspan="'+(s.cols.length-1)+'" style="text-align:right">小計</td><td class="num">'+stot(s.id).toLocaleString()+'円</td></tr>';}
    h+='</tbody></table></div>';
  });
  var ta=0,td=0;ASECS.forEach(function(s){var t=stot(s.id);if(s.debt)td+=t;else ta+=t;});
  var net=ta-td;
  h+='<div class="pfooter">'
    +'<div class="pfbox"><div class="pfl">総資産</div><div class="pfv pos">'+ta.toLocaleString()+'円</div></div>'
    +'<div class="pfbox"><div class="pfl">総負債</div><div class="pfv neg">'+td.toLocaleString()+'円</div></div>'
    +'<div class="pfbox"><div class="pfl">純資産</div><div class="pfv '+(net>=0?'pos':'neg')+'">'+net.toLocaleString()+'円</div></div>'
    +'</div>';
  h+='<div class="pnotice">※本財産目録は概算を含みます。実際の相続手続きには正確な評価額の確認が必要です。</div>';
  h+='</div>';

  /* ===== ④ エンディングノート ===== */
  h+='<div class="pnewpage">'
    +'<div class="entit">エンディングノート</div>'
    +'<div class="pmeta">氏名：'+esc(name)+'　　作成日：'+esc(date)+'</div>';
  var enSecs=[
    {t:'基本情報',rows:[['氏名（フリガナ）',gv('en-name')],['生年月日',gv('en-birth')+(ageDisp?' （'+ageDisp+'）':'')],['性別',gv('en-gender')],['血液型',gv('en-blood')],['電話番号',gv('en-tel')],['現住所',gv('en-addr')]]},
    {t:'緊急連絡先',rows:[['氏名①・続柄',gv('en-ec1n')+'　'+gv('en-ec1r')],['電話①',gv('en-ec1t')],['氏名②・続柄',gv('en-ec2n')+'　'+gv('en-ec2r')],['電話②',gv('en-ec2t')]]},
    {t:'葬儀・お骨の希望',rows:[
      ['葬儀の形式',EN['fun']||'（未回答）'],
      ['焼骨の扱い',EN['grave']||'（未回答）'],
      ['収骨に関する注意',EN['grave']==='収骨しない'?'⚠️ 収骨しないを選択できる地域は限られています。ご利用予定の火葬場に事前にご確認ください。':'（該当なし）'],
      ['希望メモ',gv('en-fun-note')],
      ['希望する葬儀社',gv('en-funeral-co')?(gv('en-funeral-co')+(gv('en-funeral-branch')?' 支店：'+gv('en-funeral-branch'):'')+(gv('en-funeral-tel')?' TEL:'+gv('en-funeral-tel'):'')+(gv('en-funeral-cost')?' 費用目安：'+gv('en-funeral-cost')+'円':'')):'（記載なし）'],
      ['生前見積もり',EN['estimate']||'（未回答）'],
      ['互助会',EN['mutual']?EN['mutual']+(gv('en-mutual-detail')?' / '+gv('en-mutual-detail'):''):'（未回答）'],
      ['副葬品（棺に入れて欲しい物）',gv('en-coffin-items')||'（記載なし）'],
      ['遺影',EN['portrait']?EN['portrait']+(EN['portrait']==='準備済み'&&gv('en-portrait-loc')?' 保管場所：'+gv('en-portrait-loc'):EN['portrait']==='未準備'&&gv('en-portrait-photo')?' 使用写真：'+gv('en-portrait-photo'):''):'（未回答）'],
      ['菩提寺',gv('en-temple')?(gv('en-temple')+(gv('en-temple-addr')?' 住所：'+gv('en-temple-addr'):'')+(gv('en-temple-tel')?' TEL:'+gv('en-temple-tel'):'')):'（記載なし）'],
      ['お墓の管理者',gv('en-grave-mgr-name')?(gv('en-grave-mgr-name')+(gv('en-grave-mgr-rel')?' （'+gv('en-grave-mgr-rel')+'）':'')+(gv('en-grave-mgr-tel')?' TEL:'+gv('en-grave-mgr-tel'):'')):'（記載なし）'],
      ['樹木葬・散骨',EN['grave']==='樹木葬'||EN['grave']==='散骨'?(EN['natureContract']||'')+(gv('en-nature-co')?' 先：'+gv('en-nature-co'):'')+(gv('en-nature-addr')?' 住所：'+gv('en-nature-addr'):'')+(gv('en-nature-tel')?' TEL:'+gv('en-nature-tel'):'')+(gv('en-sea-area')?' 希望海域：'+gv('en-sea-area'):''):'（該当なし）'],
      ['納骨堂',EN['grave']==='納骨堂'?(EN['ossuaryContract']||'')+(gv('en-ossuary-co')?' 先：'+gv('en-ossuary-co'):'')+(gv('en-ossuary-addr')?' 住所：'+gv('en-ossuary-addr'):'')+(gv('en-ossuary-tel')?' TEL:'+gv('en-ossuary-tel'):''):'（該当なし）'],
      ['焼骨その他希望',EN['grave']==='その他'?gv('en-grave-other')||'（詳細未記入）':'（該当なし）']
    ]},
    {t:'重要書類の保管場所',rows:[['遺言書',gv('en-will')],['通帳',gv('en-bank-loc')],['介護保険証書・障害者手帳等',gv('en-ins-loc')],['年金手帳',gv('en-pension')],['登記済証（権利書）',gv('en-touki-loc')],['保険証券',gv('en-hoken-loc')],['その他',gv('en-docs')]]},
    {t:'📱 デジタル遺品リスト（機器・サービス）',rows:[
      ['スマートフォン 機種・キャリア',gv('en-digi-sp-model')||'（未記入）'],
      ['ロック解除の種類',gv('en-digi-sp-lock')||'（未記入）'],
      ['パソコン 機種・OS',gv('en-digi-pc-model')||'（未記入）'],
      ['ネット銀行・ネット証券',gv('en-digi-netbank')||'（未記入）'],
      ['メール・クラウドアカウント',gv('en-digi-email')||'（未記入）'],
      ['SNS・その他サービス',gv('en-digi-sns')||'（未記入）'],
      ['特記事項',gv('en-digi-note')||'（未記入）']
    ]},
    {t:'専門家・重要連絡先',rows:[['かかりつけ医',gv('en-doc')+(gv('en-doc-tel')?' TEL:'+gv('en-doc-tel'):'')],['弁護士・司法書士等',gv('en-law')+(gv('en-law-tel')?' TEL:'+gv('en-law-tel'):'')],['税理士',gv('en-tax')+(gv('en-tax-tel')?' TEL:'+gv('en-tax-tel'):'')]]}
  ];
  enSecs.forEach(function(sec){h+='<div class="psec"><div class="enbsh">■ '+sec.t+'</div><table class="entbl"><tbody>'+sec.rows.map(function(r){return '<tr><td class="el" style="width:140px;background:#f7f7f7;font-weight:bold;color:#333;word-break:break-all">'+r[0]+'</td><td style="color:#111">'+(esc(r[1])||'　')+'</td></tr>';}).join('')+'</tbody></table></div>';});

  /* ── デジタル遺品 手書き記入欄 ── */
  (function(){
    var HW_ROWS=[];
    var spModel=gv('en-digi-sp-model');
    var spLock=gv('en-digi-sp-lock');
    var pcModel=gv('en-digi-pc-model');
    var netbank=gv('en-digi-netbank');
    var email=gv('en-digi-email');
    var sns=gv('en-digi-sns');
    if(spModel){HW_ROWS.push({cat:'📱 スマートフォン',name:esc(spModel),hint:esc(spLock)||'',cols:['パスコード・暗証番号']});}
    if(pcModel){HW_ROWS.push({cat:'💻 パソコン',name:esc(pcModel),hint:'',cols:['ログインパスワード']});}
    if(netbank){
      var banks=netbank.split(/[,、・\n]+/).map(function(s){return s.trim();}).filter(Boolean);
      banks.forEach(function(b){HW_ROWS.push({cat:'🏦 ネット銀行・証券',name:esc(b),hint:'',cols:['ログインID','パスワード']});});
    }
    if(email){
      var emails=email.split(/[,、\n]+/).map(function(s){return s.trim();}).filter(Boolean);
      emails.forEach(function(e2){HW_ROWS.push({cat:'📧 メール・クラウド',name:esc(e2),hint:'',cols:['パスワード']});});
    }
    if(sns){
      var snsList=sns.split(/[,、・\n]+/).map(function(s){return s.trim();}).filter(Boolean);
      snsList.forEach(function(sv){HW_ROWS.push({cat:'🌐 SNS・サービス',name:esc(sv),hint:'',cols:['ID・ログイン情報','パスワード']});});
    }
    /* 手書き欄ブランクを追加（常に最低3行） */
    for(var bi=HW_ROWS.length;bi<3;bi++){HW_ROWS.push({cat:'',name:'',hint:'',cols:['ID','パスワード']});}

    var cellStyle='border:0.5px solid #bbb;padding:4px 6px;font-size:10.5px;';
    var blankStyle='border-bottom:1px solid #999;height:20px;min-width:60px;display:inline-block;width:88%;';
    h+='<div class="psec pnewpage">'
      +'<div class="enbsh">■ デジタル遺品 — パスコード・パスワード記入欄（手書き）</div>'
      +'<div style="font-size:10px;color:#C00;background:#FFF5F5;border:0.5px solid #FFCDD2;border-radius:4px;padding:6px 10px;margin-bottom:8px;line-height:1.7">'
      +'⚠️ このページには<strong>印刷後に手書き</strong>でパスコード・パスワードを記入してください。記入後は金庫・鍵付き引き出しなど安全な場所に保管し、信頼できる家族か専門家への預け入れもご検討ください。'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse;font-size:10.5px">'
      +'<thead><tr>'
      +'<th style="'+cellStyle+'background:#eef4fb;color:#0c447c;width:22%">種別</th>'
      +'<th style="'+cellStyle+'background:#eef4fb;color:#0c447c;width:28%">機器・サービス名</th>'
      +'<th style="'+cellStyle+'background:#eef4fb;color:#0c447c;width:50%">パスコード・ID・パスワード（手書き）</th>'
      +'</tr></thead><tbody>';
    HW_ROWS.forEach(function(row){
      var pwCells=row.cols.map(function(lbl){
        return '<div style="margin-bottom:4px;font-size:9.5px;color:#555">'+lbl+'：<span style="'+blankStyle+'"></span></div>';
      }).join('');
      h+='<tr>'
        +'<td style="'+cellStyle+'color:#333">'+row.cat+'</td>'
        +'<td style="'+cellStyle+'color:#111">'+(row.name||'　')+(row.hint?'<br><span style="font-size:9.5px;color:#888">（'+row.hint+'）</span>':'')+'</td>'
        +'<td style="'+cellStyle+'padding:6px 8px">'+pwCells+'</td>'
        +'</tr>';
    });
    h+='</tbody></table>'
      +'<div style="margin-top:6px;font-size:9.5px;color:#999">※ 記入日：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日　　更新日：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>'
      +'</div>';
  })();
  if(D_OBIT.length>0){
    h+='<div class="psec"><div class="enbsh">■ 訃報をお伝えしたい方</div>'
      +'<table class="cttbl"><thead><tr>'
      +'<th style="width:25%">氏名</th><th style="width:15%">関係性</th>'
      +'<th style="width:30%">電話番号 / メール</th><th style="width:28%">備考</th>'
      +'</tr></thead><tbody>';
    D_OBIT.forEach(function(o){h+='<tr><td>'+esc(o.name)+'</td><td>'+esc(o.rel)+'</td><td>'+esc(o.tel)+'</td><td>'+esc(o.note)+'</td></tr>';});
    h+='</tbody></table></div>';
  }
  if(D_PET.length>0){
    h+='<div class="psec"><div class="enbsh">■ ペットについて</div>'
      +'<table class="cttbl"><thead><tr>'
      +'<th style="width:11%">名前</th><th style="width:9%">種類</th><th style="width:7%">年齢</th>'
      +'<th style="width:22%">かかりつけ獣医</th><th style="width:13%">獣医TEL</th>'
      +'<th style="width:22%">引き取り先</th><th style="width:14%">引き取りTEL</th>'
      +'</tr></thead><tbody>';
    D_PET.forEach(function(p){
      h+='<tr><td>'+esc(p.name)+'</td><td>'+esc(p.species)+'</td><td>'+esc(p.age)+'</td><td>'+esc(p.vet)+'</td><td>'+esc(p.vettel)+'</td><td>'+esc(p.heir)+'</td><td>'+esc(p.heirtel)+'</td></tr>';
      if(p.note)h+='<tr><td colspan="7" style="font-size:10px;color:#555;background:#fafafa;padding:3px 6px">備考：'+esc(p.note)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  if(FGUEST_NONE){
    h+='<div class="psec"><div class="enbsh">■ 葬儀に呼んでほしい方</div>'
      +'<div style="font-size:11px;padding:6px 8px;border:0.5px solid #ccc">誰も呼ばなくて良い（直葬・家族のみ等）</div></div>';
  } else if(D_FGUEST.length>0){
    h+='<div class="psec"><div class="enbsh">■ 葬儀に呼んでほしい方</div>'
      +'<table class="cttbl"><thead><tr>'
      +'<th style="width:34%">氏名</th><th style="width:22%">関係性</th>'
      +'<th style="width:42%">連絡先（電話・メール）</th>'
      +'</tr></thead><tbody>';
    D_FGUEST.forEach(function(g){
      h+='<tr><td>'+esc(g.name)+'</td><td>'+esc(g.rel)+'</td><td>'+esc(g.tel)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  h+='<div class="psec"><div class="enbsh">■ 大切な人へのメッセージ</div><div class="enmsg">'+(esc(gv('en-msg'))||'（未記入）')+'</div></div>';

  if(D_KEIMI.length>0){
    h+='<div class="psec"><div class="enbsh">■ 形見分け・譲り先リスト</div>'
      +'<table class="cttbl"><thead><tr>'
      +'<th style="width:30%">品物・内容</th>'
      +'<th style="width:28%">渡してほしい方</th>'
      +'<th style="width:40%">備考・メモ</th>'
      +'</tr></thead><tbody>';
    D_KEIMI.forEach(function(k){
      h+='<tr><td>'+esc(k.item)+'</td><td>'+esc(k.recipient)+'</td><td>'+esc(k.note)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }

  h+='</div>';

  /* ===== ⑤ 契約一覧 ===== */
  h+='<div class="pnewpage">'
    +'<div style="font-size:14px;font-weight:bold;text-align:center;margin-bottom:5px;letter-spacing:.06em">生前契約・解約が必要な契約一覧</div>'
    +'<div style="text-align:right;font-size:11px;color:#555;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:8px">氏名：'+esc(name)+'　　作成日：'+esc(date)+'</div>';
  CT_GROUPS.forEach(function(grp){
    var actIds=grp.ids.filter(function(id){return CT_STATE[id]&&CT_STATE[id].active;});
    if(!actIds.length){
      h+='<div class="psh" style="margin-top:4px">■ '+grp.label+'</div>';
      h+='<div style="font-size:10px;color:#999;padding:3px 9px">（なし）</div>';
      return;
    }
      var isDocGrp=actIds.every(function(id){return ctDef(id).type==='doc';});
      var isSubscGrp=actIds.every(function(id){return ctDef(id).type==='subsc';});
      h+='<div class="psh" style="margin-top:6px">■ '+grp.label+'</div>';
      if(isDocGrp){
        h+='<table class="cttbl"><thead><tr><th style="width:40%">種類</th><th>保管場所</th></tr></thead><tbody>';
        actIds.forEach(function(id){
          var def=ctDef(id),st=CT_STATE[id];
          h+='<tr><td style="font-weight:bold">'+esc(def.label)+'</td><td>'+esc(st.loc||'（未記入）')+'</td></tr>';
        });
        h+='</tbody></table>';
      }else if(isSubscGrp){
        h+='<table class="cttbl"><thead><tr>'
          +'<th style="width:18%">サービス名</th>'
          +'<th style="width:32%">メールアドレス・電話番号</th>'
          +'<th style="width:22%">パスワード（手書き）</th>'
          +'<th style="width:26%">視聴状況</th>'
          +'</tr></thead><tbody>';
        actIds.forEach(function(id){
          var def=ctDef(id),st=CT_STATE[id],e=st.entries[0];
          h+='<tr><td style="font-weight:bold">'+esc(def.label)+'</td><td>'+esc(e.co)+'</td><td style="border-bottom:1px solid #aaa">&nbsp;</td><td>'+esc(e.loc)+'</td></tr>';
        });
        h+='</tbody></table>';
      }else if(actIds.some(function(id){return ctDef(id).type==='card';})){
        /* クレジットカード専用 */
        h+='<table class="cttbl"><thead><tr>'
          +'<th style="width:18%">会社名</th>'
          +'<th style="width:12%">ブランド</th>'
          +'<th style="width:12%">下4桁</th>'
          +'<th style="width:16%">連絡先</th>'
          +'<th>カード払いの内容</th>'
          +'</tr></thead><tbody>';
        actIds.forEach(function(id){
          var st=CT_STATE[id];
          st.entries.forEach(function(e){
            if(!e.co&&!e.brand&&!e.num&&!e.tel&&!e.cardUsage)return;
            var usage=e.cardUsage||'';
            var detail=usage==='定期的な支払いをクレカでしている'&&e.cardUsageDetail?' （'+esc(e.cardUsageDetail)+'）':'';
            h+='<tr><td>'+esc(e.co)+'</td><td>'+esc(e.brand)+'</td><td>'+esc(e.num)+'</td><td>'+esc(e.tel)+'</td><td>'+esc(usage)+detail+'</td></tr>';
          });
        });
        h+='</tbody></table>';
      }else if(actIds.some(function(id){return ctDef(id).type==='hoken';})){
        /* 保険専用 */
        h+='<table class="cttbl"><thead><tr>'
          +'<th style="width:16%">保険会社</th>'
          +'<th style="width:15%">種類</th>'
          +'<th style="width:14%">連絡先</th>'
          +'<th style="width:14%">証券番号</th>'
          +'<th style="width:14%">受取人</th>'
          +'<th style="width:14%">受取人TEL</th>'
          +'<th style="width:11%">関係</th>'
          +'</tr></thead><tbody>';
        actIds.forEach(function(id){
          var st=CT_STATE[id];
          st.entries.forEach(function(e){
            if(!e.memo&&!e.co&&!e.hokenType&&!e.policyNo&&!e.benefName)return;
            h+='<tr><td>'+esc(e.memo)+'</td><td>'+esc(e.hokenType)+'</td><td>'+esc(e.tel)+'</td><td>'+esc(e.policyNo)+'</td><td>'+esc(e.benefName)+'</td><td>'+esc(e.benefTel)+'</td><td>'+esc(e.benefRel)+'</td></tr>';
          });
        });
        h+='</tbody></table>';
      }else if(actIds.some(function(id){return ctDef(id).type==='shoken';})){
        /* 証券会社専用 */
        h+='<table class="cttbl"><thead><tr>'
          +'<th style="width:24%">証券会社名</th>'
          +'<th style="width:20%">支店（取扱店）</th>'
          +'<th style="width:22%">連絡先</th>'
          +'<th style="width:32%">お客様番号・ID</th>'
          +'</tr></thead><tbody>';
        actIds.forEach(function(id){
          var st=CT_STATE[id];
          st.entries.forEach(function(e){
            if(!e.co&&!e.branch&&!e.tel&&!e.num)return;
            h+='<tr><td>'+esc(e.co)+'</td><td>'+esc(e.branch)+'</td><td>'+esc(e.tel)+'</td><td>'+esc(e.num)+'</td></tr>';
          });
        });
        h+='</tbody></table>';
      }else{
        /* 通常 normal/multi */
        h+='<table class="cttbl"><thead><tr>'
          +'<th style="width:14%">種類</th><th style="width:16%">名称</th>'
          +'<th style="width:22%">会社名・機関名</th>'
          +'<th style="width:17%">連絡先</th>'
          +'<th style="width:16%">番号・ID</th>'
          +'<th style="width:13%">保管場所</th>'
          +'</tr></thead><tbody>';
        actIds.forEach(function(id){
          var def=ctDef(id),st=CT_STATE[id];
          var filled=st.entries.filter(function(e){return e.co||e.tel||e.num||e.loc||e.memo;});
          if(!filled.length){
            h+='<tr><td style="font-weight:bold">'+esc(def.label)+'</td><td colspan="5" style="color:#aaa">（詳細未入力）</td></tr>';
          }else{
            filled.forEach(function(e,ei){
              h+='<tr>'
                +'<td style="font-weight:bold">'+(ei===0?esc(def.label):'')+' </td>'
                +'<td>'+esc(e.memo)+'</td>'
                +'<td>'+esc(e.co)+'</td>'
                +'<td>'+esc(e.tel)+'</td>'
                +'<td>'+esc(e.num)+'</td>'
                +'<td>'+esc(e.loc)+'</td>'
                +'</tr>';
            });
          }
        });
        h+='</tbody></table>';
      }
  });
  /* ── 「なし」と確認済みの項目をグループ別にまとめて表示 ── */
  var noneGroups=[];
  CT_GROUPS.forEach(function(grp){
    var noneIds=grp.ids.filter(function(id){return CT_STATE[id]&&!CT_STATE[id].active;});
    if(noneIds.length){
      noneGroups.push({label:grp.label,labels:noneIds.map(function(id){return ctDef(id).label;})});
    }
  });
  if(noneGroups.length){
    h+='<div class="psh" style="margin-top:10px;background:#f5f5f5;color:#555;border-left-color:#aaa">■ 契約なし（確認済み）</div>';
    h+='<table class="cttbl"><thead><tr><th style="width:28%">グループ</th><th>契約なしを確認した項目</th></tr></thead><tbody>';
    noneGroups.forEach(function(g){
      h+='<tr><td style="font-weight:bold;color:#555">'+esc(g.label)+'</td><td style="color:#555">'+g.labels.join('　／　')+'</td></tr>';
    });
    h+='</tbody></table>';
  }
  h+='<div class="pnotice" style="margin-top:14px">※本書類は参考資料です。定期的に内容を見直してください。</div>'
    +'</div>';

  /* ===== ⑥ 医療に関する希望（事前指示書） ===== */
  function advRow(label,sec){
    var v=ADV[sec]||'';
    var opts=ADV_OPTS[sec]||[];
    var rows='';
    if(!v){
      rows='<div style="font-size:10.5px;color:#aaa;font-style:italic">（未回答）</div>';
    } else {
      opts.forEach(function(o){
        var isSel=(v===o);
        var suffix='';
        if(isSel){
          if(o==='判断は家族に任せます'&&ADV[sec+'Family'])suffix=' （'+ADV[sec+'Family']+'）';
          else if(o==='その他'&&ADV[sec+'Other'])suffix='：'+ADV[sec+'Other'];
          else if(sec==='organ'&&o==='臓器提供を希望します（一部のみ）'&&ADV.organPartial)suffix=' （希望臓器：'+ADV.organPartial+'）';
          else if(sec==='body'&&o==='献体を希望します'){
            if(ADV.bodyWishUniv)suffix+=' （希望先：'+ADV.bodyWishUniv;
            if(ADV.bodyWishContact)suffix+=(ADV.bodyWishUniv?'　':' （')+'連絡先：'+ADV.bodyWishContact;
            if(ADV.bodyWishUniv||ADV.bodyWishContact)suffix+='）';
          }
          else if(sec==='body'&&o==='既に献体登録済みです'){
            if(ADV.bodyReg)suffix+=' （大学名：'+ADV.bodyReg;
            if(ADV.bodyRegContact)suffix+=(ADV.bodyReg?'　':' （')+'連絡先：'+ADV.bodyRegContact;
            if(ADV.bodyReg||ADV.bodyRegContact)suffix+='）';
          }
        }
        var rowBg=isSel?'background:#f0fbf5;':'';
        var markColor=isSel?'color:#1D9E75;font-size:13px':'color:#ccc;font-size:13px';
        var textStyle=isSel?'font-size:11px;font-weight:bold;color:#0a5c3d':'font-size:10.5px;color:#666';
        rows+='<div style="display:flex;align-items:flex-start;gap:6px;padding:3px 5px;border-radius:2px;'+rowBg+'">'
          +'<span style="'+markColor+';flex-shrink:0;line-height:1.4">'+(isSel?'☑':'☐')+'</span>'
          +'<span style="'+textStyle+';line-height:1.5">'+esc(o)+esc(suffix)+'</span>'
          +'</div>';
      });
    }
    return '<tr><td style="padding:6px 10px;font-size:11px;font-weight:bold;color:#444;white-space:nowrap;border-bottom:1px solid #eee;width:32%;vertical-align:top;background:#f7f7f7">'+label+'</td>'
      +'<td style="padding:4px 8px;border-bottom:1px solid #eee">'+rows+'</td></tr>';
  }
  h+='<div class="pnewpage">'
    +'<div style="font-size:14px;font-weight:bold;text-align:center;margin-bottom:5px;letter-spacing:.06em">私の診療に関する希望書（事前指示書）</div>'
    +'<div style="text-align:right;font-size:11px;color:#555;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:12px">氏名：'+esc(name)+'　　作成日：'+esc(date)+'</div>'
    +'<div style="font-size:11px;color:#444;line-height:1.8;background:#f8f8f8;border-left:3px solid #1D9E75;padding:10px 12px;margin-bottom:16px;border-radius:0 4px 4px 0">'
    +'私および私の家族（身元保証人含む）は、私の具合が悪くなり、死期が近く、このまま何も治療をしなければ救命することはできないが、治療しても私が希望する健康状態までの回復は期待できず、かつ自分で意思表示ができなくなったと判断されたときには、以下のように考えていただくようにお願いします。'
    +'ただしここに書かれたことは現在私が考えていることであり、私の意思で今後変更することもあります。<br>'
    +'<strong>※ 予期しない突発的な事故（交通事故・転倒・窒息等）の場合は、ここに書かれた内容によらず、通常の医療をお願いします。</strong>'
    +'</div>'
    +'<table style="width:100%;border-collapse:collapse;border:1px solid #ddd;margin-bottom:16px">'
    +advRow('最期を迎える場所の希望','place')
    +advRow('心肺蘇生（CPR）','cpr')
    +advRow('注射（中心静脈栄養）','injection')
    +advRow('栄養（胃管・胃瘻）','nutrition')
    +advRow('輸血','blood')
    +advRow('臓器提供','organ')
    +advRow('献体','body')
    +'</table>'
    +(ADV.other?'<div style="margin-bottom:16px"><div style="font-weight:bold;font-size:11px;margin-bottom:4px;color:#0F6E56">その他の希望</div><div style="font-size:11px;line-height:1.8;border:1px solid #ddd;padding:8px 10px;border-radius:4px">'+esc(ADV.other)+'</div></div>':'')
    +'<div style="margin-top:40px;padding-top:16px;border-top:1px solid #ccc">'
    +'<table style="width:100%;border-collapse:collapse">'
    +'<tr>'
    +'<td style="font-size:12px;padding:6px 0;width:55%">令和&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</td>'
    +'<td style="font-size:12px;padding:6px 0">本人署名</td>'
    +'</tr>'
    +'<tr>'
    +'<td></td>'
    +'<td style="border-bottom:1px solid #888;height:52px;min-width:180px;position:relative">'
    +'<span style="position:absolute;right:6px;bottom:5px;font-size:10px;color:#888">（実印）</span>'
    +'</td>'
    +'</tr>'
    +'</table>'
    +'</div>'
    +'</div>';

  /* ===== ⑥ 処方箋（アドバイス） ===== */
  var advItems=buildAdvice();
  h+='<div class="pnewpage">'
    +'<div class="psec-hd">処 方 箋 ― 必 要 な 対 策</div>'
    +'<div class="pmeta">氏名：'+esc(name)+'　　作成日：'+esc(date)+'</div>'
    +'<div style="margin-bottom:14px;font-size:11px;color:#555;line-height:1.7;background:#f8faff;border-left:3px solid #185FA5;padding:8px 12px;border-radius:0 4px 4px 0">'
    +'入力内容をもとに、あなたに必要な終活対策をご案内します。優先度の高い項目から専門家にご相談ください。'
    +'</div>'
    +'<table style="width:100%;border-collapse:collapse;font-size:11px">'
    +'<thead><tr>'
    +'<th style="background:#e8f0fb;border:0.5px solid #bbb;padding:5px 8px;width:18%;color:#0c447c;font-weight:bold;text-align:center">優先度</th>'
    +'<th style="background:#e8f0fb;border:0.5px solid #bbb;padding:5px 8px;color:#0c447c;font-weight:bold">対策内容</th>'
    +'</tr></thead>'
    +'<tbody>'
    +advItems.map(function(a){
      var bgTd=a.p==='phi'?'#fff5f3':a.p==='pme'?'#fffbf0':'#f2fbf7';
      var bgBadge=a.p==='phi'?'#FAECE7':a.p==='pme'?'#FAEEDA':'#E1F5EE';
      var fgBadge=a.p==='phi'?'#993C1D':a.p==='pme'?'#854F0B':'#0F6E56';
      return '<tr style="page-break-inside:avoid">'
        +'<td style="border:0.5px solid #ccc;padding:7px 8px;text-align:center;vertical-align:middle;background:'+bgTd+'">'
        +'<span style="display:inline-block;background:'+bgBadge+';color:'+fgBadge+';font-size:10px;font-weight:bold;padding:3px 7px;border-radius:10px;white-space:nowrap">'+a.l+'</span>'
        +'</td>'
        +'<td style="border:0.5px solid #ccc;padding:7px 10px;line-height:1.7;color:#222;background:'+bgTd+'">'+esc(a.t)+'</td>'
        +'</tr>';
    }).join('')
    +'</tbody></table>'
    +'<div style="margin-top:20px;padding:10px 14px;background:#f8f8f8;border:0.5px solid #ccc;border-radius:4px;font-size:9.5px;color:#888;line-height:1.7">'
    +'本処方箋の内容はあくまで参考情報であり、法的効力を持ちません。具体的な手続きについては'+esc(_wlName)+'（TEL: '+esc(_wlTel)+' / '+esc(_wlHpDisp)+'）または各専門家にご相談ください。'
    +'</div>'
    +'</div>';

  return h;
}

var D_PET=[];
var PET_SPECIES=['犬','猫','鳥','魚','うさぎ','ハムスター','爬虫類','その他'];


var D_OBIT = [];
var OBIT_REL = ['家族','親族','友人・知人','職場関係','近隣','恩師','その他'];

var D_KEIMI = [];

function addKeimi(){
  D_KEIMI.push({item:'',recipient:'',note:''});
  renderKeimi();
  var rows=document.querySelectorAll('.keimi-row');
  if(rows.length>0){var last=rows[rows.length-1];var inp=last.querySelector('input');if(inp)inp.focus();}
}
function removeKeimi(ri){D_KEIMI.splice(ri,1);renderKeimi();}
function renderKeimi(){
  var el=document.getElementById('keimi-list');if(!el)return;
  el.innerHTML='';
  if(D_KEIMI.length===0){
    el.innerHTML='<div style="font-size:12px;color:#888;padding:6px 0">「追加」ボタンで品物と渡してほしい方を入力してください。</div>';
    return;
  }
  var tbl=document.createElement('table');
  tbl.className='atbl';tbl.style.cssText='margin-bottom:4px';
  tbl.innerHTML='<thead><tr>'
    +'<th style="width:30%">品物・内容</th>'
    +'<th style="width:28%">渡してほしい方</th>'
    +'<th style="width:36%">備考・メモ</th>'
    +'<th style="width:26px"></th>'
    +'</tr></thead><tbody id="keimi-tbody"></tbody>';
  el.appendChild(tbl);
  var tb=document.getElementById('keimi-tbody');
  D_KEIMI.forEach(function(k,ri){
    var tr=document.createElement('tr');
    tr.className='keimi-row';
    var cols=[
      {tp:'text',val:k.item,ph:'例：形見の時計、アルバム',key:'item'},
      {tp:'text',val:k.recipient,ph:'例：長男・山田 太郎',key:'recipient'},
      {tp:'text',val:k.note,ph:'例：保管場所・伝言など',key:'note'},
    ];
    cols.forEach(function(col){
      var td=document.createElement('td');
      var inp=document.createElement('input');inp.type='text';inp.value=col.val||'';inp.placeholder=col.ph||'';
      inp.oninput=(function(ri2,k2){return function(e){D_KEIMI[ri2][k2]=e.target.value;};})(ri,col.key);
      td.appendChild(inp);tr.appendChild(td);
    });
    var dtd=document.createElement('td');
    var db=document.createElement('button');db.className='delbtn';db.textContent='×';
    db.onclick=(function(ri2){return function(){removeKeimi(ri2);};})(ri);
    dtd.appendChild(db);tr.appendChild(dtd);
    tb.appendChild(tr);
  });
}

var D_FGUEST = [];
var FGUEST_NONE = false;
var FGUEST_REL = ['家族','親族','友人・知人','職場関係','近隣','恩師','その他'];

function toggleFunGuestNone(){
  FGUEST_NONE = !FGUEST_NONE;
  renderFunGuests();
}

function addFunGuest(){
  FGUEST_NONE = false;
  D_FGUEST.push({name:'',rel:'友人・知人',tel:''});
  renderFunGuests();
  var rows=document.querySelectorAll('.fguest-row');
  if(rows.length>0){var last=rows[rows.length-1];var inp=last.querySelector('input');if(inp)inp.focus();}
}

function removeFunGuest(ri){D_FGUEST.splice(ri,1);renderFunGuests();}

function renderFunGuests(){
  var noneBtn=document.getElementById('fguest-none-lbl');
  var noneCi=document.getElementById('fguest-none-ci');
  var addBtn=document.getElementById('fguest-add-btn');
  var el=document.getElementById('fguest-list');
  if(!el)return;
  if(noneBtn){
    noneBtn.className='cb'+(FGUEST_NONE?' none-sel':'');
    noneBtn.onclick=toggleFunGuestNone;
    if(noneCi)noneCi.textContent=FGUEST_NONE?'✓':'';
  }
  if(addBtn)addBtn.style.display=FGUEST_NONE?'none':'';
  el.innerHTML='';
  if(FGUEST_NONE){el.innerHTML='<div style="font-size:12px;color:#888;padding:4px 0">葬儀の参列者なし（直葬・家族のみ等）</div>';return;}
  if(D_FGUEST.length===0){el.innerHTML='<div style="font-size:12px;color:#888;padding:4px 0">「追加」ボタンで連絡してほしい方を入力できます。</div>';return;}
  var tbl=document.createElement('table');
  tbl.className='atbl';tbl.style.cssText='margin-bottom:4px';
  tbl.innerHTML='<thead><tr>'
    +'<th style="width:32%">氏名</th>'
    +'<th style="width:22%">関係性</th>'
    +'<th style="width:34%">連絡先（電話・メール）</th>'
    +'<th style="width:26px"></th>'
    +'</tr></thead><tbody id="fguest-tbody"></tbody>';
  el.appendChild(tbl);
  var tb=document.getElementById('fguest-tbody');
  D_FGUEST.forEach(function(g,ri){
    var tr=document.createElement('tr');
    tr.className='fguest-row';
    var relSel=FGUEST_REL.map(function(r){return '<option'+(g.rel===r?' selected':'')+'>'+r+'</option>';}).join('');
    var cols=[
      {tp:'text',val:g.name,ph:'例：山田 花子',key:'name'},
      {tp:'sel',val:g.rel,opts:relSel,key:'rel'},
      {tp:'text',val:g.tel,ph:'090-0000-0000',key:'tel'},
    ];
    cols.forEach(function(col){
      var td=document.createElement('td');
      if(col.tp==='sel'){
        var sel=document.createElement('select');sel.innerHTML=col.opts;
        sel.onchange=(function(ri2,k){return function(e){D_FGUEST[ri2][k]=e.target.value;};})(ri,col.key);
        td.appendChild(sel);
      }else{
        var inp=document.createElement('input');inp.type='text';inp.value=col.val||'';inp.placeholder=col.ph||'';
        inp.oninput=(function(ri2,k){return function(e){D_FGUEST[ri2][k]=e.target.value;};})(ri,col.key);
        td.appendChild(inp);
      }
      tr.appendChild(td);
    });
    var dtd=document.createElement('td');
    var db=document.createElement('button');db.className='delbtn';db.textContent='×';
    db.onclick=(function(ri2){return function(){removeFunGuest(ri2);};})(ri);
    dtd.appendChild(db);tr.appendChild(dtd);
    tb.appendChild(tr);
  });
}

function addObit(){
  D_OBIT.push({name:'',rel:'友人・知人',tel:'',note:''});
  renderObits();
  var rows=document.querySelectorAll('.obit-row');
  if(rows.length>0){var last=rows[rows.length-1];var inp=last.querySelector('input');if(inp)inp.focus();}
}

function removeObit(ri){D_OBIT.splice(ri,1);renderObits();}

function renderObits(){
  var el=document.getElementById('obit-list');if(!el)return;
  el.innerHTML='';
  if(D_OBIT.length===0){
    el.innerHTML='<div style="font-size:12px;color:#888;padding:6px 0">「連絡先を追加」ボタンで入力してください。</div>';
    return;
  }
  var tbl=document.createElement('table');
  tbl.className='atbl';tbl.style.cssText='margin-bottom:4px';
  tbl.innerHTML='<thead><tr>'
    +'<th style="width:26%">氏名</th>'
    +'<th style="width:18%">関係性</th>'
    +'<th style="width:30%">電話番号 / メールアドレス</th>'
    +'<th style="width:20%">備考（住所・メモ等）</th>'
    +'<th style="width:26px"></th>'
    +'</tr></thead><tbody id="obit-tbody"></tbody>';
  el.appendChild(tbl);
  var tb=document.getElementById('obit-tbody');
  D_OBIT.forEach(function(o,ri){
    var tr=document.createElement('tr');
    tr.className='obit-row';
    var relSel=OBIT_REL.map(function(r){return '<option'+(o.rel===r?' selected':'')+'>'+r+'</option>';}).join('');
    var cols=[
      {tp:'text',val:o.name,ph:'例：山田 花子',key:'name'},
      {tp:'sel',val:o.rel,opts:relSel,key:'rel'},
      {tp:'text',val:o.tel,ph:'090-0000-0000 / mail@example.com',key:'tel'},
      {tp:'text',val:o.note,ph:'例：旧住所・大学の友人',key:'note'},
    ];
    cols.forEach(function(col){
      var td=document.createElement('td');
      if(col.tp==='sel'){
        var sel=document.createElement('select');
        sel.innerHTML=col.opts;
        sel.onchange=(function(ri2,k){return function(e){D_OBIT[ri2][k]=e.target.value;};})(ri,col.key);
        td.appendChild(sel);
      }else{
        var inp=document.createElement('input');
        inp.type='text';inp.value=col.val||'';inp.placeholder=col.ph||'';
        inp.oninput=(function(ri2,k){return function(e){D_OBIT[ri2][k]=e.target.value;};})(ri,col.key);
        td.appendChild(inp);
      }
      tr.appendChild(td);
    });
    var dtd=document.createElement('td');
    var db=document.createElement('button');db.className='delbtn';db.textContent='×';
    db.onclick=(function(ri2){return function(){removeObit(ri2);};})(ri);
    dtd.appendChild(db);tr.appendChild(dtd);
    tb.appendChild(tr);
  });
}

function addPet(){
  D_PET.push({name:'',species:'犬',age:'',vet:'',vettel:'',heir:'',heirtel:'',note:''});
  renderPets();
  var rows=document.querySelectorAll('.pet-card');
  if(rows.length>0){
    var last=rows[rows.length-1];
    var inp=last.querySelector('input');
    if(inp)inp.focus();
  }
}

function removePet(ri){D_PET.splice(ri,1);renderPets();}

function renderPets(){
  var el=document.getElementById('pet-list');if(!el)return;
  el.innerHTML='';
  if(D_PET.length===0){
    el.innerHTML='<div style="font-size:12px;color:#888;padding:8px 0">ペットがいる場合は「ペットを追加」ボタンで入力してください。</div>';
    return;
  }
  D_PET.forEach(function(p,ri){
    var div=document.createElement('div');
    div.className='pet-card';
    div.style.cssText='background:var(--bg2);border:0.5px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:10px;position:relative';
    var selOpts=PET_SPECIES.map(function(s){
      return '<option value="'+s+'"'+(p.species===s?' selected':'')+'>'+s+'</option>';
    }).join('');
    div.innerHTML=
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
      +'<span style="font-size:12px;font-weight:600;color:var(--teal2)">ペット '+(ri+1)+'</span>'
      +'<button class="delbtn" onclick="removePet('+ri+')" title="削除">×</button></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">'
      +'<div class="en-fw"><span class="en-lbl">名前</span><input type="text" value="'+esc2(p.name)+'" placeholder="例：ポチ" oninput="D_PET['+ri+'].name=this.value"></div>'
      +'<div class="en-fw"><span class="en-lbl">種類</span><select onchange="D_PET['+ri+'].species=this.value">'+selOpts+'</select></div>'
      +'<div class="en-fw"><span class="en-lbl">年齢</span><input type="text" value="'+esc2(p.age)+'" placeholder="例：3歳" oninput="D_PET['+ri+'].age=this.value"></div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
      +'<div class="en-fw"><span class="en-lbl">かかりつけ獣医・病院名</span><input type="text" value="'+esc2(p.vet)+'" placeholder="例：△△動物病院" oninput="D_PET['+ri+'].vet=this.value"></div>'
      +'<div class="en-fw"><span class="en-lbl">獣医の電話番号</span><input type="text" value="'+esc2(p.vettel)+'" placeholder="052-000-0000" oninput="D_PET['+ri+'].vettel=this.value"></div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
      +'<div class="en-fw"><span class="en-lbl">死後の引き取り先（氏名・施設名）</span><input type="text" value="'+esc2(p.heir)+'" placeholder="例：山田 花子（長女）" oninput="D_PET['+ri+'].heir=this.value"></div>'
      +'<div class="en-fw"><span class="en-lbl">引き取り先の電話番号</span><input type="text" value="'+esc2(p.heirtel)+'" placeholder="090-0000-0000" oninput="D_PET['+ri+'].heirtel=this.value"></div>'
      +'</div>'
      +'<div class="en-fw"><span class="en-lbl">ペットについての備考・お願い</span>'
      +'<textarea style="min-height:56px" placeholder="例：毎日2回のえさやり。散歩は1日1回30分。アレルギーあり（〇〇不可）。" oninput="D_PET['+ri+'].note=this.value">'+esc2(p.note)+'</textarea></div>';
    el.appendChild(div);
  });
}

/* ===== XSS対策：HTML出力エスケープ関数群 =====
 *  esc2(s)  : input value="..." 属性用（&<>"をエスケープ）
 *  esc(s)   : 印刷HTML テキストコンテンツ用（&<>"をエスケープ、空値→&nbsp;）
 *  escH(s)  : printADV() 内ローカル定義（\n→<br>変換付き）
 * ============================================ */
function esc2(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function showPV(){
  var html=buildPrintHTML();
  document.getElementById('pvpage').innerHTML=html;
  var pp=document.getElementById('pvpanel');
  pp.style.display='block';
  pp.scrollIntoView({behavior:'smooth',block:'start'});
}
function printDirect(){
  _pdfExported=true;
  var html=buildPrintHTML();
  var name=document.getElementById('en-name')&&document.getElementById('en-name').value||'終活診断';
  var win=window.open('','_blank','width=900,height=700');
  if(!win){alert('ポップアップがブロックされています。ブラウザのポップアップ許可設定を確認してください。');return;}
  var CSS=[
    '*{box-sizing:border-box;margin:0;padding:0}',
    'body{background:white;color:#111;font-family:"Hiragino Kaku Gothic Pro","Meiryo","Yu Gothic",sans-serif;padding:0}',
    '.pcover{min-height:220mm;display:block;text-align:center;padding:60px 20px 32px}',
    '.pcover-office{font-size:13px;color:#555;letter-spacing:.08em;margin-bottom:16px}',
    '.pcover-line{width:60px;height:2px;background:#1D9E75;margin:0 auto 16px}',
    '.pcover-title{font-size:28px;font-weight:bold;letter-spacing:.15em;color:#111;margin-bottom:44px}',
    '.pcover-sub{font-size:13px;color:#1D9E75;letter-spacing:.05em;margin-bottom:36px}',
    '.pcover-card{display:inline-block;border:1px solid #ccc;border-radius:6px;padding:16px 32px;margin-bottom:32px;min-width:280px;background:#fafafa;text-align:left}',
    '.pcover-tbl{border-collapse:collapse;font-size:13px}',
    '.pcover-tbl td{padding:5px 14px;text-align:left}',
    '.pcover-tbl td:first-child{color:#555;font-weight:bold;white-space:nowrap}',
    '.pcover-contents{display:inline-block;text-align:left;background:#E1F5EE;border-radius:6px;padding:14px 20px;margin-bottom:28px;min-width:320px}',
    '.pcover-ctit{font-size:12px;font-weight:bold;color:#0F6E56;margin-bottom:6px}',
    '.pcover-clist{font-size:12px;color:#111;line-height:1.9}',
    '.pcover-notice{font-size:10px;color:#888;line-height:1.7;max-width:400px;margin:0 auto;text-align:center}',
    '.pnewpage{padding-top:2px}',
    '.psec-hd{font-size:15px;font-weight:bold;text-align:center;padding:8px 0 12px;margin-bottom:10px;border-bottom:2px solid #1D9E75;color:#0F6E56;letter-spacing:.05em}',
    '.heir-print-wrap{display:block;text-align:center;padding:12px 0}',
    '.ptit,.entit{font-size:18px;font-weight:bold;text-align:center;margin-bottom:5px;letter-spacing:.08em}',
    '.pmeta{text-align:right;font-size:11px;color:#555;border-bottom:1px solid #ccc;padding-bottom:8px;margin-bottom:14px}',
    '.psec{margin-bottom:11px;page-break-inside:avoid}',
    '.psh{font-size:11.5px;font-weight:bold;background:#e8f5f0;color:#0a5c3d;padding:4px 9px;border-left:3px solid #1D9E75}',
    '.enbsh{font-size:11.5px;font-weight:bold;background:#eef4fb;color:#0c447c;padding:4px 9px;border-left:3px solid #185FA5}',
    '.ptbl{width:100%;border-collapse:collapse;font-size:10.5px}',
    '.ptbl th{background:#f0f0f0;border:0.5px solid #bbb;padding:4px 7px;font-weight:bold;text-align:left}',
    '.ptbl td{border:0.5px solid #ccc;padding:3px 7px}',
    '.ptbl tr{page-break-inside:avoid}',
    '.ptbl .num{text-align:right}',
    '.ptbl .sub td{background:#e8f5f0;font-weight:bold;font-size:11px}',
    '.ptbl .empty td{color:#aaa;font-style:italic}',
    '.entbl{width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed}',
    '.entbl td{border:0.5px solid #ccc;padding:4px 8px;vertical-align:top}',
    '.entbl tr{page-break-inside:avoid}',
    '.entbl .el{width:140px;background:#f7f7f7;font-weight:bold;color:#333;word-break:break-all}',
    '.cttbl{width:100%;border-collapse:collapse;font-size:10px}',
    '.cttbl th{background:#eef4fb;border:0.5px solid #bbb;padding:3px 5px;font-weight:bold;color:#0c447c;text-align:left}',
    '.cttbl td{border:0.5px solid #ccc;padding:3px 5px;color:#111;vertical-align:top}',
    '.cttbl tr{page-break-inside:avoid}',
    '.cttbl tr:nth-child(even) td{background:#fafafa}',
    '.cttbl .tp{font-weight:bold;background:#f0f6ff!important}',
    '.pfooter{margin-top:12px;border-top:2px solid #444;padding-top:10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;page-break-inside:avoid}',
    '.pfbox{border:0.5px solid #ccc;padding:9px;text-align:center}',
    '.pfl{font-size:10px;color:#666;margin-bottom:2px}',
    '.pfv{font-size:15px;font-weight:bold}',
    '.pfv.pos{color:#0a5c3d}',
    '.pfv.neg{color:#C0392B}',
    '.pnotice{margin-top:10px;font-size:9.5px;color:#999;text-align:center}',
    '.phr{border:none;border-top:1px solid #ccc;margin:16px 0}',
    '.enmsg{border:0.5px solid #ccc;padding:10px;min-height:60px;font-size:11px;white-space:pre-wrap}',
    '@page{size:A4 portrait;margin:15mm 12mm}',
    '@media print{body{padding:0}.pnewpage{page-break-before:always}}'
  ].join('');
  win.document.write('<!DOCTYPE html><html lang="ja"><head>'
    +'<meta charset="UTF-8">'
    +'<title>'+name+' 終活診断書</title>'
    +'<style>'+CSS+'</style>'
    +'</head><body>'
    +'<div style="padding:0 12px">'
    +html
    +'</div>'
    +'</body></html>');
  win.document.close();
  win.focus();
  setTimeout(function(){win.print();},600);
}{document.getElementById('pvpanel').style.display='none';}
rRadio('r-mar',['未婚','既婚','離婚','死別'],'mar',renderProxy);
rRadio('r-par',['両方存命','一方存命','両方故人'],'par',function(){renderProxy();renderGpar();});
renderSibTypeCounters();
rChecksDone();rChecks('worry-list','worry',WORRY_OPTS);
rRadioEN('r-fun',['一般葬','家族葬','直葬（火葬のみ）','お任せ'],'fun');
rRadioEN('r-grave',['先祖の墓','新規購入','納骨堂','樹木葬','散骨','収骨しない','その他'],'grave',renderGraveDetail);
    rRadioEN('r-ossuary-contract',['契約済み','契約予定あり','まだない'],'ossuaryContract');
    rRadioEN('r-nature-contract',['契約済み','契約予定あり','まだない'],'natureContract');
    rRadioEN('r-estimate',['あり','なし','検討中'],'estimate');
rRadioEN('r-mutual',['加入あり','加入なし','検討中'],'mutual');
function updatePortraitDetail(){
  var v=EN['portrait']||'未準備';
  var r=document.getElementById('portrait-detail-ready');
  var p=document.getElementById('portrait-detail-photo');
  if(r)r.style.display=(v==='準備済み')?'':'none';
  if(p)p.style.display=(v==='未準備')?'':'none';
}
rRadioEN('r-portrait',['準備済み','未準備','遺影の必要なし'],'portrait',updatePortraitDetail);
(function(){updatePortraitDetail();})();
function renderGraveDetail(){
  var g=EN['grave']||'先祖の墓';
  var secTemple=document.getElementById('grave-detail-temple');
  var secOssuary=document.getElementById('grave-detail-ossuary');
  var secNature=document.getElementById('grave-detail-nature');
  var secOther=document.getElementById('grave-detail-other');
  var secNobone=document.getElementById('grave-detail-nobone');
  if(secTemple)secTemple.style.display=(g==='先祖の墓')?'':'none';
  if(secOssuary)secOssuary.style.display=(g==='納骨堂')?'':'none';
  if(secNature)secNature.style.display=(g==='樹木葬'||g==='散骨')?'':'none';
  if(secOther)secOther.style.display=(g==='その他')?'':'none';
  if(secNobone)secNobone.style.display=(g==='収骨しない')?'':'none';
  /* 散骨のみ 海域欄の表示切替 */
  var secSea=document.getElementById('grave-sea-wrap');
  if(secSea)secSea.style.display=(g==='散骨')?'':'none';
  /* 樹木葬/散骨のラベル切替 */
  var lbl=document.getElementById('nature-type-lbl');
  if(lbl)lbl.textContent=(g==='散骨'?'散骨':'樹木葬')+'について';
}
(function(){renderGraveDetail();})();
function updateMutualDetail(){var w=document.getElementById('en-mutual-detail-wrap');if(w)w.style.display=EN['mutual']==='加入あり'?'':'none';}
/* 互助会詳細の初期非表示 */
(function(){var w=document.getElementById('en-mutual-detail-wrap');if(w)w.style.display='none';})();
/* r-mutual 切替時に詳細表示制御 */
(function(){var el=document.getElementById('r-mutual');if(!el)return;var obs=new MutationObserver(updateMutualDetail);obs.observe(el,{childList:true,subtree:true});})();
renderAsecs();ctRender();renderPets();renderObits();renderFunGuests();renderKeimi();renderGpar();
/* ③ en-date デフォルト：今日の日付（和暦） */
(function(){
  var el=document.getElementById('en-date');
  if(el&&!el.value){
    var d=new Date(),y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate();
    var wareki='';if(y>=2019){wareki='令和'+(y-2018);}else if(y>=1989){wareki='平成'+(y-1988);}else{wareki=y+'年';}
    el.value=wareki+'年'+m+'月'+day+'日';
  }
})();

/* ④ en-birth: セレクト3つで生年月日入力（iOS/Android ドラムロール対応） */
(function(){
  var selY=document.getElementById('en-birth-y');
  var selM=document.getElementById('en-birth-m');
  var selD=document.getElementById('en-birth-d');
  var hidden=document.getElementById('en-birth');
  if(!selY||!selM||!selD||!hidden)return;

  /* 和暦変換 */
  function getEraName(year){
    if(year>=2019)return '令和'+(year===2019?'元':year-2018);
    if(year>=1989)return '平成'+(year===1989?'元':year-1988);
    if(year>=1926)return '昭和'+(year===1926?'元':year-1925);
    if(year>=1912)return '大正'+(year===1912?'元':year-1911);
    return '明治'+(year-1867);
  }

  /* 年の選択肢：今年〜1900年（西暦＋和暦併記） */
  var thisYear=new Date().getFullYear();
  var fY=document.createDocumentFragment();
  var bY=document.createElement('option');bY.value='';bY.textContent='年';fY.appendChild(bY);
  for(var y=thisYear;y>=1900;y--){
    var oy=document.createElement('option');oy.value=y;oy.textContent=y+'年（'+getEraName(y)+'年）';fY.appendChild(oy);
  }
  selY.appendChild(fY);

  /* 月の選択肢：1〜12月 */
  var fM=document.createDocumentFragment();
  var bM=document.createElement('option');bM.value='';bM.textContent='月';fM.appendChild(bM);
  for(var mo=1;mo<=12;mo++){
    var om=document.createElement('option');om.value=mo;om.textContent=mo+'月';fM.appendChild(om);
  }
  selM.appendChild(fM);

  /* 日の選択肢を年・月に合わせて動的更新（うるう年対応） */
  function updateDays(){
    var vy=parseInt(selY.value)||0;
    var vm=parseInt(selM.value)||0;
    var prevD=selD.value;
    var maxD=(vy&&vm)?new Date(vy,vm,0).getDate():31;
    var fD=document.createDocumentFragment();
    var bD=document.createElement('option');bD.value='';bD.textContent='日';fD.appendChild(bD);
    for(var d=1;d<=maxD;d++){
      var od=document.createElement('option');od.value=d;od.textContent=d+'日';fD.appendChild(od);
    }
    selD.innerHTML='';selD.appendChild(fD);
    if(prevD&&parseInt(prevD)<=maxD)selD.value=prevD;
  }
  updateDays();

  /* 3つの値が揃ったら hidden input に「YYYY年M月D日」形式で書き込む */
  function syncHidden(){
    var vy=selY.value,vm=selM.value,vd=selD.value;
    hidden.value=(vy&&vm&&vd)?(vy+'年'+vm+'月'+vd+'日'):'';
  }

  /* 生年月日から現在の満年齢を計算して表示 */
  function updateAge(){
    var vy=parseInt(selY.value)||0;
    var vm=parseInt(selM.value)||0;
    var vd=parseInt(selD.value)||0;
    var disp=document.getElementById('en-age-display');
    if(!disp)return;
    if(!vy||!vm||!vd){disp.textContent='満 -- 歳';return;}
    var today=new Date();
    var age=today.getFullYear()-vy;
    var mDiff=(today.getMonth()+1)-vm;
    if(mDiff<0||(mDiff===0&&today.getDate()<vd))age--;
    disp.textContent='満 '+age+' 歳';
  }

  selY.addEventListener('change',function(){updateDays();syncHidden();updateAge();});
  selM.addEventListener('change',function(){updateDays();syncHidden();updateAge();});
  selD.addEventListener('change',function(){syncHidden();updateAge();});

  })();

/* ── 推定相続税の簡易計算 ──
   課税遺産総額（資産+生命保険の課税対象分−負債−基礎控除）を法定相続分で分配し、
   各取得金額に相続税の速算表を適用して総額を算出する（簡易シミュレーションです） */
var TAX_BRACKETS=[
  {max:10000000,  rate:0.10,deduct:0},
  {max:30000000,  rate:0.15,deduct:500000},
  {max:50000000,  rate:0.20,deduct:2000000},
  {max:100000000, rate:0.30,deduct:7000000},
  {max:200000000, rate:0.40,deduct:17000000},
  {max:300000000, rate:0.45,deduct:27000000},
  {max:600000000, rate:0.50,deduct:42000000},
  {max:Infinity,  rate:0.55,deduct:72000000}
];
function _taxForShare(amt){
  if(amt<=0)return 0;
  for(var i=0;i<TAX_BRACKETS.length;i++){
    if(amt<=TAX_BRACKETS[i].max)return Math.max(0,amt*TAX_BRACKETS[i].rate-TAX_BRACKETS[i].deduct);
  }
  return 0;
}
function getTotalAssets(){return stot('re')+stot('bk')+stot('sc')+stot('vc')+stot('ot');}
function getTotalDebt(){return stot('db');}
function estimateInheritanceTax(){
  var heirs=getHeirShares();
  var heirCount=heirs.length;
  if(heirCount===0)return 0;
  var totalAssets=getTotalAssets();
  var dbTot=getTotalDebt();
  var insTot=stot('ins');
  var taxableIns=Math.max(0,insTot-5000000*heirCount);
  var basicDeduction=30000000+6000000*heirCount;
  var taxableBase=Math.max(0,(totalAssets+taxableIns-dbTot)-basicDeduction);
  if(taxableBase<=0)return 0;
  var total=0;
  heirs.forEach(function(h){total+=_taxForShare(taxableBase*h.n/h.d);});
  return Math.round(total);
}

/* 家族構成の概要テキストを生成（スプレッドシート記録用） */
function buildFamilySummary(){
  var parts=[];
  parts.push('婚姻：'+(D.mar||'-'));
  parts.push('子：'+(D.ch||0)+'人');
  parts.push('両親：'+(D.par||'-'));
  if(D.par==='両方故人'&&D.gpar&&D.gpar!=='祖父母共に故人')parts.push('祖父母：'+D.gpar);
  var ns=getTotalSib();
  if(ns>0)parts.push('兄弟姉妹：'+ns+'人');
  var heirs=getHeirShares();
  parts.push('法定相続人数：'+heirs.length+'人');
  return parts.join('／');
}

/* 「診断結果」列に保存する読みやすい要約テキストを生成
   （家族構成・資産負債・推定相続税・処方箋（#alist）の内容をまとめる） */
function buildDiagnosisResultText(){
  var lines=[];
  lines.push(buildFamilySummary());
  lines.push('資産総額：'+getTotalAssets().toLocaleString()+'円／負債総額：'+getTotalDebt().toLocaleString()+'円／推定相続税：'+estimateInheritanceTax().toLocaleString()+'円');
  var alistEl=document.getElementById('alist');
  if(alistEl){
    var items=Array.prototype.map.call(alistEl.querySelectorAll('li'),function(li){return (li.innerText||li.textContent||'').trim();}).filter(Boolean);
    if(items.length){
      lines.push('【処方箋】');
      items.forEach(function(t,i){lines.push((i+1)+'. '+t);});
    }
  }
  return lines.join('\n');
}

/* 汎用：ラジオ/チェックボックスのレンダリング（既存の.rb/.cb/.ciスタイルを利用） */
function lcRenderRadio(elId,opts,getCur,setCur){
  var el=document.getElementById(elId);if(!el)return;
  el.innerHTML='';
  opts.forEach(function(o){
    var b=document.createElement('label');
    b.className='rb'+(getCur()===o?' sel':'');
    b.innerHTML='<input type="radio">'+o;
    b.onclick=function(){setCur(o);lcRenderRadio(elId,opts,getCur,setCur);};
    el.appendChild(b);
  });
}
function lcRenderChecks(elId,opts,getArr){
  var el=document.getElementById(elId);if(!el)return;
  el.innerHTML='';
  opts.forEach(function(o){
    var sel=getArr().indexOf(o)>-1;
    var b=document.createElement('div');
    b.className='cb'+(sel?' sel':'');
    b.innerHTML='<div class="ci">'+(sel?'✓':'')+'</div><span>'+o+'</span>';
    b.onclick=function(){
      var arr=getArr();var i=arr.indexOf(o);
      if(i>-1)arr.splice(i,1);else arr.push(o);
      lcRenderChecks(elId,opts,getArr);
    };
    el.appendChild(b);
  });
}

