/**
 * The ID3v2 tag frame header occupies 10 bytes in file.
 *
 * @constructor
 */
var ID3v2FrameHeader=function(){
	this.errors=[];
	this.id='';
	this.size=0;
	this.flags={};
	this.value={};
};
/**
 * @type {AudioTagData}
 */
ID3v2FrameHeader.prototype=new AudioTagData;
/**
 * @param buffer
 */
ID3v2FrameHeader.prototype.populate=function(buffer){
	// The Frame ID first 4 bytes.
	var id=buffer.stringAt(0,4);
	if(ID3v2.validFramesIds.indexOf(id)<0){
		this.errors.push('Error: ID3v2 Frame not not supported ('+id+')!');
		return;
	}

	this.id=id;
	this.size=UnSynchsafeInt(buffer.slice(4,4));
	// TODO: Get flags
	// TODO Create new ID3v2FrameValue base on frame ID
};
