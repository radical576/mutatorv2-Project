//conversion script
inlets=1;
outlets=2;

//grab the dicts in the patch, no inlets
//var dPreSlice = this.patcher.getnamed("preSlice");
//var dPostSlice = this.patcher.getnamed("postSlice");
//var dStepDump = this.patcher.getnamed("stepDump");


var dPreSlice = new Dict("dWhole");
var dPostSlice = new Dict("dWeights");
var dStepDump = new Dict("stepDump");  


include("dict_to_jsobj");

//do all the stuff

function makePostSlice(dInParams, dInWeights){
	post("in Dict: "+ inDict);
	var _oParams = dict_to_jsobj(dInParams);
	var _oWeights = dict_to_jsobj(dInWeights);
	
	var _piecesArr=[];
	var _flatArr=[];
	var _stepObj={};
	
	var _stepDict=new Dict();
	//convert object of objects to array of objects
	// TODO add "length" and 0 base
	var _aParams=Array.prototype.slice.call(_oParams);
	
	//convert weights to percentages
	var _aWeightsPct=convertWeights(_oWeights);
	//add them to the params array?
	
	//determine how many total steps each part has to add up to total len
	var _aSteps=getSteps(_aWeights,_aParams);
	//add as many pitches as there are calculated from the prior step to 
	//	the master array

		
	//break up the pieces and add them sequentially as objects to an array
	_piecesArr=makePiecesArr(_jsObj);
	//shuffle the _piecesArr into a random order 
	_piecesArr=shuffle(_piecesArr);
	//ensure no objects with the same val are next to one another
	_piecesArr=separate(_piecesArr);
	//make a flat array of vals
	_flatArr=flatten(_piecesArr);
	//format a JSOBJ like live.step expects
	_stepObj=makeStepObj(_flatArr, target[0], dStepDump);
	//make a dict from the JSOBJ
	_stepDict=jsobj_to_dict(_stepObj);	
	return _stepDict;
}
//break the obj up into an array of values
function makePiecesArr(inObj){
	post("in obj: " +inObj);
	var outArr=[];
	
	var keys=Object.keys(inObj);
	
	keys.forEach(function(key,idx,arr){
		var tempPieces=inObj[key].pieces;
		var tempLen=inObj[key].seqLen;
		var newLen=0;
		var pieceObj={};
		if(inObj[key].active){
			for(var i=0; i < inObj[key].pieces;i++){
				newLen=Math.ceil(tempLen/tempPieces);
				//post("new len: "+ newLen);
				tempLen=tempLen-newLen;
				tempPieces--;	
				pieceObj={
					"seqLen":newLen,
					"pieces":1,
					"val":inObj[key].val, 
					"stepTrig":inObj[key].stepTrig,
					"equal":inObj[key].equal
				};
				outArr.push(pieceObj);
			}
		}
	});
	return outArr
}

