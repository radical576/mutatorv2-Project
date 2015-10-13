

//index array is populated for 0-15
//will reset on each new part
var aIdx=[];
var aMaster=[];
for(var i=0; i<16;i++){
	aIdx[i]=i;
	//does this need to be an array of objects to account for pitch vel and dur?
	aMaster[i]=0;
}
//picked indices get pushed to chosen array which resets on each part
//these will be spliced out of the main index array
var aChosen=[];
//another array needs to be created from the indices that contains only valid choices
//valid is based on quantizing but should also be calculated from density 
//... if we remove invalid entries from the valid array, we don't really need to track chosen
//calculating what is valid should be repeatable and mutable depending on what is prioritized
//20150926:NEW IDEA: Allow for a poly switch to turn off and on parts that are allowed to play at the same time
//the question becomes how to distribute the weight percents. I think its alright really, some silence can be good
//20150927:After thinking about it last night, lets go back to the oriinal plan where the chosen index is compared to the master array directly. However, each time it compares, it starts with a fresh pool of indices to choose from and then runs those out with the current settings.
//Then, if nothing fits, it subtracts one from whatever has the lowest priority, if that still doesn't fit, it skips to the next lowest priority parameter and subtracts one from that. It continues like this until we get rid of whatever density or note size parameter is causing issue.
//density should be linear but have a polarity switch on the device.

//pick a random 
//_stepLen is decremented by the _noteLen when something is successfully added and drives the recursive (?) loop until it hits 0
//_density determines if there are pieces of the same part within x distance either positively or negatively depending on a polarity switch 
//_pitch so we know what to assign and what density to check for

function shuffle(indexArr, outArr, _pitch,  _stepLen, _noteLen, _density, _densPol) {
	
  var m = indexArr.length, t, i, valid;
  // While there remain elements to shuffle…
  while (_stepLen) {
  	valid=true;
    // Pick a remaining element…
    i = indexArr[(Math.floor(Math.random() * m))];
    //check if there is room for the size
    if(outArr[i+_noteLen]){
    	//the position is valid, 
    	//now check for density
    	//must incorporate if(_densPol){} somehow for polarity of <=
    	for(var j=1; (j<=_density) && valid; j++){
	    	if(outArr[j]==_pitch){
	    		
	    			valid=false;
	    	}

		}	
		if(valid){
			//--not doing this way now that we use the master directly
    		//splice all of the indices out into the chosen array
    		//aChosen.splice(0,0,indexArr.splice(i,_noteLen));
    	}

    }
    
    t = inArr[m];
    inArr[m] = inArr[i];
    inArr[i] = t;
  }
  return inArr;
}

