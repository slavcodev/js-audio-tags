/**
 * @constructor
 */
var ID3v2Reader=function(){
	this.errors=[];
	this.result=0;
};
/**
 * @type {AudioTagsReader}
 */
ID3v2Reader.prototype=new AudioTagsReader;
/**
 * @param file
 */
ID3v2Reader.prototype.readFromFile=function(file){
	var self=this,
		reader=this.getFileReader();

	reader.onloadend=function(e){
		if(e.target.readyState==FileReader.DONE){
			var result=new BinaryBuffer(e.target.result),
				header=new ID3v2Header;

			header.populate(result);
			if(header.hasError()){
				self.addErrors(header.errors);
				self.onLoaded({type:'onLoaded',target:self});
			}
			else {
				var reader=self.getFileReader();
				reader.onloadend=function(e){
					var result=new BinaryBuffer(e.target.result),
						tag=new ID3v2(header);

					tag.populate(result);
					if(tag.hasError()){
						self.addErrors(tag.errors);
					}
					else {
						self.result=tag;
					}
					self.onLoaded({type:'onLoaded',target:self});
				};
				reader.readAsArrayBuffer(file.slice(10,header.size));
			}
		}
	};
	// The ID3v2 tag occupies first 10 bytes in file.
	reader.readAsArrayBuffer(file.slice(0,10));
};

/**
 * The ID3v2 tag header occupies variable bytes in file, beginning with the string ID3.
 *
 * @constructor
 */
var ID3v2=function(header){
	this.errors=[];
	this.header=header||new ID3v2Header;
	this.frames={};
};
/**
 * @type {AudioTagData}
 */
ID3v2.prototype=new AudioTagData;
/**
 * @param buffer
 */
ID3v2.prototype.populate=function(buffer){
	if(this.header.size===undefined){
		this.errors.push('Error: ID3v2 corrupted!');
		return;
	}

	var cursor=0;

	if(this.header.flags.hasExtendedHeader){
		// TODO: Populate extended header
	}

	// TODO: Read frames
	var frame=new ID3v2FrameHeader;
	frame.populate(buffer.slice(cursor,10));
	if(frame.hasError()){
		for(var i=0;i<frame.errors.length;i++){
			this.errors.push(frame.errors[i]);
		}
	}
	else {
		this.frames[frame.id]=frame;

	}

	// TODO: Read padding
	// TODO: Read footer
};
/**
 * @type {Array}
 */
ID3v2.validFramesIds=[
	'AENC',	// Audio encryption
	'APIC',	// Attached picture
	'COMM',	// Comments
	'COMR',	// Commercial frame
	'ENCR',	// Encryption method registration
	'EQUA',	// Equalization
	'ETCO',	// Event timing codes
	'GEOB',	// General encapsulated object
	'GRID',	// Group identification registration
	'IPLS',	// Involved people list
	'LINK',	// Linked information
	'MCDI',	// Music CD identifier
	'MLLT',	// MPEG location lookup table
	'OWNE',	// Ownership frame
	'PRIV',	// Private frame
	'PCNT',	// Play counter
	'POPM',	// Popularimeter
	'POSS',	// Position synchronisation frame
	'RBUF',	// Recommended buffer size
	'RVAD',	// Relative volume adjustment
	'RVRB',	// Reverb
	'SYLT',	// Synchronized lyric/text
	'SYTC',	// Synchronized tempo codes
	'TALB',	// Album/Movie/Show title
	'TBPM',	// BPM (beats per minute)
	'TCOM',	// Composer
	'TCON',	// Content type
	'TCOP',	// Copyright message
	'TDAT',	// Date
	'TDLY',	// Playlist delay
	'TENC',	// Encoded by
	'TEXT',	// Lyricist/Text writer
	'TFLT',	// File type
	'TIME',	// Time
	'TIT1',	// Content group description
	'TIT2',	// Title/songname/content description
	'TIT3',	// Subtitle/Description refinement
	'TKEY',	// Initial key
	'TLAN',	// Language(s)
	'TLEN',	// Length
	'TMED',	// Media type
	'TOAL',	// Original album/movie/show title
	'TOFN',	// Original filename
	'TOLY',	// Original lyricist(s)/text writer(s)
	'TOPE',	// Original artist(s)/performer(s)
	'TORY',	// Original release year
	'TOWN',	// File owner/licensee
	'TPE1',	// Lead performer(s)/Soloist(s)
	'TPE2',	// Band/orchestra/accompaniment
	'TPE3',	// Conductor/performer refinement
	'TPE4',	// Interpreted, remixed, or otherwise modified by
	'TPOS',	// Part of a set
	'TPUB',	// Publisher
	'TRCK',	// Track number/Position in set
	'TRDA',	// Recording dates
	'TRSN',	// Internet radio station name
	'TRSO',	// Internet radio station owner
	'TSIZ',	// Size
	'TSRC',	// ISRC (international standard recording code)
	'TSSE',	// Software/Hardware and settings used for encoding
	'TYER',	// Year
	'TXXX',	// User defined text information frame
	'UFID',	// Unique file identifier
	'USER',	// Terms of use
	'USLT',	// Unsychronized lyric/text transcription
	'WCOM',	// Commercial information
	'WCOP',	// Copyright/Legal information
	'WOAF',	// Official audio file webpage
	'WOAR',	// Official artist/performer webpage
	'WOAS',	// Official audio source webpage
	'WORS',	// Official internet radio station homepage
	'WPAY',	// Payment
	'WPUB',	// Publishers official webpage
	'WXXX',	// User defined URL link frame

	"TDRC"	// Unknown, possibly year !!!
];

