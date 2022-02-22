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

