
(function(){
  var container=document.getElementById('qrcode-img');
  if(!container)return;

  
  var img=document.createElement('img');
  img.src='https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=0F6E56&data='+encodeURIComponent('https://sozokuexpert.github.io/endoflife/');
  img.alt='QRコード';
  img.width=160;img.height=160;
  container.appendChild(img);
})();
