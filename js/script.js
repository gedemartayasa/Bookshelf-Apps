const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function(){
    const submitForm = document.getElementById("form");
    submitForm.addEventListener("submit", function (event){
        Swal.fire({
            position: 'top',
            icon: 'success',
            title: 'Your work has been saved',
            showConfirmButton: false,
            timer: 1600
          })
        event.preventDefault();
        addBook();
    });
    if(isStorageExist()){
        loadDataFromStorage();
    }
});

function addBook() {
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const year = document.getElementById("year").value;
  
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, false);
    books.push(bookObject);
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}
 
function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedREADBook = document.getElementById("unread");
    uncompletedREADBook.innerHTML = "";
   
    const completedREADBook = document.getElementById("read");
    completedREADBook.innerHTML = "";

    for(bookItem of books){
        const bookElement = makeBook(bookItem);
     
        if(bookItem.isCompleted == false){
            uncompletedREADBook.append(bookElement);
        }
        else{
            completedREADBook.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const bookTitle = document.createElement("h2");
    bookTitle.innerText = bookObject.title;
  
    const bookAuthor = document.createElement("p");
    bookAuthor.innerText ="Penulis : "+ bookObject.author;

    const bookYear = document.createElement("p");
    bookYear.innerText ="Tahun : "+ bookObject.year;
  
    const textContainer = document.createElement("div");
    textContainer.classList.add("inner");
    textContainer.append(bookTitle, bookAuthor, bookYear);
  
    const container = document.createElement("div");
    container.classList.add("item", "shadow");
    container.append(textContainer);
    container.setAttribute("id", `book-${bookObject.id}`);

    if(bookObject.isCompleted){
        const unreadButton = document.createElement("button");
        unreadButton.classList.add("unread-button");
        unreadButton.addEventListener("click", function () {
            Swal.fire({
                title: 'Do you want to save the changes?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Save',
                denyButtonText: `Don't save`,
              }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                  Swal.fire('Saved!', undoBookFromCompletedRead(bookObject.id), 'success')
                } else if (result.isDenied) {
                  Swal.fire('Changes are not saved', '', 'info')
                }
              })
        });
   
        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        trashButton.addEventListener("click", function () {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then((result) => {
                if (result.isConfirmed) {
                  Swal.fire(
                    'Deleted!',removeBook(bookObject.id),'success')
                }
              })
               
        });
        container.append(unreadButton, trashButton);
    }else{
        const readButton = document.createElement("button");
        readButton.classList.add("read-button");
        readButton.addEventListener("click", function (){
            Swal.fire({
                title: 'Do you want to save the changes?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Save',
                denyButtonText: `Don't save`,
              }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                  Swal.fire('Saved!', addBookToCompletedRead(bookObject.id), 'success')
                } else if (result.isDenied) {
                  Swal.fire('Changes are not saved', '', 'info')
                }
              })
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        trashButton.addEventListener("click", function () {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then((result) => {
                if (result.isConfirmed) {
                  Swal.fire(
                    'Deleted!',
                    removeBook(bookObject.id),
                    'success'
                  )
                }
              })           
        });
        container.append(readButton, trashButton);
    }
    return container;
}

function addBookToCompletedRead(bookId) {
    const bookShelfTarget = findBook(bookId);
    if(bookShelfTarget == null){
        return;
    }
    bookShelfTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId){
    for(bookItem of books){
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}

function removeBook(bookId) {
    const bookShelfTarget = findBookIndex(bookId);
    if(bookShelfTarget === -1){
        return;
    }
    books.splice(bookShelfTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}
   
function undoBookFromCompletedRead(bookId){ 
    const bookShelfTarget = findBook(bookId);
    if(bookShelfTarget == null){
        return; 
    }
    bookShelfTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for(index in books){
        if(books[index].id === bookId){
            return index;
        }
    }
    return -1;
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function saveData() {
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}
 
function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if(data !== null){
        for(book of data){
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}