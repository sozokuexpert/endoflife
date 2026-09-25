
(function(){
  'use strict';
  var STORAGE_KEY='wl_office_data';
  var PW_KEY='wl_admin_pw';
  var DEFAULT_PW='admin1234';
  var REPLACE_FROM='一般社団法人 相続手続士業の会';

  /* ── URLパラメータ ↔ フィールド名 対応表 ── */
  var URL_PARAM_MAP={n:'name',t:'tel',h:'hp',ct:'contact',a:'address',co:'company',sv:'services',sd:'servicesDesc'};

  function getUrlParams(){
    var result={};
    try{
      var params=new URLSearchParams(window.location.search);
      for(var key in URL_PARAM_MAP){
        var val=params.get(key);
        if(val&&val.trim())result[URL_PARAM_MAP[key]]=decodeURIComponent(val.trim());
      }
    }catch(e){}
    return result;
  }

  function getData(){
    var stored={};
    try{stored=JSON.parse(sessionStorage.getItem(STORAGE_KEY))||{};}catch(e){}
    /* URLパラメータがあれば上書き優先 */
    var urlParams=getUrlParams();
    var merged={};
    for(var k in stored)if(Object.prototype.hasOwnProperty.call(stored,k))merged[k]=stored[k];
    for(var k in urlParams)if(Object.prototype.hasOwnProperty.call(urlParams,k))merged[k]=urlParams[k];
    return merged;
  }
  function getPassword(){return sessionStorage.getItem(PW_KEY)||DEFAULT_PW;}

  /* ── 自動置換 ── */
  function applyData(){
    var d=getData();
    if(!d.name&&!d.tel&&!d.hp&&!d.contact
       &&!d.address&&!d.company&&!d.services&&!d.servicesDesc)return;
    var name        =d.name        ||'';
    var tel         =d.tel         ||'';
    var hp          =d.hp          ||'';
    var contact     =d.contact     ||'';
    var address     =d.address     ||'';
    var company     =d.company     ||'';
    var services    =d.services    ||'';
    var servicesDesc=d.servicesDesc||'';

    /*
     * setTxtNode(el, val)
     * 要素の直下テキストノードの nodeValue だけを書き換える。
     * innerHTML / textContent は使わないので子要素・イベントリスナーは保持される。
     */
    function setTxtNode(el,val){
      if(!el)return;
      for(var i=0;i<el.childNodes.length;i++){
        if(el.childNodes[i].nodeType===3){   /* TEXT_NODE */
          el.childNodes[i].nodeValue=val;
          return;
        }
      }
      /* テキストノードが存在しない場合は先頭に追加 */
      el.insertBefore(document.createTextNode(val),el.firstChild||null);
    }

    /* 1. 事務所名 ─────────────────────────────────── */
    if(name){
      /* .office-name : テキストのみ要素（footer-logo など） */
      queryAll('.office-name').forEach(function(el){setTxtNode(el,name);});
      /* コピーライト行の専用 span */
      var cpEl=document.getElementById('wl-copy-name');
      if(cpEl&&cpEl.firstChild&&cpEl.firstChild.nodeType===3)
        cpEl.firstChild.nodeValue=name;
      /* 免責文のリンク：「事務所名（電話番号）」形式でテキストノードを更新 */
      var introLink=document.getElementById('wl-intro-link');
      if(introLink){
        var introTxt=name+(tel?'（'+tel+'）':'');
        setTxtNode(introLink,introTxt);
        if(hp)introLink.href=hp;
      }
      /* <title> の組織名部分を置換（文字列操作のみ、DOMに触れない） */
      if(document.title.indexOf(REPLACE_FROM)!==-1)
        document.title=document.title.split(REPLACE_FROM).join(name);
    }

    /* 2. 住所 ─────────────────────────────────────── */
    if(address){
      queryAll('.office-address').forEach(function(el){
        /*
         * 子のスキーマ span 群を隠し、ホワイトラベル用 span に差し替える。
         * 子要素は display:none にするだけで削除しないため、
         * 元 HTML の構造・属性はそのまま保持される。
         */
        for(var i=0;i<el.childNodes.length;i++){
          var n=el.childNodes[i];
          if(n.nodeType===1)n.style.display='none'; /* 子 element を隠す */
          if(n.nodeType===3)n.nodeValue='';          /* 間のテキスト（空白等）を消す */
        }
        /* 専用 span を取得または生成（2回目以降は再利用） */
        var sp=el.querySelector('[data-wl-addr]');
        if(!sp){
          sp=document.createElement('span');
          sp.setAttribute('data-wl-addr','1');
          el.appendChild(sp);
        }
        sp.textContent=address;   /* ←新規生成 span なのでリスナーなし。textContent OK */
        sp.style.display='';
      });
    }

    /* 3. 電話番号 ──────────────────────────────────── */
    if(tel){
      var telRaw=tel.replace(/[\s\-]/g,'');
      queryAll('.office-tel').forEach(function(el){
        if(el.tagName==='A')el.href='tel:'+telRaw;
        setTxtNode(el,el.tagName==='A'?'☎ '+tel:tel);
      });
    }

    /* 4. 公式サイト URL ────────────────────────────── */
    if(hp){
      var hpDisp=hp.replace(/^https?:\/\//,'').replace(/\/$/,'');
      queryAll('a.office-hp').forEach(function(el){
        el.href=hp;
        /* URL テキストのリンク（"sozoku-expert.net" など）のみテキストノードを更新 */
        for(var i=0;i<el.childNodes.length;i++){
          var n=el.childNodes[i];
          if(n.nodeType===3&&/^https?:\/\/|^[\w-]+\.\w{2,}/i.test(n.nodeValue.trim())){
            n.nodeValue=hpDisp;
          }
        }
      });
    }

    /* 5. 法人概要・サービス一覧・問い合わせ ── href のみ（ラベルは変えない） */
    if(company) queryAll('a.office-company').forEach(function(el){el.href=company;});
    if(services)queryAll('a.office-services-link').forEach(function(el){el.href=services;});
    if(contact) queryAll('a.office-contact').forEach(function(el){el.href=contact;});

    /* 6. 業務内容テキスト ──────────────────────────── */
    if(servicesDesc)queryAll('.office-services-desc').forEach(function(el){setTxtNode(el,servicesDesc);});

  }

  function queryAll(sel,root){
    try{return Array.prototype.slice.call((root||document).querySelectorAll(sel));}catch(e){return [];}
  }

  /* ── 3クリックトリガー ── */
  var clickCount=0,clickTimer=null;
  function setupTrigger(){
    var el=document.querySelector('.footer-bottom,.footer-copy')
        ||document.querySelector('footer,.footer,#footer')
        ||document.body.lastElementChild;
    if(el&&el.id!=='wl-overlay'&&el.id!=='wl-toast'){
      el.addEventListener('click',onTriggerClick);
    }else{
      document.addEventListener('click',onTriggerClick);
    }
  }
  function onTriggerClick(){
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer=setTimeout(function(){clickCount=0;},700);
    if(clickCount>=3){clickCount=0;openModal();}
  }

  /* ── モーダル ── */
  function openModal(){
    document.getElementById('wl-overlay').classList.add('wl-active');
    document.getElementById('wl-pw-screen').style.display='block';
    document.getElementById('wl-settings-screen').style.display='none';
    document.getElementById('wl-pw-input').value='';
    document.getElementById('wl-pw-error').textContent='';
    setTimeout(function(){document.getElementById('wl-pw-input').focus();},80);
  }
  function closeModal(){document.getElementById('wl-overlay').classList.remove('wl-active');}

  /* ── パスワード ── */
  function checkPassword(){
    var input=document.getElementById('wl-pw-input').value;
    if(input===getPassword()){
      document.getElementById('wl-pw-screen').style.display='none';
      document.getElementById('wl-settings-screen').style.display='block';
      loadSettingsToForm();
    }else{
      document.getElementById('wl-pw-error').textContent='⚠ パスワードが違います';
      document.getElementById('wl-pw-input').value='';
      document.getElementById('wl-pw-input').focus();
    }
  }

  function loadSettingsToForm(){
    var d=getData();
    document.getElementById('wl-name').value        =d.name        ||'';
    document.getElementById('wl-address').value     =d.address     ||'';
    document.getElementById('wl-hp').value          =d.hp          ||'';
    document.getElementById('wl-company').value     =d.company     ||'';
    document.getElementById('wl-services').value    =d.services    ||'';
    document.getElementById('wl-contact').value     =d.contact     ||'';
    document.getElementById('wl-tel').value         =d.tel         ||'';
    document.getElementById('wl-services-desc').value=d.servicesDesc||'';
    document.getElementById('wl-new-pw').value      ='';
  }


  document.getElementById('wl-save').addEventListener('click',function(){
    var d=getData();
    d.name        =document.getElementById('wl-name').value.trim();
    d.address     =document.getElementById('wl-address').value.trim();
    d.hp          =document.getElementById('wl-hp').value.trim();
    d.company     =document.getElementById('wl-company').value.trim();
    d.services    =document.getElementById('wl-services').value.trim();
    d.contact     =document.getElementById('wl-contact').value.trim();
    d.tel         =document.getElementById('wl-tel').value.trim();
    d.servicesDesc=document.getElementById('wl-services-desc').value.trim();
    sessionStorage.setItem(STORAGE_KEY,JSON.stringify(d));    var newPw=document.getElementById('wl-new-pw').value.trim();
    if(newPw)sessionStorage.setItem(PW_KEY,newPw);
    showToast('✅ 設定を保存しました。リロードします…');
    setTimeout(function(){location.reload();},900);
  });

  document.getElementById('wl-reset').addEventListener('click',function(){
    if(confirm('設定をすべてリセットしますか？\nパスワードも初期値（admin1234）に戻ります。')){
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(PW_KEY);
      showToast('🗑 設定をリセットしました。リロードします…');
      setTimeout(function(){location.reload();},900);
    }
  });

  document.getElementById('wl-close').addEventListener('click',closeModal);
  document.getElementById('wl-overlay').addEventListener('click',function(e){if(e.target===this)closeModal();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});
  document.getElementById('wl-pw-submit').addEventListener('click',checkPassword);
  document.getElementById('wl-pw-input').addEventListener('keydown',function(e){if(e.key==='Enter')checkPassword();});

  /* ── 共有URL生成・コピー ── */
  document.getElementById('wl-copy-url').addEventListener('click',function(){
    var base=window.location.origin+window.location.pathname;
    var params=new URLSearchParams();
    var name   =document.getElementById('wl-name').value.trim();
    var tel    =document.getElementById('wl-tel').value.trim();
    var hp     =document.getElementById('wl-hp').value.trim();
    var contact=document.getElementById('wl-contact').value.trim();
    if(name)   params.set('n', name);
    if(tel)    params.set('t', tel);
    if(hp)     params.set('h', hp);
    if(contact)params.set('ct',contact);
    var qs=params.toString();
    var shareUrl=base+(qs?'?'+qs:'');
    var hint=document.getElementById('wl-copy-url-hint');
    if(!qs){hint.style.color='#e57373';hint.textContent='⚠ 入力項目がありません';return;}
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(shareUrl).then(function(){
        hint.style.color='#388e3c';
        hint.textContent='✅ クリップボードにコピーしました';
        setTimeout(function(){hint.textContent='';},3000);
      }).catch(function(){fallbackCopy(shareUrl,hint);});
    }else{
      fallbackCopy(shareUrl,hint);
    }
  });
  function fallbackCopy(text,hint){
    try{
      var ta=document.createElement('textarea');
      ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.select();
      document.execCommand('copy');document.body.removeChild(ta);
      hint.style.color='#388e3c';
      hint.textContent='✅ クリップボードにコピーしました';
      setTimeout(function(){hint.textContent='';},3000);
    }catch(e){
      hint.style.color='#e57373';
      hint.textContent='⚠ コピーできませんでした。手動でコピーしてください：'+text;
    }
  }

  function showToast(msg){
    var t=document.getElementById('wl-toast');
    t.textContent=msg;t.style.display='block';
    setTimeout(function(){t.style.display='none';},2500);
  }

  /* ── 初期化 ── */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){applyData();setupTrigger();});
  }else{
    applyData();setupTrigger();
  }
})();
