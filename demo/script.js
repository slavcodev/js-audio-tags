// Check for the various File API support.
if(window.File && window.FileReader && window.FileList && window.Blob) {
	document.getElementById('files').addEventListener('change',function(e) {
		if(!e.target.files.length) {
			alert('Please select a file!');
			return;
		}

		var file=e.target.files[0];
		var output=document.getElementById('output');

		function print(str){
			output.innerHTML+=(str+"<br>");
		}

		function readID3v1FromFile(file){
			var reader=new ID3v1Reader;
			reader.onLoaded=function(e){
				print('Read ID3v1');
				if(e.target.hasError()){
					for(var i=0;i<e.target.errors.length;i++){
						print(e.target.errors[i]);
					}
				}
				else {
					print(e.target.result.title);
				}
				print("");
			};
			reader.readFromFile(file);
		}

		function readID3v2FromFile(file){
			var reader=new ID3v2Reader;
			reader.onLoaded=function(e){
				print('Read ID3v2');
				if(e.target.hasError()){
					for(var i=0;i<e.target.errors.length;i++){
						print(e.target.errors[i]);
					}
				}
				else {
					print(e.target.result.header.size);
				}
				print("");
			};
			reader.readFromFile(file);
		}

		!function(file){
			if(file.type=='audio/mpeg'){
				print('Read file: "'+file.name+'"');
				//readID3v1FromFile(file);
				readID3v2FromFile(file);
			}
			else if(file.type=='application/ogg'){
				print('Not implemented yet. Please wait.');
			}
			else {
				print('Unsupported file type <'+file.type+'>');
			}
		}(file);
	});
}
else {
	alert('The File APIs are not fully supported in this browser.');
}
