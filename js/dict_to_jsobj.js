// example
//var dataDict = new Dict("myData");  
//var data = new Object();

//data = dict_to_jsobj(dataDict);
// returns or includes null if there is a dict without containing data.
function dict_to_jsobj(dict) {
	if (dict == null) return null;
	var o = new Object();
	var keys = dict.getkeys();
	if (keys == null || keys.length == 0) return null;

	if (keys instanceof Array) {
		for (var i = 0; i < keys.length; i++)
		{
			var value = dict.get(keys[i]);
			
			if (value && value instanceof Dict) {
				value = dict_to_jsobj(value);
			}
			o[keys[i]] = value;
		}		
	} else {
		var value = dict.get(keys);
		
		if (value && value instanceof Dict) {
			value = dict_to_jsobj(value);
		}
		o[keys] = value;
	}

	return o;
}

function jsobj_to_dict(o) {
	var d = new Dict();
	
	for (var keyIndex in o)	{
		var value = o[keyIndex];

		if (!(typeof value === "string" || typeof value === "number")) {
			var isEmpty = true;
			for (var anything in value) {
				isEmpty = false;
				break;
			}
			
			if (isEmpty) {
				value = new Dict();
			}
			else {
				var isArray = true;
				for (var valueKeyIndex in value) {
					if (isNaN(parseInt(valueKeyIndex))) {
						isArray = false;
						break;
					}
				}
			
				if (!isArray) {
					value = jsobj_to_dict(value);
				}
			}
		}
		d.set(keyIndex, value);
	}
	post("in the module");
	return d;
}