include("dict_to_jsobj");
//test
var aParams=[];
var aWeights=[];
var oGlobals={};
var oMaster={"pitch":[0]};
function init(){
var dStepDump = new Dict("stepDump");  

var dGlobals= new Dict("dGlobals");
var dParams = new Dict("dParams");
var dWeights = new Dict("dWeights");

var oParams = dict_to_jsobj(dParams);
var oWeights = dict_to_jsobj(dWeights);

oGlobals = dict_to_jsobj(dGlobals);
aParams = Array.prototype.slice.call(oParams);
aWeights = Array.prototype.slice.call(oWeights);
}
function bang(){
	init();
	post(aWeights, "\n");
	
	//convert weights to percents
	var weightSum=aWeights.reduce(function(a,b){return a+b});
	var aWeightsPct=aWeights.map(function(a){return a/weightSum});
	//determine sequence lengths as percentage of global length
	var curTotal=0;
	var nextTotal=0;
	for(var i=0; i< aParams.length; i++){
		var calcStepLen=Math.round(aWeightsPct[i] * oGlobals.nstep);
		nextTotal+=calcStepLen;	
	    //last calculated step length gets shafted
		aParams[i].seqLen= nextTotal > oGlobals.nstep ? oGlobals.nstep-nextTotal : calcStepLen;
		curTotal+=calcStepLen;
		//post(aParams[i].seqLen);
	}
	//create master object where keys are the same as the Params objects
 	//and arrays populated according to a proprietary algorithm ;)

	oMaster.pitch=aParams.map(function(e){
		//ok we will abstract this after doing pitch
		//pitch is the number of steps is equal to noteLen
		//fill out the master array with as many 0 as oGlobals.nstep
		//fill out an index array with sequential values starting at 0
		//this will be used to randomly select which index to place a note
		//check if the noteLen is longer than the remaining stepLen
			//use the ternary operator like in the above
		//determine which slots in master array can hold a step of that length
			//something like "is the value at x index=0, if yes, are the values
			//that are note len after also 0. if so then x is a valid index
			//depending on density, we may need to read ahead and behind to ensure that 
			//given index is far enough from itself
				//we admit that there will be some imperfections but the user chooses priority
				//the parts will be sorted (low or hight) based on 
					//part 
					//note length
					//density
					//quantize

		//randomize using the first indx of valid steps
		//add pitch by incrementing a temp noteLen variable
	});
}