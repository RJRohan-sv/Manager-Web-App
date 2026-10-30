// Manager backend (fast version) - paste this whole file into Google Apps Script (see SETUP.txt)
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function sh_(){const ss=SpreadsheetApp.getActiveSpreadsheet();let s=ss.getSheetByName("data");
  if(!s){s=ss.insertSheet("data");s.getRange("A:E").setNumberFormat("@");s.appendRow(["coll","id","mess","code","json"]);s.setFrozenRows(1)}return s}
function ver_(){return PropertiesService.getScriptProperties().getProperty("v")||"0"}
function bump_(){PropertiesService.getScriptProperties().setProperty("v",String(Date.now())+Math.random().toString(36).slice(2,6))}
function rows_(v,mess){return v.filter(r=>String(r[2])===String(mess)).map(r=>[r[0],r[4]])}
function doGet(){return out_({ok:true,msg:"Manager backend running"})}
function doPost(e){let q;
  try{q=JSON.parse(e.postData.contents)}catch(err){return out_({ok:false,err:String(err)})}
  try{
    if(q.op==="ver")return out_({ok:true,v:ver_()});
    const s=sh_(),n=s.getLastRow();
    if(q.op==="load"){const v=n>1?s.getRange(2,1,n-1,5).getValues():[];return out_({ok:true,rows:rows_(v,q.mess)})}
    if(q.op==="find"||q.op==="enter"){const v=n>1?s.getRange(2,1,n-1,5).getValues():[];
      const r=v.find(r=>r[0]==="members"&&String(r[3])===String(q.code));
      if(q.op==="find")return out_({ok:true,json:r?r[4]:null});
      return out_({ok:true,json:r?r[4]:null,rows:r?rows_(v,r[2]):[]})}
    const L=LockService.getScriptLock();L.waitLock(25000);
    try{
      if(q.op==="save"){const k=n>1?s.getRange(2,1,n-1,2).getValues():[],idx={};k.forEach((r,i)=>idx[r[0]+"|"+r[1]]=i+2);
        q.items.forEach(it=>{const row=[it.coll,it.id,it.mess,it.code,it.json],key=it.coll+"|"+it.id;
          if(idx[key])s.getRange(idx[key],1,1,5).setValues([row]);else{s.appendRow(row);idx[key]=s.getLastRow()}});
        bump_();return out_({ok:true})}
      if(q.op==="del"){const k=n>1?s.getRange(2,1,n-1,2).getValues():[];
        for(let i=k.length-1;i>=0;i--)if(k[i][0]===q.coll&&String(k[i][1])===q.id){s.deleteRow(i+2);break}
        bump_();return out_({ok:true})}
      if(q.op==="purge"){const k=n>1?s.getRange(2,1,n-1,3).getValues():[];
        for(let i=k.length-1;i>=0;i--)if(String(k[i][2])===q.mess&&q.colls.indexOf(k[i][0])>-1&&String(k[i][1])!==String(q.keep||""))s.deleteRow(i+2);
        bump_();return out_({ok:true})}
      return out_({ok:false,err:"bad op"})
    }finally{L.releaseLock()}
  }catch(err){return out_({ok:false,err:String(err)})}}
