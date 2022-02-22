/** window.onload()
  * @brief initialize window.
  * @details This function is called by loading the window.
*/
window.onload=function(){
  intext.value = "";
  loadlink();
  makelink();
  window.onresize();
};
window.onresize = function(){
  var clientWidth  = document.documentElement.clientWidth;
  var clientHeight = document.documentElement.clientHeight;
  var fixedWidth   = clientWidth /4;
  var fixedHeight  = clientHeight*0.1;
  document.getElementById("inputtd" ).width  = Math.floor((clientWidth -fixedWidth )/2*0.99);
  document.getElementById("outputtd").width  = Math.floor((clientWidth -fixedWidth )/2*0.99);
  document.getElementById("inputtd" ).height = Math.floor( clientHeight-fixedHeight)*0.5;
  document.getElementById("outputtd").height = Math.floor( clientHeight-fixedHeight)*0.5;
}    
var loadlink=function(){
  var query=location.search.substr(1);
  if(query.length>0){
    //get matrix
    var str = query.match(/(h=)(.*$)/)[2];
    str=str.replace(/\./g, " ");
    str=str.replace(/;/g, "\n");
    str=str.replace(/_/g, "");
    intext.value=str;
  }
}
var makelink=function(){
  var query="h=";
  var str=intext.value;
  str=str.replace(/\n/g, ";");
  str=str.replace(/\s/g, ".");
  query+=str+"_";
  var url = location.origin+location.pathname+"?"+query;
  document.getElementById("link").href = url;
  document.title=str;
  return url;
}
var prevurl="";
var autosave=function(){
  if(autosavecheck.value){
    var url = makelink();
    if(prevurl!=url){
      history.pushState(null,null,url);
    }
    prevurl=url;
  }
}
var lastcommand=function(){/* nop */};
var redraw=function(){
  lastcommand();
}
var doclear=function(){
  intext.value ="";
  outtext.value="";
  var url=makelink();
  if(url.match(/^https:\/\//) || url.match(/^http:\/\//)){
    url=url.replace(/\/[^\/]*$/,"/");
  }else{
    url=url.replace(/\/[^\/]*$/,"/index.html");
  }
  history.pushState(null,null,url);
}
/** parse()
  * @brief parse intext and output result into outtext.
  * @details This function is called by clicking "parse" button.
*/
var parse=function(){
  autosave();
  //input
  var mstr=intext.value;
  //split
  var ystr=mstr.split("\n");
  
  outtext.value="";
  for(var y=0;y<ystr.length;y++){
    //trim
    var str=ystr[y].replace(/\s\s*/g, " ");
    str=str.replace(/^\s*/g, "");
    str=str.replace(/\s*$/g, "");
    if(str!=""){
      var xstr=str.split(" ");
      for(var x=0;x<xstr.length;x++){
        str=xstr[x];
        if(str!=""){
          //parse
          var h=hydra.parse(str);
          //out string expression
          outtext.value+=h.toString();
          //out tree expression
        }
        outtext.value+="  ";
      }//x
    }
    outtext.value+="\n";
  }//y
  lastcommand=parse;
};

/** expand()
  * @brief expand intext X Y and output result X[Y] into outtext.
  * @details This function is called by clicking "expand" button.
*/
var expand=function(){
  autosave();
  //input
  var mstr=intext.value;
  //split
  var ystr=mstr.split("\n");
  
  var outstr="";
  for(var y=0;y<ystr.length;y++){
    //trim
    var str=ystr[y].replace(/^\s*/g , "" );
    var str=   str.replace(/\s*$/g , "" );
    var str=   str.replace(/\s\s*/g, " ");
    if(str!=""){
      var xstr=str.split(" ");
      for(var x=0;x<Math.floor(xstr.length/2);x++){
        if(str!=""){
          //parse
          var a=Kuma3ary.parse(xstr[x*2+0]);
          var b=Kuma3ary.parse(xstr[x*2+1]);
          //out string expression
          outstr += a.expand(b).toString(mainsugar);
        }
        outstr+="  ";
        outtext.value = outstr;
      }//x
      if(xstr.length%2==1){
        var a=Kuma3ary.parse(xstr[xstr.length-1]);
        outstr+=a.toString(mainsugar);
      }
    }
    outstr+="\n";
  }//y
  outtext.value = outstr;
  lastcommand=expand;
};

Hydra = function(input){
  if(input instanceof Array){
    this.a = input.clone();
  }else if(typeof input === "string" || input instanceof String){
    Hydra.parse(input);
  }
}
Hydra.parse = function(str){
}
/* this.toString()=string representation of this */
/* this.toString(x)=string representation of partial hydra starting by x */
Hydra.prototype.toString=function(x){
  if(x==undefined){
    return this.toString(0);
  }else{
    var ret="";
    var a=this.a;
    var xs=a.length;
    if(a.length==0)return "";
    ret+=a[x][1];
    var c=this.getchildren(x);
    if(c.length==0)return ret;
    ret+="^";
    if(c.length>1)ret+="(";
    for(var ci=0;ci<c.length;ci++){
      if(ci!=0)ret+="+";
      ret+=this.toString(c[ci]);
    }
    if(c.length>1)ret+=")";
    return ret;
  }
}
/* getchildlen(p)=children indices array of the node at p-th column */
Hydra.prototype.getchildren=function(p){
  var c=[];
  for(var x=p+1;x<this.a.length;x++)
    if(this.getparent(x)==p)
      c.push(x);
  return c;
}
/* getparent(c) = parent index of c */
Hydra.prototype.getparent=function(c){
  var a=this.a;
  for(var x=c-1;x>=0;x--)
    if(a[x][0]<a[c][0])return x;
  return -1;
}
