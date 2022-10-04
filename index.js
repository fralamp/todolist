////////////Button and Input
const buttonAddTask = document.querySelector('#add-task');
const inputNewTask = document.querySelector('#new-task');
const buttonAllTasks = document.querySelector('#btn-all-tasks');
const buttonDoneTasks = document.querySelector('#btn-done-tasks');
const buttonUndoneTasks = document.querySelector('#btn-undone-task');
const switcherAllTasks = document.querySelector('input[value="check-all-task"]');
const buttonDelAllTasks = document.querySelector('div[value="del-all-tast"]');
// const allInputCheckbox = document.querySelectorAll('#input-checkbox-task');


//// Other
const tasksListDiv = document.querySelector('#tasks');
const counterTasks = document.querySelector('#count');

////////// Data tasks
const TasksArray = []; // здесь храним задачи  

// проверка при загрузке страницы на наличие имеющихся задач

// (function () {

document.onreadystatechange = function(){
    if(document.readyState === 'complete'){

        buttonAllTasks.checked = true;

        if (localStorage.getItem('taskStorage') !== null){
            loadingLocalStorageTasks();
            
        } else {
            localStorage.setItem('taskStorage', JSON.stringify(TasksArray));
        }

        if(localStorage.getItem('switcherAllTasks') !== null){
            loadingLocalStorageMajorCheckbox();

        } else {
            localStorage.setItem('switcherAllTasks', switcherAllTasks.checked);
        } 
        
        counterTasksFunc(TasksArray);
        renderTask(TasksArray);
    }
} 


// обработчик событий на кнопке добавления задачи 
buttonAddTask.addEventListener('click', (_) => {
    const newTextTask = inputNewTask.value.trim(); // текст задачи
    if(newTextTask){
        buttonAddTask.classList.add('todolist__btn-new-task--ready');
        inspectInput();
        if(buttonAllTasks.checked){
            renderTask(TasksArray);
        }

        if(buttonDoneTasks.checked){
            renderDoneTask(TasksArray);
        }

        if(buttonUndoneTasks.checked){
            inspectInput();
            autoFocusInput(inputNewTask);
            renderUndoneTask(TasksArray);
        }

        localStorage.setItem('taskStorage', JSON.stringify(TasksArray));

        switcherAllTasks.checked = false;
        autoFocusInput(inputNewTask);

        localStorage.setItem('switcherAllTasks', switcherAllTasks.checked);
    }
    
    if(!newTextTask){
        buttonAddTask.classList.remove('todolist__btn-new-task--ready');
    }
});

// обработчки событий для отправка на enter
inputNewTask.addEventListener('keyup', (event) => {
    const newTextTask = inputNewTask.value;
    if(event.key === 'Enter' && newTextTask !== ''){
        inspectInput();

        if(buttonAllTasks.checked){
            renderTask(TasksArray);
            counterTasksFunc(TasksArray);
        }

        if(buttonDoneTasks.checked){
            renderDoneTask(TasksArray);
            counterTasksFunc(TasksArray);
        }

        if(buttonUndoneTasks.checked){
            inspectInput();
            autoFocusInput(inputNewTask);
            renderUndoneTask(TasksArray);
            counterTasksFunc(TasksArray);
        }
    }
});


// проверка на пустую строку
inputNewTask.addEventListener('keyup', (_) => {
    const newTextTask = inputNewTask.value
    const term = newTextTask.trim().toLowerCase();
    if(term){
        buttonAddTask.classList.add('todolist__btn-new-task--ready');
    }
    if(!term) {
        buttonAddTask.classList.remove('todolist__btn-new-task--ready');
    }
});

// рендер соответсвующего услвиям список ("все задачи")
buttonAllTasks.addEventListener('click', (_) => {
    renderTask(TasksArray);
});

// рендер соответсвующего услвиям список ("все выполненные задачи")
buttonDoneTasks.addEventListener('click', (_) => {
    renderDoneTask(TasksArray);
});


// рендер соответсвующего услвиям список ("все невыполненные задачи")
buttonUndoneTasks.addEventListener('click', (_) => {
    renderUndoneTask(TasksArray);
});

// удаляем по кнопке все задачи
buttonDelAllTasks.addEventListener('click', (_) => {
    deleteAllTask(TasksArray);
    localStorage.removeItem('taskStorage');
    counterTasksFunc(TasksArray);
    renderTask(TasksArray);
});


// слушатель на кнопку выбора всех задач
switcherAllTasks.addEventListener('click', (_) => {
    changeAllTaskStatus();

    //проверка на выбранные radiobutton
    if (buttonAllTasks.checked){
        renderTask(TasksArray);
    }

    if (buttonUndoneTasks.checked){
        renderUndoneTask(TasksArray);
    }

    if (buttonDoneTasks.checked){
        renderDoneTask(TasksArray);
    }

    localStorage.setItem('switcherAllTasks', switcherAllTasks.checked);
    localStorage.setItem('taskStorage', JSON.stringify(TasksArray));
    
} );


