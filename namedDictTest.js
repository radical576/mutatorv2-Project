include("dict_to_jsobj");
function $(stringref){
    stringref=stringref.replace(/parent/gi, "parentpatcher")
    var path=stringref.split('.')
    var obj=this.patcher
    for(i in path){
        if(path[i]=='parentpatcher'){ //up 1 level:
            obj=obj.parentpatcher
        }else{
            obj=obj.getnamed(path[i])
            if(i!=path.length-1){ //down 1 level:
                obj=obj.subpatcher()
            }
        }
    }
    return(obj)
}

var d = new Dict("---myDict");

e= $("myDict");
p=$("printTest");
f=new Dict();
f.clone(e.name);

this.patcher.getnamed("myDict");
g=dict_to_jsobj(e);
h=e;
m=d.getkeys();
//h=g["a"];
e.message("write","myjson.json"); 
post("\n regular: ", d.get("a") );
post("\n tereated like dict: ", e.get("a") );
post("\n clone: ",f.get("a") );
post("\n name of: ", e.name );
post("\n name of: ", e.maxclass );
post("\n name of: ", e.varname);
p.message("testing testing sending");
function bang(){

}