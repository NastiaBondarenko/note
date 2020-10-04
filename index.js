'use strict'

const note_list = document.getElementById("note_list");
const tittle_text = document.getElementById("headInp");
const main_text = document.getElementById("mainInp");

function Note(tittle ="New Note", content=""){
	this._tittle = tittle;
	this._content = content;
	this._id = Date.now();
	this._selected = false;
}

Note.prototype.setSelected = function (selected){
	this._selected = selected
}
Note.prototype.getSelected = function (selected){
	return this._selected
}

Note.prototype.getTittle = function (){
	return this._tittle;
}

Note.prototype.getUrlName = function (){
	return this._URL;
}

Note.prototype.getContent = function (){
	return this._content;
}

Note.prototype.getId = function (){
	return this._id;
}

Note.prototype.setContent = function(content){
	if(content === ""){
		this._content = ''
		this._tittle = 'New note'
	}
	else{
		this._tittle = content.substr(0,14);	
		this._content = content;
	}
}

function createStore(rootReduse, initialState){
	let state = rootReduse(initialState,{
		type: "__INIT__"
	})
	let substribers = [];
	return{
		getState(){
			return state;
		},
		subscribe(callback){
			substribers.push(callback);
		},
		dispatch(action){
			state = rootReducer(state, action);
			substribers.map(sub => sub());
		}
	}
}


function rootReducer(state, action){
	if(action.type === "ADD_NOTE"){
		const note = action.playload;
		let notesCopy = [...state.notes];
		notesCopy.forEach(note =>{
			note.setSelected(false);
		})
		notesCopy.push(note)
		note.setSelected(true);
		return{
			notes:notesCopy,
			selectedNote : note
		}
	} else if (action.type === 'SELECTE_NOTE'){
		const id = action.playload;
		console.log('id=',id)
		const notesCopy = [...state.notes]
		let selectedNote = null
		for(let i = 0; i < notesCopy.length; i++){
			if (notesCopy[i].getId() == id){
				notesCopy[i].setSelected(true)
				selectedNote = notesCopy[i];
			} else{
				notesCopy[i].setSelected(false)
			}
		}
		return{
			notes:notesCopy,
			selectedNote:selectedNote,
		}
	} else if(action.type === "REMOVE_NOTE"){
		const id = action.playload;
		const notesCopy = [];
		for(let i = 0; i < state.notes.length; i++){
			if(state.notes[i].getId() != id){
				notesCopy.push(state.notes[i])
			}
		}
		return{
			notes: notesCopy,
			selectedNote: null

		}
	}
	else if(action.type === "CHENGE_CONTENT"){
		const id = action.playload.id;
		const content = action.playload.content;
		const notesCopy = [...state.notes];
		let selectedNote = null;
		notesCopy.forEach(note =>{
			if(note.getId() == id){
				note.setContent(content, '')
				selectedNote = note
			}
		})
		return{
			notes: notesCopy,
			selectedNote: selectedNote
		}
	}
	else if(action.type === "SET_NOTES"){
		return{
			notes: action.playload,
			setSelected: null
		}

	}
	return state;
}


const data = () =>{
	let data = new Date().toString();
	data = data.slice(0, data.indexOf("GMT"));
	return data;
}
//console.log(getFormattedDate(data));

let getParams = function (url) {
  var params = {}
  var parser = document.createElement('a')
  url = url || window.location.href;
  parser.href = url;
  var query = parser.search.substring(1);
  console.log(parser.href);
  console.log(query);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    console.log(pair);
    params[pair[0]] = decodeURIComponent(pair[1])
  }
  return params
}

let params = getParams();

let note = new Note();

const store = createStore(rootReducer, {
	notes: [],
	selectedNote: null
});

window.store = store;

function renderNotes(){
	let notes = store.getState().notes
	note_list.innerHTML ="";
	notes.forEach(note =>{
		let noteLi = document.createElement('li')
		if(note.getSelected()){
			noteLi.classList.add('active');
		}
		noteLi.dataset['id'] = note.getId()
		noteLi.appendChild(document.createTextNode(note.getTittle()))
		note_list.insertBefore(noteLi, note_list.firstChild )
	})
}

window.onclick = (event) =>{
	const element = event.target;
	console.log(element);
	if(element.tagName === 'LI'){
		console.log(element.dataset);
		const id = element.dataset['id'];
		store.dispatch({
			type: "SELECTE_NOTE",
			playload: id
		})
	}
} 

window.onload = () =>{
	main_text.value = ''

	if(localStorage.getItem('notes') !== null){
		let notes = JSON.parse(localStorage.getItem('notes'))
		notes.forEach(note =>{
			note.__proto__= Note.prototype
			note.setSelected(false)
		})	
		store.dispatch({
			type: "SET_NOTES",
			playload: notes
		})
		
	}
		if (params['id']) {
		const id = params['id'];
		let notes = store.getState().notes;
		
		if (notes) {
			notes.forEach((note) => {

				note.__proto__ = Note.prototype;
				note.setSelected(false);
				// console.log('note id=',note.getId());
				if (note.getId().toString() === id) {
					note.setSelected(true);
					// console.log(store.selectedNote)
					store.dispatch({
						type: 'SELECTE_NOTE',
						playload: note.getId(),
					});
				}
			});
		}
	} else renderNotes()
}

const new1 = () =>{
	let note = new Note();
	note.setSelected(true);
	store.dispatch({
		type:"ADD_NOTE",
		playload: note,
	})
}

const remove =() =>{
	const state = store.getState()
	if(state.selectedNote !== null){
		store.dispatch({
		type: "REMOVE_NOTE",
		playload: state.selectedNote.getId()
		})
	}
}

main_text.oninput = () => {
	const state = store.getState()
	if(state.selectedNote !== null && state.selectedNote !== undefined){
		store.dispatch({
			type: "CHENGE_CONTENT",
			playload: {
				id: state.selectedNote.getId(),
				content: main_text.value
			}	
		})
	}
}

function insertParam(key, value) {
  window.history.replaceState(null, null, '?' + key + '=' + value)
}

console.log(getParams()["id"]);

store.subscribe(()=>{
	const state = store.getState()
	console.log(state);
	const selectedNote = state.selectedNote;
	console.log("store=",state);
	console.log("selected=",selectedNote);
	if(selectedNote !== null && selectedNote !== undefined ){
		main_text.value = selectedNote.getContent();
	} else{
		main_text.value = ''
	}
	if (state.selectedNote) {
		console.log("state.note");
		if (params['id'] !== state.selectedNote.getId()) {
				insertParam('id', state.selectedNote.getId());
		}
	}	
	renderNotes();
	localStorage.setItem('notes', JSON.stringify(state.notes))
})


