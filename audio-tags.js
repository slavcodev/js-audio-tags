/**
 * @constructor
 */
var AudioTagsReader=function(){};
/**
 * @type {Array}
 */
AudioTagsReader.prototype.errors=[];
/**
 * @return {Boolean}
 */
AudioTagsReader.prototype.hasError=function(){
	return this.errors.length>0;
};
/**
 * @param {Array} errors
 */
AudioTagsReader.prototype.addErrors=function(errors){
	for(var i=0;i<errors.length;i++){
		this.errors.push(errors[i]);
	}
};
/**
 * @return {FileReader}
 */
AudioTagsReader.prototype.getFileReader=function(){
	if(this._reader===undefined){
		this._reader=new FileReader;
	}
	return this._reader;
};
/**
 * @type {Number}
 */
AudioTagsReader.prototype.result=0;
/**
 *
 */
AudioTagsReader.prototype.onLoaded=function(){};
/**
 * @param file
 */
AudioTagsReader.prototype.readFromFile=function(file){
	this.onLoaded.call(this);
};

/**
 * @constructor
 */
var AudioTagData=function(){};
/**
 * @type {Array}
 */
AudioTagData.prototype.errors=[];
/**
 * @return {Boolean}
 */
AudioTagData.prototype.hasError=function(){
	return this.errors.length>0;
};
AudioTagData.prototype.populate=function(buffer){};

/**
 * Helper to binary data.
 *
 * @param buffer
 * @constructor
 */
var BinaryBuffer=function(buffer){
	this.buffer=buffer;
	this.length=buffer.length;
};
BinaryBuffer.prototype={
	slice:function(offset,length){
		var buffer=new ArrayBuffer(length);
		for(var i=offset,j=0;i<this.length && j<length;i++,j++){
			buffer[j]=this.buffer[i];
		}
		return new BinaryBuffer(buffer);
	},
	byteAt:function(i){
		return this.buffer[i]&0xFF;
	},
	charAt:function(i){
		var code=this.byteAt(i);
		// TODO: $0A - new line
		// TODO: create filter function
		if(code==0)return '';
		if(code==0)return 0;//"?";
		if(code<32)return code;//"?";
		return String.fromCharCode(code);
	},
	stringAt:function(offset,length){
		var str=[];
		for(var i=offset,j=0;i<offset+length;i++,j++) {
			str[j]=this.charAt(i);
		}
		return str.join("");
	},
	toString:function(){
		return this.stringAt(0,this.length);
	}
};
