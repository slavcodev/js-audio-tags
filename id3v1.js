/**
 * @constructor
 */
var ID3v1Reader=function(){
	this.errors=[];
	this.tag=0;
};
/**
 * @type {AudioTagsReader}
 */
ID3v1Reader.prototype=new AudioTagsReader;
/**
 * @param file
 */
ID3v1Reader.prototype.readFromFile=function(file){
	var self=this,
		reader=new FileReader;
	reader.onloadend=function(e){
		if(e.target.readyState==FileReader.DONE){
			var result=new BinaryBuffer(e.target.result),
				tag=new ID3v1;

			tag.populate(result);

			if(tag.hasError()){
				for(var i=0;i<tag.errors.length;i++){
					self.errors.push(tag.errors[i]);
				}
				self.onLoaded.call(self);
			}
			else {
				self.tag=tag;
				self.onLoaded.call(self);
			}
		}
	};
	// The ID3v1 tag occupies last 128 bytes in file.
	reader.readAsArrayBuffer(file.slice(file.size-128,128));
};

/**
 * The ID3v1 tag occupies last 128 bytes in file, beginning with the string TAG.
 *
 * @constructor
 */
var ID3v1=function(){
	this.errors=[];
	// 30 characters of the title.
	this.title='';
	// 30 characters of the artist name.
	this.artist='';
	// 30 characters of the album name.
	this.album='';
	// A four-digit year.
	this.year='';
	// The comment. The track number is stored in the last two bytes of the comment field.
	// If the comment is 28 or 30 characters long, no track number can be stored.
	// If a track number is stored, the 125th byte contains a binary 0.
	this.comment='';
	// The number of the track on the album, or 0. Invalid, if previous byte is not a binary 0.
	this.trackNumber=0;
	// Index in a list of genres, or 255.
	this.genreId=0;
};
/**
 * @type {AudioTagData}
 */
ID3v1.prototype=new AudioTagData;
/**
 * The track genre.
 *
 * @type {String}
 */
Object.defineProperty(ID3v1,"genre",{
	get:function(){
		return this.genreId!==255?ID3v1.genres[this.genreId]:null;
	}
});
/**
 * @param buffer
 */
ID3v1.prototype.populate=function(buffer){
	// Header, the first 3 bytes.
	if(buffer.stringAt(0,3).toUpperCase()!=='TAG'){
		this.errors.push('Error: ID3v1 not found!');
		return;
	}

	this.title=buffer.stringAt(3,30).trim();
	this.artist=buffer.stringAt(33,30).trim();
	this.album=buffer.stringAt(63,30).trim();
	this.year=parseInt(buffer.stringAt(93,4));
	// If track number is stored.
	if(buffer.byteAt(125,1)===0){
		this.comment=buffer.stringAt(97,28).trim();
		this.trackNumber=buffer.byteAt(126);
	}
	else {
		this.comment=buffer.stringAt(97,30).trim();
	}
	this.genreId=buffer.byteAt(127,1);
};
/**
 * The list of supported genres.
 *
 * @type {Array}
 */
ID3v1.genres=[
	'Blues','Classic Rock','Country','Dance','Disco','Funk','Grunge','Hip-Hop','Jazz',
	'Metal','New Age','Oldies','Other','Pop','R&B','Rap','Reggae','Rock','Techno',
	'Industrial','Alternative','Ska','Death Metal','Pranks','Soundtrack','Euro-Techno',
	'Ambient','Trip-Hop','Vocal','Jazz+Funk','Fusion','Trance','Classical','Instrumental',
	'Acid','House','Game','Sound Clip','Gospel','Noise','Alternative Rock','Bass','Soul',
	'Punk','Space','Meditative','Instrumental Pop','Instrumental Rock','Ethnic','Gothic',
	'Darkwave','Techno-Industrial','Electronic','Pop-Folk','Eurodance','Dream',
	'Southern Rock','Comedy','Cult','Gangsta','Top 40','Christian Rap','Pop/Funk','Jungle',
	'Native US','Cabaret','New Wave','Psychadelic','Rave','Showtunes','Trailer','Lo-Fi',
	'Tribal','Acid Punk','Acid Jazz','Polka','Retro','Musical','Rock & Roll','Hard Rock',

	// WinAmp expanded genres.
	'Folk','Folk-Rock','National Folk','Swing','Fast Fusion','Bebob','Latin','Revival',
	'Celtic','Bluegrass','Avantgarde','Gothic Rock','Progressive Rock','Psychedelic Rock',
	'Symphonic Rock','Slow Rock','Big Band','Chorus','Easy Listening','Acoustic','Humour',
	'Speech','Chanson','Opera','Chamber Music','Sonata','Symphony','Booty Bass','Primus',
	'Porn Groove','Satire','Slow Jam','Club','Tango','Samba','Folklore',

	// Other genres.
	'Ballad','Power Ballad','Rhythmic Soul','Freestyle','Duet','Punk Rock','Drum Solo',
	'Acapella','Euro-House','Dance Hall','Goa','Drum & Bass','Club - House','Hardcore',
	'Terror','Indie','BritPop','Negerpunk','Polsk Punk','Beat','Christian Gangsta Rap',
	'Heavy Metal','Black Metal','Crossover','Contemporary Christian','Christian Rock',
	'Merengue','Salsa','Thrash Metal','Anime','JPop','Synthpop'
];