//взаимодействие с задачей(отметка о выполнении, удаление)
tasksListDiv.addEventListener('click', event => {
    const target = event.target; // элемент по которому кликнули внутри контейнера (<div class='todolist__list' id='tasks'>)
    const inputCheckbox = target.classList.contains('todolist__checkbox-div'); 
    const divText = target.classList.contains('todolist__task-text');
    const btnDel = target.classList.contains('todolist__btn-del-task');
    const blockTask = target.classList.contains('todolist__task');
    const iconDel = target.classList.contains('todolist__icon-del');
    const btnEdit = target.classList.contains('todolist__btn-edit');


    if (blockTask){
        const taskId = target.getAttribute('id');
        changeTaskStatus(taskId, TasksArray);
    } // проверка клика блок задачи

    if (inputCheckbox){
        const task = target.parentElement.parentElement;
        const taskId = task.getAttribute('id');
        changeTaskStatus(taskId, TasksArray);
    } // проверка клика на чекбоксе задачи

    if (divText){
        const task = target.parentElement;
        const taskId = task.getAttribute('id');
        changeTaskStatus(taskId, TasksArray);
    } // проверка клика на тексте задачи


    if (btnDel) {
        const task = target.parentElement;
        const taskId = task.getAttribute('id');
        deleteTask(taskId, TasksArray);
    }

    if (iconDel) {
        const task = target.parentElement.parentElement;
        const taskId = task.getAttribute('id');
        deleteTask(taskId, TasksArray);
    }

    //кнопка изменения текста задачи
    if(btnEdit) {
        const task = target.parentElement; // находим родительский элемент
        const taskId = task.getAttribute('id');
        const textChangingTask = document.querySelector(`#${taskId} > .todolist__task-text`); // находим поле с изначальным текстом задачи
        const inputChangeText = document.querySelector(`#${taskId} > .todolist__edit-input`); // поле для редактирования текста задачи

        const textInput = inputChangeText.value;

        if(!target.classList.contains('changing')) {
            target.classList.add('changing')
            textChangingTask.classList.add('edit');
            inputChangeText.classList.remove('edit');

        } else {

            editTaskFunc(taskId, TasksArray, textInput)
            target.classList.remove('changing')
            textChangingTask.classList.remove('edit');
            inputChangeText.classList.add('edit');
            renderTask(TasksArray)
        }
        localStorage.setItem('taskStorage', JSON.stringify(TasksArray));
    }


}); // слушатель на checkbox


function loadingLocalStorageTasks() {
    const taskMemory = localStorage.getItem('taskStorage');
    const parsTask = JSON.parse(taskMemory);

    parsTask.forEach(task => {
        TasksArray.push(task);
    });
};


function loadingLocalStorageMajorCheckbox() {
    const checkboxStatus = localStorage.getItem('switcherAllTasks');
    const parseCheckbox = JSON.parse(checkboxStatus);
    switcherAllTasks.checked = parseCheckbox;
};

// редектирование текста задачи
function editTaskFunc(id, list, text){
    list.forEach(task => {
        if(task.id == id) {
            task.text = text.trim();
        }
    });
}


// взаимодействие с основным инпутом ввода текста задачи
function inspectInput() {
    const newTextTask = inputNewTask.value; // текст задачи
    if (newTextTask) {
        addedTask(newTextTask, TasksArray);
        counterTasksFunc(TasksArray);
        // renderTask(TasksArray)unshiftpu;
    }
};

// автоматическая фокусировка на поле ввода, после создания задачи
function autoFocusInput(input) {
    input.focus();
};



// добавляет задачу в общий список задач (в массив)
function addedTask(text, list) {
    createDataTask(text, list);
    clearTextInput();
};


// создание массива где хранятся задачи
function createDataTask(text, list){
    const timeStart = Date.now(); // временная метка в качестве id
    const task = {
        id: `id${timeStart}`,
        text,
        completeStatus: false
    };
    list.unshift(task);
};


// удаляем текста из поля ввода
function clearTextInput(){
    inputNewTask.value = '';
};


//рендер всех выполненных задач
function renderDoneTask(list) {
    const taskIsDone = list.filter(function (task){ 
        return task.completeStatus === true
        
    });
    counterTasksFunc(TasksArray);
    renderTask(taskIsDone);
    
};

//рендер всех невыполненных задач
function renderUndoneTask(list) {
    const taskIsUndone = list.filter(function (task){ 
        return task.completeStatus === false
    });
    counterTasksFunc(TasksArray);
    renderTask(taskIsUndone);
};


