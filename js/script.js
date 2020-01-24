/*
	mp3 music player  based on objects  MVC model
	player have controller based on custom HTML elements

*/


/*
	sound constructor method
*/
class NewMusic{			
	constructor(source, mainObject, link, type){
		this.source = source;
		this.link = link
		this.time = 0;
		this.music = (type === '.mp3')? new Audio(`${this.link}${this.source}${type}`) : (() => {
			mainObject.playerUi.videoObject.setAttribute("src", `${link}${source}${type}`);
			return mainObject.playerUi.videoObject
		})();
		this.mainObject = mainObject;
		this.type = type;
	}
	changeVolume(volume){
		this.music.volume = volume;
	}
	play(){
		if(!this.mainObject.playStatus){
			this.music.play();
			this.mainObject.playStatus = true;
			musicPlayer.buttons.play.className = "fa fa-pause";	
		}else if(this.mainObject.playStatus){
			this.music.pause();
			this.mainObject.playStatus = false;
			musicPlayer.buttons.play.className = "fa fa-play";
		}
		if(!this.music.duration){
			this.mainObject.playStatus = false;
			musicPlayer.buttons.play.className = "fa fa-play";
		}	
		
		this.changeVolume(this.mainObject.volume);	
		layerView.aqualizerActivat();
	}
	stop(){
		this.music.load();
		if(this.mainObject.playStatus){
			this.mainObject.playStatus = false;
			musicPlayer.buttons.play.className = "fa fa-play";
		}
		if(this.type === '.mp3'){
			layerView.aqualizerActivat();
		}
	}
	musicTime(){
		let minutes = this.music.duration/60;
		let minutesCurent = this.music.currentTime/60;
		let time = {
			duration: this.music.duration,
			durationTimeMinutes: parseInt(minutes),
			durationTimeSeconds: (this.music.duration - parseInt(minutes)*60).toFixed(1),
			currentTime: this.music.currentTime,
			currentTimeMinutes: parseInt(minutesCurent), 
			currentTimeSeconds: (this.music.currentTime - parseInt(minutesCurent)*60).toFixed(1),
		}
		if((time.currentTime == time.duration)&&this.mainObject.playStatus){
			if(this.mainObject.shuffleState){
				musicPlayer.changeMusic('shuffle');
			}else{
				musicPlayer.changeMusic('forward');
			}
		}
		if(this.type != '.mp3'){ 
			this.mainObject.playerUi.videoObject.style = "display: block;";
		}else{
			this.mainObject.playerUi.videoObject.style = "display: none;";
		}
		return time
	}
	loadMusic(){
		layerView.showCurrentTrack( this.mainObject.playerUi.currentMusic, this.source);
	}
	setTime(widthX){	
		let time = this.musicTime();
		this.music.currentTime = time.duration/100*parseInt(widthX);
	}
}

