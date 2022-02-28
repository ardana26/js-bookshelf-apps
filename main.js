const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function(){
	
	const submitBook = document.getElementById("inputBook");
	const inputSearch = document.getElementById("searchBook");
	
	submitBook.addEventListener("submit", function(event){
		event.preventDefault();
		addBook();
	});
	
	inputSearch.addEventListener("submit", function(event){
		event.preventDefault();
		
		const searchByTitle = document.getElementById("searchBookTitle").value;
		bookSearch(searchByTitle);
	});
	
	if(isStorageExist()){
		loadFromStorage();
	}
});

function addBook(){
	const bookTitle = document.getElementById("inputBookTitle").value;
	const bookAuthor = document.getElementById("inputBookAuthor").value;
	const bookYear = document.getElementById("inputBookYear").value;
	const bookIsComplete = document.getElementById("inputBookIsComplete").checked;
	const generatedId = generateId();
	const bookObject = generateBookObject(generatedId, bookTitle, bookAuthor, bookYear, bookIsComplete);
	books.push(bookObject);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function generateId(){
	return +new Date();
}

function generateBookObject(id, title, author, year, isComplete){
	return {
		id,
		title,
		author,
		year,
		isComplete
	}
}

document.addEventListener(RENDER_EVENT, function(){
	const incompleteBookList = document.getElementById("incompleteBookshelfList");
	incompleteBookList.innerHTML = "";
	
	const completeBookList = document.getElementById("completeBookshelfList");
	completeBookList.innerHTML = "";
	
	for(bookItem of books){
		const bookElement = makeBook(bookItem);
		
		if(bookItem.isComplete == false){
		    incompleteBookList.append(bookElement);
		}else{
			completeBookList.append(bookElement);
		}
	}
});

function makeBook(bookObject){
	const textTitle = document.createElement("h3");
	textTitle.innerText = bookObject.title;
	
	const textAuthor = document.createElement("p");
	textAuthor.innerText = "Penulis: " + bookObject.author;
	
	const textYear = document.createElement("p");
	textYear.innerText = "Tahun: " + bookObject.year;
	
	const lineBottom = document.createElement("hr");
	
	const container = document.createElement("article");
	container.classList.add("book_item");
	container.append(textTitle, textAuthor, textYear);
	container.setAttribute("id", 'book-${bookObject.id}');
	
	if(bookObject.isComplete){
		const undoButton = document.createElement("button");
		undoButton.classList.add("btn-success");
		undoButton.innerText = "Belum selesai dibaca";
		undoButton.addEventListener("click", function(){
			undoBookFromCompleted(bookObject.id);
		});
		
		const trashButton = document.createElement("button");
		trashButton.classList.add("btn-danger");
		trashButton.innerText = "Hapus buku";
		trashButton.addEventListener("click", function(){
			let message = "Apakah anda yakin ingin menghapus Buku?";
			let confirmation = confirm(message);
			
			if(confirmation){
				removeBookFromCompleted(bookObject.id);
			}
		});
		
		const buttonContainer = document.createElement("div");
		buttonContainer.classList.add("action");
		
		buttonContainer.append(undoButton, trashButton);
		
		container.append(buttonContainer, lineBottom);
		
	} else {
		const undoButton = document.createElement("button");
		undoButton.classList.add("btn-success");
		undoButton.innerText = "Selesai dibaca";
		undoButton.addEventListener("click", function(){
			addBookToCompleted(bookObject.id);
		});
		
		const trashButton = document.createElement("button");
		trashButton.classList.add("btn-danger");
		trashButton.innerText = "Hapus buku";
		trashButton.addEventListener("click", function(){
			let message = "Apakah anda yakin ingin menghapus Buku?";
			let confirmation = confirm(message);
			
			if(confirmation){
				removeBookFromCompleted(bookObject.id);
			}
		});
		
		const buttonContainer = document.createElement("div");
		buttonContainer.classList.add("action");
		
		buttonContainer.append(undoButton, trashButton);
		
		container.append(buttonContainer, lineBottom);
	}
	
	return container;
}

function addBookToCompleted(bookId) {
	const bookTarget = findBook(bookId);
	if(bookTarget == null) return;
	
	bookTarget.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function findBook(bookId){
	for(bookItem of books){
		if(bookItem.id === bookId){
			return bookItem
		}
	}
	return null
}

function removeBookFromCompleted(bookId){
	const bookTarget = findBookIndex(bookId);
	if(bookTarget === -1) return;
	books.splice(bookTarget, 1);
	
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function undoBookFromCompleted(bookId){
	const bookTarget = findBook(bookId);
	if(bookTarget == null) return;
	
	bookTarget.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function bookSearch(searchByTitle){
	const filter = searchByTitle.toUpperCase();
	const titles = document.getElementsByTagName("h3");
	
	for(let i = 0; i < titles.length; i++){
	    const titlesText = titles[i].textContent || titles[i].innerText;
        
        if(titlesText.toUpperCase().indexOf(filter) > -1) {
           titles[i].closest(".book_item").style.display = "";
        }else{
           titles[i].closest(".book_item").style.display = "none";
       }
	}
}

function findBookIndex(bookId){
	for(index in books){
		if(books[index].id === bookId){
			return index
		}
	}
	return -1
}

function saveData(){
	if(isStorageExist()){
		const parsed = JSON.stringify(books);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELFAPPS";

function isStorageExist(){
	if(typeof(Storage) === undefined){
		alert("Browser tidak mendukung local storage");
		return false
	}
	return true;
}

document.addEventListener(SAVED_EVENT, function(){
	console.log(localStorage.getItem(STORAGE_KEY));
});

function loadFromStorage(){
	const serializedData = localStorage.getItem(STORAGE_KEY);
	
	let data = JSON.parse(serializedData);
	
	if(data !== null){
		for(book of data){
			books.push(book)
		}
	}
	
	document.dispatchEvent(new Event(RENDER_EVENT));
}