// Создание задачи в виде элемента dom-дерева
function renderTask(list) {
    let htmlList = '';

    list.forEach(task => {
        const cls = task.completeStatus 
        ? 'todolist__task-text todolist__task-text--complete'  
        : 'todolist__task-text' // проверка на статус у задачи 
        
        const checked = task.completeStatus ? 'checked' : '' // проверка на checked  у инпута

        const taskHtml = `
        <div id='${task.id}' class='todolist__task'>
            <label class='todolist__checkbox'>
                <input id='input-checkbox-task' type='checkbox' ${checked}>
                <div class='todolist__checkbox-div'></div>
            </label>
            <input type="text" class='todolist__edit-input edit' 
            value="${task.text}">
            <div class='${cls}'>${task.text}</div>

            <div class="todolist__btn-edit" id="edit-btn">
                <svg version="1.1" width="17" height="20" viewBox="0 0 17 20">
                    <path d="M4.051 17.143l1.016-1.016-2.623-2.623-1.016 1.016v1.194h1.429v1.429h1.194zM9.888 6.786c0-0.145-0.1-0.246-0.246-0.246-0.067 0-0.134 0.022-0.19 0.078l-6.049 6.049c-0.056 0.056-0.078 0.123-0.078 0.19 0 0.145 0.1 0.246 0.246 0.246 0.067 0 0.134-0.022 0.19-0.078l6.049-6.049c0.056-0.056 0.078-0.123 0.078-0.19zM9.286 4.643l4.643 4.643-9.286 9.286h-4.643v-4.643zM16.908 5.714c0 0.379-0.156 0.748-0.413 1.004l-1.853 1.853-4.643-4.643 1.853-1.842c0.257-0.268 0.625-0.424 1.004-0.424s0.748 0.156 1.016 0.424l2.623 2.612c0.257 0.268 0.413 0.636 0.413 1.016z"></path>
                </svg>
            </div>
            <div class='todolist__btn-del-task' id='del-task'>
                <svg class=='todolist__icon-del' version='1.1' width='19' height='19' viewBox='0 0 20 20'>
                <path d='M5 16.25c0 1.035 0.839 1.875 1.875 1.875h6.25c1.035 0 1.875-0.84 1.875-1.875l1.25-10h-12.5l1.25 10zM11.875 8.125h1.25v8.125h-1.25v-8.125zM9.375 8.125h1.25v8.125h-1.25v-8.125zM6.875 8.125h1.25v8.125h-1.25v-8.125zM15.938 3.75h-4.063c0 0-0.28-1.25-0.625-1.25h-2.5c-0.346 0-0.625 1.25-0.625 1.25h-4.063c-0.518 0-0.938 0.419-0.938 0.938s0 0.938 0 0.938h13.75c0 0 0-0.419 0-0.938s-0.42-0.938-0.938-0.938z'></path>
                </svg>
            </div>
        </div>
        `;

        htmlList = htmlList + taskHtml;
    });

    tasksListDiv.innerHTML = htmlList; // добавляем задачу в общее поле
};


// изменение статуса задачи 
function changeTaskStatus(id, list){ 
    list.forEach((task) => {
        if (task.id == id) { // сравниваем число и стороку, потому не строгое сравнение
            task.completeStatus = !task.completeStatus; // меняется статус 
        } 
    });
    localStorage.setItem('taskStorage', JSON.stringify(list));
    renderTask(list);
};


// тогл на для всех чекбоксов задач
function changeAllTaskStatus() {
    const allInputCheckbox = document.querySelectorAll('#input-checkbox-task');
    const arrCheckbox = Array.from(allInputCheckbox);

    function checkAllTaskIsDone(arrCheckbox) {

        return arrCheckbox.checked == true;
    }

    if (arrCheckbox.every(checkAllTaskIsDone)) {
        TasksArray.forEach(task => {
            task.completeStatus = false;
        });
    } else {
        TasksArray.forEach(task => {
            task.completeStatus = true;
        });
        switcherAllTasks.checked = true;
    }
};


//удаляем задачу
function deleteTask(id, list) {
    list.forEach((task, index) => {
        if (task.id == id){ 
            list.splice(index, 1);
        }
    });
    localStorage.setItem('taskStorage', JSON.stringify(list));
    renderTask(list);
};


// Счётчик задач 
function counterTasksFunc(list) {
    const areaTextCounter = document.querySelector('#count');
    const counterTasks = list.length;
    areaTextCounter.innerHTML = `${counterTasks}`;
};

// удаление всех задач
function deleteAllTask(list) {
    list.splice(0,list.length);
}



// })();