/*
	Main player Object 
		- all data about player
			- links
		- all dom objects
		- all buttons Event 
*/
var musicPlayer = {
	currentTrack: 0,
	volume: 0.3,
	allMUsic: [],
	rangeClicked: false,
	playStatus: false,
	selectRow: null,
	muzFolderLink: './music/', 
	timeChack: null,
	shuffleState: false,
	buttons: {
		play: document.querySelector('#play'),
		stop: document.querySelector('#stop'),
		forward: document.querySelector('#forward'),
		backward: document.querySelector('#backward'),
		shuffle: document.querySelector('#shuffle'),
		soundLevel: document.querySelector('#sound-level'),
	},
	playerUi: {
		indicator: document.querySelector('#indicator'),
		dragable: document.querySelector('#dragable'),
		soundRange: document.querySelector('#sound-range'),
		musicList: document.querySelector('#music-list'),
		currentMusic: document.querySelector('#current-music'),
		currentTime: document.querySelector('#current-time'),
		durationTime: document.querySelector('#duration-time'),
		videoObject: document.querySelector('#videoObject'),
	},
	playerInit(){
		this.volume = this.buttons.soundLevel.value/100;
		this.createAllMusic(this.playerUi.musicList, music);
		this.events();
		this.checkTime();
	},
	createAllMusic(listDom, music){
		let object = this;
		for(let musicName of music){
			let musicObject = new NewMusic(musicName.name, this, this.muzFolderLink, musicName.type);
			layerView.showSoundList(this.playerUi.musicList, musicName);

			this.allMUsic.push(musicObject);
		}
		[...this.playerUi.musicList.children].forEach( listElement => {
			listElement.addEventListener('dblclick', function(){
				let chosenTrack = object.allMUsic.find( track => {
					return track.source == this.innerText
				})
				chosenTrack = object.allMUsic.indexOf(chosenTrack);
				object.changeMusic('selected', chosenTrack);
			});
			listElement.addEventListener('click', function(){
				object.selectRow = this;
			});
		})
	},

	displayProcess(chose){
		this.allMUsic[this.currentTrack].loadMusic();
		layerView.higlightRow([...this.playerUi.musicList.children], this.currentTrack, chose);
	},
	changeMusic(direction, track){
			let object = this;
			const changeTrack = () => {
				object.allMUsic[object.currentTrack].stop();
				if(direction != 'shuffle' && direction != 'selected'){
					object.currentTrack += (direction == 'forward')
					? 1 
					: (1 * (-1))
				}else if(direction == 'selected'){
					object.currentTrack = track;
				}else{
					let index = Math.floor(Math.random()*object.allMUsic.length);
					while(index == object.currentTrack){
						index = Math.floor(Math.random()*object.allMUsic.length);
					}
					object.currentTrack = index;
				}	 
				if(object.currentTrack >= object.allMUsic.length){
					object.currentTrack = 0;	
				}else if(object.currentTrack < 0){
					object.currentTrack = object.allMUsic.length -1;	
				}
			}
			if(object.playStatus){
				changeTrack();
				object.allMUsic[object.currentTrack].play();
			}else if(!object.playStatus){
				changeTrack();
			}
		object.displayProcess(object.selectRow);
	},
	events(){
		let object = this;
		const setRangePosition = function(event, domObject){
			//object.widthX = parseInt((event.pageX - domObject.offsetLeft)/(domObject.clientWidth/100)); 
			object.widthX = parseInt((event.layerX - 15)/(domObject.clientWidth/100)); 
			//console.log(event.layerX,event, domObject, event.pageX, domObject.offsetLeft, domObject.clientWidth)
			if(object.widthX < 100){
				layerView.changeSoundRangeView(object.playerUi.indicator, object.widthX);
			}else if(object.widthX >= 100){
				object.widthX = 100;
				layerView.changeSoundRangeView(object.playerUi.indicator, object.widthX);
			}	
		}
		layerView.aqualizerActivat();
		this.displayProcess(this.selectRow)

		this.buttons.play.addEventListener('click', function(){
			object.allMUsic[object.currentTrack].play();
		});

		this.playerUi.dragable.addEventListener('mousedown', function(e){
			object.rangeClicked = true;
		});
		document.addEventListener('mouseup', function(e){
			if(object.rangeClicked){
				object.rangeClicked = false;
				setRangePosition(e, object.playerUi.soundRange);
			}
		});

		this.playerUi.soundRange.addEventListener('mousemove', function(e){
			if(object.rangeClicked){
				setRangePosition(e, this);
				object.allMUsic[object.currentTrack].setTime(object.widthX);
			}
		});
		this.playerUi.soundRange.addEventListener('click', function(e){
			setRangePosition(e, this);
			object.allMUsic[object.currentTrack].setTime(object.widthX);
		})


		this.buttons.stop.addEventListener('click', function(){
			object.allMUsic[object.currentTrack].stop();
		})
		this.buttons.forward.addEventListener('click', function(){
			(object.shuffleState)? object.changeMusic('shuffle'): object.changeMusic('forward');
		})
		this.buttons.backward.addEventListener('click', function(){
			(object.shuffleState)? object.changeMusic('shuffle'): object.changeMusic('backward');
		})

		this.buttons.shuffle.addEventListener('click', function(){
			object.shuffleState =  (!object.shuffleState)? true : false;
		})
		this.buttons.soundLevel.addEventListener('change', function(e){
			object.volume = this.value/100;
			object.allMUsic[object.currentTrack].changeVolume(object.volume);
		})
	},
	checkTime(){
		let object = this;
		this.timeChack = setInterval( function(){
			if(object.currentTrack < 0){
				object.currentTrack = 0;
			}
			object.allMUsic[object.currentTrack].musicTime();
			let timeObj = object.allMUsic[object.currentTrack].musicTime();
			layerView.showTime(timeObj, object.playerUi.currentTime, object.playerUi.durationTime);

			object.displayProcess(object.selectRow);
		}, 25);
	}
}

/*
	View object
		- display all data
		- change style class
		- change text
*/
var layerView = {
	boxArr: ['box1', 'box2', 'box3', 'box4', 'box5', 'box6', 'box7', 'box8', 'box9', 'box10', 'box11', 'box12', 'box13', 'box14'],
	changeSoundRangeView(object, width){
		object.style = `width: ${parseInt(width)}%;`;
	},
	showSoundList(listDom, music){
			this.createNewItems(listDom, 'li', music.name)
	},
	createNewItems(upperObject, object, content){
		let objectNew = document.createElement(object);
		objectNew.innerText = content;
		upperObject.appendChild(objectNew);
	},
	showCurrentTrack(domObject, track){
		domObject.innerHTML = `<p>${track}</p>`;
	},
	higlightRow(domObject, currentObject, selectRow){
		domObject.forEach( list =>{
			list.className = '';
		})
		if(selectRow){
			selectRow.className = 'selected-song-temp';
			if(domObject[currentObject].innerText == selectRow.innerText){
				musicPlayer.selectRow = null;
			}
		}
		domObject[currentObject].className = 'selected-song';
	},
	showTime(time, currentTime, durationTime){
		if(musicPlayer.shuffleState){
			musicPlayer.buttons.shuffle.className = 'fa fa-random shuffleActive';  // class="fa fa-random"  material-icons shuffleActive
		}else if(!musicPlayer.shuffleState){
			musicPlayer.buttons.shuffle.className = 'fa fa-random';
		}	
		currentTime.innerHTML = `${time.currentTimeMinutes}:${time.currentTimeSeconds}`;
		durationTime.innerHTML = `${time.durationTimeMinutes}:${time.durationTimeSeconds}`;
		musicPlayer.widthX = parseInt(time.currentTime/(time.duration/100));
		this.changeSoundRangeView(musicPlayer.playerUi.indicator, musicPlayer.widthX)
	},
	aqualizerActivat(){
		let aqualizerObject = document.querySelector('#aqualizer').children;
		[...aqualizerObject].forEach( (column, i) => {
			if(musicPlayer.playStatus){
				column.className = `sound-box ${this.boxArr[i]}`;
			}else if(!musicPlayer.playStatus){
				column.className = 'sound-box stop-play';
			}
		})
	}
}

/*
	start script
*/
//musicPlayer.playerInit()
	var music = musicDB; 		// music Database  in JSON Object format
	musicPlayer.playerInit();

