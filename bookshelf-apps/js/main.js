// Scripts
document.addEventListener("DOMContentLoaded", function(){
    const submitBookForm = document.getElementById("inputBook");
    const checkCompletedRead = document.getElementById("inputBookIsComplete");
    const submitSearchForm = document.getElementById("searchBook");

    submitBookForm.addEventListener("submit", function(event){
        event.preventDefault();
        if(isEditingBook()) saveEditBook();
        else addBook();
    });

    submitSearchForm.addEventListener("submit", function(event){
        event.preventDefault();
        searchBook();
    });

    const editForm = document.getElementById("bookEditSubmit");
    editForm.style.display = "none";

    checkCompletedRead.addEventListener("click", function(){
        checkCompleted();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    resetEditBookId();
});

document.addEventListener("SAVED_EVENT", function(){
    console.log("Data Berhasil Di Simpan");
});

document.addEventListener("onbookdataloaded", function(){
    refreshBookDataFromBooks();
});

// Manipulation
const UNCOMPLETED_BOOK_LIST_ID = "uncompleteBookshelfList";
const COMPLETED_BOOK_LIST_ID = "completedBookshelfList";
const BOOK_ID = "bookId";

let temporaryEditedBook = null;

function addBook() {
    const completedBookList = document.getElementById(COMPLETED_BOOK_LIST_ID);
    const uncompletedBookList = document.getElementById(UNCOMPLETED_BOOK_LIST_ID);

    const bookTitle = document.getElementById("inputBookTitle").value;
    const bookAuthor = document.getElementById("inputBookAuthor").value;
    const bookYear = document.getElementById("inputBookYear").value;
    const isBookCompleted = document.getElementById("inputBookIsComplete").checked;

    const book = makeBook(bookTitle, bookAuthor, bookYear, isBookCompleted);
    const bookObject = createBookObject(bookTitle, bookAuthor, bookYear, isBookCompleted);

    book[BOOK_ID] = bookObject.id;
    books.push(bookObject);

    if (isBookCompleted) {
        completedBookList.append(book);
    }else {
        uncompletedBookList.append(book);
    }
    updateBookDataToStorage();
    resetSubmitForm();
    checkCompleted();
}

function checkCompleted() {
    const isBookCompleted = document.getElementById("inputBookIsComplete").checked;
    const bookRead = document.getElementById("bookRead");

    if (isBookCompleted) {
        bookRead.innerText = "Selesai Dibaca"
    }else {
        bookRead.innerText = "Belum Selesai Dibaca"
    }
}

function makeBook(title, author, year, isBookCompleted) {
    const bookTitleText = document.createElement("h3");
    bookTitleText.innerText = title;

    const bookAuthorText = document.createElement("p");
    bookAuthorText.innerHTML = 'Penulis : <span id="author">' + author + '</span>';

    const bookYearText = document.createElement("p");
    bookYearText.innerHTML = 'Tahun Terbit : <span id="year">' + year + '</span>';

    const action = document.createElement("div");
    action.classList.add("action");

    if (isBookCompleted) {
        action.append(createUncompletedButton(), createDeleteButton(),createEditButton());
    }else {
        action.append(createCompletedButton(), createDeleteButton(),createEditButton());
    }

    const article = document.createElement("article");
    article.classList.add("book_item");
    article.append(bookTitleText, bookAuthorText, bookYearText, action);

    return article;
}

function editBookList(book){
    const confirmEdit = confirm("Apakah anda yakin ingin mengedit buku ini ?");
    if (confirmEdit === true) {
    const bookObj = findBook(book[BOOK_ID]);
    const editForm = document.getElementById("inputBook");
    editForm.querySelector("#bookSubmit").style.display = "none";
    editForm.querySelector("#bookEditSubmit").style.display = "block";

    const editTitle = editForm.querySelector("#inputBookTitle");
    const editAuthor = editForm.querySelector("#inputBookAuthor");
    const editYear = editForm.querySelector("#inputBookYear");
    const editisCompleted = editForm.querySelector("#inputBookIsComplete");

    const inputTitle = document.getElementById("book_form_header");
    editTitle.focus();
    inputTitle.scrollIntoView();

    editTitle.value = bookObj.title;
    editAuthor.value = bookObj.author;
    editYear.value = bookObj.year;
    editisCompleted.checked = bookObj.isCompleted;
    }
    setEditBookId(book[BOOK_ID]);
    temporaryEditedBook = book;
}

function saveEditBook(){
    const editForm = document.getElementById("inputBook");

    const title = editForm.querySelector("#inputBookTitle").value;
    const author = editForm.querySelector("#inputBookAuthor").value;
    const year = editForm.querySelector("#inputBookYear").value;
    const isCompleted = editForm.querySelector("#inputBookIsComplete").checked;

    const bookId = Number(getEditBookId());
    const choosenBook = findBook(bookId);
    choosenBook.title = title;
    choosenBook.author = author;
    choosenBook.year = year;
    choosenBook.isCompleted = isCompleted;

    const editedBook = makeBook(title, author, year, isCompleted);
    editedBook[BOOK_ID] = choosenBook.id;

    let bookShelf = null;
    if(isCompleted){
        bookShelf = document.getElementById(COMPLETED_BOOK_LIST_ID);
    }
    else{
        bookShelf = document.getElementById(UNCOMPLETED_BOOK_LIST_ID);
    }

    bookShelf.append(editedBook);
    updateBookDataToStorage();

    resetEditBookId();
    temporaryEditedBook.remove();
    temporaryEditedBook = null;
    resetSubmitForm();
    alert("Buku berhasil di edit");
}

function deleteBookList(book) {
    const bookPosition = findBookIndex(book[BOOK_ID]);
    const confirmDelete = confirm("Apakah anda yakin ingin menghapus buku ini ?");
    if (confirmDelete === true) {
      books.splice(bookPosition, 1);
      book.remove();
    }
    updateBookDataToStorage();
  }

function searchBook() {
    const existingBookList = document.getElementsByClassName("book_item");
	const bookTitle = document.getElementById("searchBookTitle").value;

    for (let i = 0; i < existingBookList.length; i++) {
		let bookFound = existingBookList[i].childNodes[0].innerText.toLowerCase() == bookTitle.toLowerCase();

		if (bookFound || bookTitle == "") {
			existingBookList[i].style.display = "block";
		} else if (!bookFound) {
			existingBookList[i].style.display = "none";
		}
	}
}

function resetSubmitForm(){
    const submitForm = document.getElementById("inputBook");
    submitForm.querySelector("#bookSubmit").style.display = "block";
    submitForm.querySelector("#bookEditSubmit").style.display = "none";

    submitForm.querySelector("#inputBookTitle").value = "";
    submitForm.querySelector("#inputBookAuthor").value = "";
    submitForm.querySelector("#inputBookYear").value = "";
    submitForm.querySelector("#inputBookIsComplete").checked = false;
}

function addBookToCompleted(book) {
    const bookObj = findBook(book[BOOK_ID]);
    bookObj.isCompleted = true;
    

    const bookTitle = bookObj.title;
    const bookAuthor = bookObj.author;
    const bookYear = bookObj.year;

    const newBook = makeBook(bookTitle, bookAuthor, bookYear, true);
    const listCompleted = document.getElementById(COMPLETED_BOOK_LIST_ID);
    newBook[BOOK_ID] = bookObj.id;
    
    listCompleted.append(newBook);

    book.remove();

    updateBookDataToStorage();
}

function undoBookToUncompleted(book) {
    const bookObj = findBook(book[BOOK_ID]);
    bookObj.isCompleted = false;
    

    const bookTitle = bookObj.title;
    const bookAuthor = bookObj.author;
    const bookYear = bookObj.year;

    const newBook = makeBook(bookTitle, bookAuthor, bookYear, false);
    const listUncompleted = document.getElementById(UNCOMPLETED_BOOK_LIST_ID);
    newBook[BOOK_ID] = bookObj.id;

    listUncompleted.append(newBook);

    book.remove();
  
    updateBookDataToStorage();
  }
  
  function refreshBookDataFromBooks() {
    const uncompletedBookList = document.getElementById(UNCOMPLETED_BOOK_LIST_ID);
    let completedBookList = document.getElementById(COMPLETED_BOOK_LIST_ID);
  
    for (book of books) {
      const newBookList = makeBook(book.title, book.author, book.year, book.isCompleted);
      newBookList[BOOK_ID] = book.id;
  
      if (book.isCompleted) {
        completedBookList.append(newBookList);
      } else {
        uncompletedBookList.append(newBookList);
      }
    }
  }

function createActionButton(button, buttonClassName, evenListener) {
    button.classList.add(buttonClassName);
    button.addEventListener("click", function(event){
        evenListener(event);
    });
    return button;
}

function createCompletedButton() {
    const completedButton = document.createElement("button");
    completedButton.setAttribute("title", "Pindahkan ke Rak Sudah Selesai Dibaca");
    return createActionButton(completedButton, "read_button", function(event){
        addBookToCompleted(event.target.parentElement.parentElement);
    });
}

function createUncompletedButton() {
    const unCompletedButton = document.createElement("button");
    unCompletedButton.setAttribute("title", "Pindahkan ke Rak Belum Selesai Dibaca");
    return createActionButton(unCompletedButton,"unread_button", function(event){
        undoBookToUncompleted(event.target.parentElement.parentElement);
    });
}

function createEditButton() {
    const editButton = document.createElement("button");
    editButton.setAttribute("title", "Edit Buku");
    return createActionButton(editButton, "edit_button", function(event){
        editBookList(event.target.parentElement.parentElement);
    });
}

function createDeleteButton() {
    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("title", "Hapus Buku");
    return createActionButton(deleteButton, "delete_button", function(event){
        deleteBookList(event.target.parentElement.parentElement);
    });
}

// Data 
const STORAGE_BOOK_KEY = "BOOKSHELF_APPS";
const EDIT_BOOK_KEY = "EDIT_BOOK_ID";

let books = [];

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert("Browser kamu tidak mendukung Local Storage");
        return false;
    }
    return true;
}

function saveBookData() {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_BOOK_KEY, parsed);
    document.dispatchEvent(new Event("SAVED_EVENT"));
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_BOOK_KEY);

    let data = JSON.parse(serializedData);

    if (data !== null) {
        books = data;
    }
    document.dispatchEvent(new Event("onbookdataloaded"));
}

function updateBookDataToStorage() {
    if (isStorageExist()) {
        saveBookData();
    }
}

function createBookObject(title, author, year, isCompleted) {
    const bookObject = {
        id: +new Date(),
        title,
        author,
        year,
        isCompleted,
    };
    return bookObject;
}

function findBook(bookId) {
    for (book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    let index = 0;
    for (book of books) {
        if (book.id ===  bookId) {
            return index;
        }
        index++;
    }
    return -1;
}

function resetEditBookId(){
    sessionStorage.removeItem(EDIT_BOOK_KEY);
}

function setEditBookId(bookId){
    sessionStorage.setItem(EDIT_BOOK_KEY, bookId);
}

function getEditBookId(){
    return sessionStorage.getItem(EDIT_BOOK_KEY);
}

function isEditingBook(){
    return getEditBookId() != null;
}

// END