//shuffle
function shuffle(inArr) {
  var m = inArr.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = inArr[m];
    inArr[m] = inArr[i];
    inArr[i] = t;
  }
  return inArr;
}
//make sure that none of the same val are next to each other
function separate(inArr){
	var outArr=[]; 
	var loopChk=0; //if this hits the length of the array then we are in an inf loop
	//put first element of the original array into the out array
	outArr.push.apply(outArr,inArr.splice(0,1));

	while (inArr.length && !(loopChk > inArr.length)){
		//compare in with out ends to see if we can push or unshift
		if(inArr[0].val == outArr[outArr.length-1].val && 
			inArr[0].val == outArr[0].val){
			//move the first element to the back of the in array
			inArr.push.apply(inArr,inArr.splice(0,1));
			loopChk++;
		}
		else if(!(inArr[0].val == outArr[outArr.length-1].val)){
			//move the first element to the back of the out array
			outArr.push.apply(outArr,inArr.splice(0,1));
			loopChk=0;
		}
		else{
			//move to the front
			// ushift isn't efficient :(
			outArr.unshift.apply(outArr,inArr.splice(0,1));
			loopChk=0;
		}
		//handle the case where out ends are matching 
			//and in only has equal remaining 
			//(splice in a random index if possible)
		if(loopChk > inArr.length && inArr.length > 0){
			var safeIdx=[];
			outArr.forEach(function(el,idx,arr){				
				//compare current el value and next value in the out array 
					//with the first element of the in array
				if(arr[idx+1]){
					if(!(el.val==inArr[0].val) && !(arr[idx+1].val==inArr[0].val)){
						safeIdx.push(idx);
					}
 				}
			});
			//if any indexes were safe, splice the first element of the in array
 				//into that spot and reset loopChk
			if(safeIdx.length){
				safeIdx=shuffle(safeIdx);
				outArr.splice(safeIdx[0]+1,0,inArr.pop());
				loopChk=0;
			}
		}
	}
	post();
	//if loopChk is >array length we ended prematurely, 
		//presumably because of too many pieces
	post("arr len: " + inArr.length + " loopChk: "+ loopChk);
	return outArr;
}
function flatten(inArr){
	var outArr=[];
	for(var i=0; i < inArr.length; i++){
		for(var j=0; j <inArr[i].seqLen; j++){
		
			if(inArr[i].stepTrig==1){
				outArr.push(inArr[i].val);
			}
			//flag steps after the first as -1 for setting velocity and dur
			else{
				if(j==0){
					outArr.push(inArr[i].val);		
				}
				else{
						outArr.push(-1);
				}
			}
		}
	}
	return outArr;
}
function convertDurations(inArr,durArr,velArr,interval){
	post("\n --pre:")
	post("\n pitch: "+inArr);
	post("\n duration: "+durArr);
	post("\n velocity: "+velArr);
	
	var lastValIdx=0;
	var outObj={};
	
	if(!velArr[0]){velArr[0]=100;}//this should never happen unless odd adjusts
	
	for(var i=0; i < inArr.length; i++){
		durArr[i]=interval;
		
		if(inArr[i]==-1){
			velArr[i]=0;
			inArr[i]=inArr[lastValIdx];
			//handle a % option? we would need another array?
			durArr[lastValIdx]=durArr[lastValIdx]+interval;//increase duration by interval
		}
		else{
			//if the last run set it to zero set it to the same vel as the last valid value
			if(velArr[i]==0){
				velArr[i]=velArr[lastValIdx];
			}
			lastValIdx=i;
		}				
			durArr[i]=interval;
	}
	outObj={"type":inArr,"duration":durArr,"velocity":velArr};
	return outObj;
}
function makeStepObj(inArr, type, inStepDict){
	
	//TODO:convert type into something meaningful
	var _type=type.toLowerCase();
	
	var steps = inArr.length;
	var outObj=dict_to_jsobj(inStepDict);
	var newObj=convertDurations(inArr, outObj.duration, outObj.velocity, outObj.interval);
	if(_type=="pitch" || _type=="velocity"){ 		
		outObj[_type] = newObj.type;
		outObj.duration=newObj.duration;
		outObj.velocity=newObj.velocity;
		outObj.nstep=steps;
		outObj.loop=[1,steps];
	}
	post();
	post(_type + " : " + outObj[_type]);
	return outObj;
}


function bang(){	
	dPostSlice=makePostSlice(dPreSlice);
	outlet(1, "dictionary", dPostSlice.name);
	var stepper=this.patcher.getnamed("live.step");
	stepper.message("dictionary", "postSlice");
	stepper.message("fold",1);
	stepper.message("dump_to_dict");
//	messnamed("live.step","dictionary", "postSlice");
//	messnamed("live.step","fold", 1);
//	messnamed("live.step","dump_to_dict");
}

function anything(){
	target=arrayfromargs(messagename,arguments);
	post(target[0]);
}