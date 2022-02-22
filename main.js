/** window.onload()
  * @brief initialize window.
  * @details This function is called by loading the window.
*/
window.onload=function(){
  form.in.value = "";
  loadlink();
  makelink();
};
var loadlink=function(){
  var query=location.search.substr(1);
  if(query.length>0){
    //get matrix
    var str = query.match(/(h=)(.*$)/)[2];
    str=str.replace(/\./g, " ");
    str=str.replace(/;/g, "\n");
    str=str.replace(/_/g, "");
    form.in.value=str;
  }
}
var makelink=function(){
  var query="h=";
  var str=form.in.value;
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
  form.in.value ="";
  form.out.value="";
  var url=makelink();
  if(url.match(/^https:\/\//) || url.match(/^http:\/\//)){
    url=url.replace(/\/[^\/]*$/,"/");
  }else{
    url=url.replace(/\/[^\/]*$/,"/index.html");
  }
  history.pushState(null,null,url);
}
/** doparse()
  * @brief parse form.in and output result into form.out.
  * @details This function is called by clicking "parse" button.
*/
var doparse=function(){
  autosave();
  //input
  var mstr=form.in.value;
  //split
  var ystr=mstr.split("\n");
  
  form.out.value="";
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
          var h=Hydra.parse(str);
          //out string expression
          form.out.value+=h.toString();
          //out tree expression
        }
        form.out.value+="  ";
      }//x
    }
    form.out.value+="\n";
  }//y
  lastcommand=doparse;
};

/** expand()
  * @brief expand form.in X Y and output result X[Y] into form.out.
  * @details This function is called by clicking "expand" button.
*/
var doexpand=function(){
  var line=form.in.value.split("\n");
  form.out.value="";
  for(var i=0;i<line.length;i++){
    var h=Hydra.parse(line[i]);
    var t=parseInt(form.bracket.value);
    var e=h.expand(t);
    form.out.value+=e.toString()+"\n";
  }
  lastcommand=doexpand;
}
var doexpandcont=function(){
  var line=form.in.value.split("\n");
  var h=Hydra.parse(line[line.length-1]);
  var t=parseInt(form.bracket.value);
  var e=h.expand(t);
  form.in.value+="\n"+e.toString();
  form.in.scrollTop = form.in.scrollHeight;
}

Hydra = function(input){
  if(input instanceof Array){
    this.a = input.clone();
  }else if(typeof input === "string" || input instanceof String){
    this.a = Hydra.parse(input).a;
  }
}
Hydra.parse = function(str){
  var a=[];
  var label=0;
  var level=0;
  var parenstack=[];
  var pre; /* previous char */
  for(var i=0;i<str.length;i++){
    var c=str[i];
    if(c>='0'&&c<'9'){
      label=label*10+parseInt(c)
      c="digit";
    }else{
      switch(c){
        case '(':
          parenstack.push(level);
          if(pre=="digit"){
            a.push([level,label]);
            label=0;
          }
          if(pre!='^')level++;
          break;
        case '^':
          if(pre=="digit"){
            a.push([level,label]);
            label=0;
          }
          level++;
          break;
        case ')':
          if(pre=="digit"){
            a.push([level,label]);
            label=0;
          }
          level=parenstack.pop();
          break;
        case '+':
        case ',':
          if(pre=="digit"){
            a.push([level,label]);
            label=0;
          }
          break;
        default:
          break;
      }//switch
    }//if
    pre=c;
  }//for i
  if(pre=="digit")a.push([level,label]); 
  return new Hydra(a);
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
    var c=this.children(x);
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
Hydra.prototype.children=function(p){
  var c=[];
  for(var x=p+1;x<this.a.length;x++)
    if(this.parent(x)==p)
      c.push(x);
  return c;
}
/* parent(c) = parent index of c */
Hydra.prototype.parent=function(c){
  var a=this.a;
  for(var x=c-1;x>=0;x--)
    if(a[x][0]<a[c][0])return x;
  return -1;
}
Hydra.prototype.eq=function(hb){
  var a=this.a;
  var b=hb.a;
  for(var x=0;true;x++){
    if(x==a.length && x==b.length)return true;
    if(x==a.length || x==b.length)return false;
    if(a[x][0]!=b[x][0] || a[x][1]!=b[x][1]) return false;
  }
}
Hydra.prototype.lt=function(hb){
  var a=this.a;
  var b=hb.a;
  for(x=0;true;x++){
    if(x==a.length && x==b.length)return false;
    if(x==a.length)return true;
    if(x==b.length)return false;
    if(a[x][0]<b[x][0])return true;
    if(a[x][0]>b[x][0])return false;
    if(a[x][1]<b[x][1])return true;
    if(a[x][1]>b[x][1])return false;
  }
  return false;
}
Hydra.prototype.leq=function(hb){
  return this.eq(hb) || this.lt(hb);
}

Hydra.prototype.gt=function(hb){
  return !this.leq(hb);
}
Hydra.prototype.geq=function(hb){
  return !this.lt(hb);
}
Hydra.prototype.expand=function(n){
  var a=this.a;
  var len=a.length;
  if(len==0)return new Hydra([]);
  var D=this.degrade();
  if(D.length==0){
    a=a.clone();
    a.pop();
    return new Hydra(a);
  }
  var r=this.parent(this.parent(len-1));
  var delta = D[0]-a[r][0];
  var G=a.slice(0,r);
  var B=[];
  for(var k=0;k<=n;k++){
    for(var x=0;x<len-r-1;x++){
      if(r+x==len-1){
        B.push([D[0]+k*delta, D[1]]);
      }else{
        B.push([a[r+x][0]+k*delta, a[r+x][0]]);
      }
    }
  }
  return new Hydra(G.concat(B));
}
Hydra.prototype.degrade=function(){
  var a=this.a;
  var len=a.length;
  if(a[len-1][0]==0)return [];

  var D=a[len-1].clone();

  if(D[1]>0){
    D[1]--;
  }else{
    var p=this.parent(len-1);
    while(p>=0 && a[p][0]>0 && a[p][1]==0)p=this.parent(p);
    if(a[p][0]==0)return [];
    D[0]=a[p][0];
    D[1]=a[p][1]-1;
  }
  return D;
}