/**
 * The ID3v2 tag header occupies 10 bytes in file, beginning with the string ID3.
 *
 * @constructor
 */
var ID3v2Header=function(){
	this.errors=[];
	// Tag version
	this.version='Unknown';
	// Tag flags
	this.flags={
		// Indicates whether or not unsynchronisation is applied on all frames.
		isUnSynchronisation:false,
		// Indicates whether or not the header is followed by an extended header.
		hasExtendedHeader:false,
		// Is used as an 'experimental indicator'.
		// This flag SHALL always be set when the tag is in an experimental stage.
		isExperimental:false,
		// Indicates that a footer is present at the very end of the tag.
		hasFooter:false
	};
	// Tag size in bytes
	this.size=0;
};
/**
 * @type {AudioTagData}
 */
ID3v2Header.prototype=new AudioTagData;
/**
 * @param buffer
 */
ID3v2Header.prototype.populate=function(buffer){
	// Header, the first 3 bytes.
	if(buffer.stringAt(0,3).toUpperCase()!=='ID3'){
		this.errors.push('Error: ID3v2 not found!');
		return;
	}

	this.version='2.'+buffer.byteAt(3)+'.'+buffer.byteAt(4);
	this.flags.isUnSynchronisation=buffer.byteAt(5)&128?true:false;
	this.flags.hasExtendedHeader=buffer.byteAt(5)&64?true:false;
	this.flags.isExperimental=buffer.byteAt(5)&32?true:false;
	// Footer added in ID3 2.4.0
	this.flags.hasFooter=buffer.byteAt(5)&16?true:false;
	this.size=UnSynchsafeInt(buffer.slice(6,4));
};

/**
 * To speed up the process of locating an ID3v2 tag when searching from the end of a file,
 * a footer can be added to the tag. It is REQUIRED to add a footer to an appended tag,
 * i.e. a tag located after all audio data.
 *
 * The footer is a copy of the header, but with a different identifier.
 *
 * @constructor
 */
var ID3v2Footer=function(){
	this.errors=[];
	// Tag version
	this.version='Unknown';
	// Tag flags
	this.flags={
		// Indicates whether or not unsynchronisation is applied on all frames.
		isUnSynchronisation:false,
		// Indicates whether or not the header is followed by an extended header.
		hasExtendedHeader:false,
		// Is used as an 'experimental indicator'.
		// This flag SHALL always be set when the tag is in an experimental stage.
		isExperimental:false,
		// Indicates that a footer is present at the very end of the tag.
		hasFooter:false
	};
	// Tag size in bytes
	this.size=0;
};
/**
 * @type {AudioTagData}
 */
ID3v2Footer.prototype=new AudioTagData;
/**
 * @param buffer
 */
ID3v2Footer.prototype.populate=function(buffer){
	// Footer, the first 3 bytes.
	if(buffer.stringAt(0,3).toUpperCase()!=='3DI'){
		this.errors.push('Error: ID3v2 not found!');
		return;
	}

	this.version='2.'+buffer.byteAt(3)+'.'+buffer.byteAt(4);
	this.flags.isUnSynchronisation=buffer.byteAt(5)&128?true:false;
	this.flags.hasExtendedHeader=buffer.byteAt(5)&64?true:false;
	this.flags.isExperimental=buffer.byteAt(5)&32?true:false;
	// Footer added in ID3 2.4.0
	this.flags.hasFooter=buffer.byteAt(5)&16?true:false;
	this.size=UnSynchsafeInt(buffer.slice(6,4));
};

/**
 * Synchsafe integers are integers that keep its highest bit (bit 7) zeroed,
 * making seven bits out of eight available.
 * Thus a 32 bit synchsafe integer can store 28 bits of information.
 *
 * WARNING: All size values in ID3v2 must be 32-bit synchsafe integer,
 * but was found track with not synchsafe length in APIC frame :(
 *
 * @link http://en.wikipedia.org/wiki/Synchsafe
 * @param buffer
 * @return {Number}
 */
function UnSynchsafeInt(buffer){
	var value=0;
	for(var i=0,length=buffer.length;i<length;i++){
		value+=(buffer.byteAt(i)&0x7F)*Math.pow(Math.pow(2,7),length-i-1);
	}
	return value;
}

/**
 * Convert hex in decimal number.
 *
 * @param buffer
 * @return {Number}
 */
function ByteToInt(buffer){
	var value=0;
	for(var i=0,length=buffer.length;i<length;i++){
		value+=(buffer.byteAt(i)&0xFF)*Math.pow(Math.pow(2,8),length-i-1);
	}
	return value;
}
