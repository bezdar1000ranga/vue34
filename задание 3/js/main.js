new Vue({
    el: '#app', // Привязка Vue к элементу с id "app" в HTML

    data() {
        return {
            plannedTasks: [], // Массив задач, запланированных для выполнения
            inProgressTasks: [], // Массив задач, находящихся в процессе выполнения
            testingTasks: [], // Массив задач, находящихся в стадии тестирования
            completedTasks: [], // Массив выполненных задач
            newCardTitle: '', // Заголовок новой задачи
            newCardDescription: '', // Описание новой задачи
            newCardDeadline: '' // Дата завершения новой задачи
        };
    },

    mounted() {
        this.loadTasksFromStorage(); // Загрузка сохраненных задач из локального хранилища при запуске приложения
    },

    watch: {
        plannedTasks: { handler: 'saveTasksToStorage', deep: true }, // Наблюдение за изменениями в массиве plannedTasks и сохранение задач в локальное хранилище
        inProgressTasks: { handler: 'saveTasksToStorage', deep: true }, // Наблюдение за изменениями в массиве inProgressTasks и сохранение задач в локальное хранилище
        testingTasks: { handler: 'saveTasksToStorage', deep: true }, // Наблюдение за изменениями в массиве testingTasks и сохранение задач в локальное хранилище
        completedTasks: { handler: 'saveTasksToStorage', deep: true } // Наблюдение за изменениями в массиве completedTasks и сохранение задач в локальное хранилище
    },

    methods: {
        addCard() {
            // Добавление новой задачи
            const newCard = {
                id: Date.now(),
                title: this.newCardTitle,
                description: this.newCardDescription,
                deadline: this.newCardDeadline,
                favorite: false,
                lastEdited: new Date().toLocaleString(),
                returnReason: ''
            };

            this.plannedTasks.push(newCard); // Добавление новой задачи в массив plannedTasks
            this.clearForm(); // Очистка полей формы добавления задачи
        },

        validateDate() {
            // Проверка правильности формата введенной даты
            const yearInput = document.querySelector('input[type="date"]');
            const enteredDate = yearInput.value;
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            if (!dateRegex.test(enteredDate)) {
                console.log('Ошибка! Неправильный формат даты.');
            }
        },

        editCard(card) {
            // Редактирование задачи
            const newTitle = prompt('Введите новый заголовок', card.title);
            const newDescription = prompt('Введите новое описание', card.description);

            if (newTitle && newDescription) {
                card.title = newTitle;
                card.description = newDescription;
                card.lastEdited = new Date().toLocaleString();
            }
        },

        deleteCard(card) {
            const column = this.findColumn(card); // Определение колонки, в которой находится задача

            if (column) {
                column.splice(column.indexOf(card), 1); // Удаление задачи из найденной колонки
            }
        },

        moveToInProgress(card) {
            // Перемещение задачи в стадию "В процессе выполнения"
            this.plannedTasks.splice(this.plannedTasks.indexOf(card), 1); // Удаление задачи из массива plannedTasks
            card.lastEdited = new Date().toLocaleString();
            this.inProgressTasks.push(card); // Добавление задачи в массив inProgressTasks
        },

        moveToTesting(card) {
            // Перемещение задачи в стадию "Тестирование"
            this.inProgressTasks.splice(this.inProgressTasks.indexOf(card), 1); // Удаление задачи из массива inProgressTasks
            card.lastEdited = new Date().toLocaleString();
            this.testingTasks.push(card); // Добавление задачи в массив testingTasks
        },

        moveToCompleted(card) {
            // Перемещение задачи в стадию "Завершено"
            this.testingTasks.splice(this.testingTasks.indexOf(card), 1); // Удаление задачи из массива testingTasks
            card.lastEdited = new Date().toLocaleString();

            if (this.isDeadlineExpired(card.deadline)) {
                card.title += " просрочена"; // Если дата завершения просрочена, добавить соответствующую метку к заголовку задачи
            } else {
                card.title += " выполненная в срок"; // Если дата завершения не просрочена, добавить соответствующую метку к заголовку задачи
            }

            this.completedTasks.push(card); // Добавление задачи в массив completedTasks
        },

        returnToProgress(card) {
            // Возврат задачи из стадии "Тестирование" в стадию "В процессе выполнения"
            const reason = prompt('Введите причину возврата', '');

            if (reason) {
                this.testingTasks.splice(this.testingTasks.indexOf(card), 1); // Удаление задачи из массива testingTasks
                card.lastEdited = new Date().toLocaleString();
                card.returnReason = reason;
                this.inProgressTasks.push(card); // Добавление задачи в массив inProgressTasks
            }
        },

        isDeadlineExpired(deadline) {
            // Проверка, просрочена ли дата завершения задачи
            const currentDate = new Date();
            const deadlineDate = new Date(deadline);

            return currentDate > deadlineDate;
        },

        clearForm() {
            // Очистка полей формы добавления задачи
            this.newCardTitle = '';
            this.newCardDescription = '';
            this.newCardDeadline = '';
        },

        findColumn(card) {
            // Определение в какой колонке находится задача (поиск и возвращение ссылки на массив, содержащий задачу)
            if (this.plannedTasks.includes(card)) {
                return this.plannedTasks;
            } else if (this.inProgressTasks.includes(card)) {
                return this.inProgressTasks;
            } else if (this.testingTasks.includes(card)) {
                return this.testingTasks;
            } else if (this.completedTasks.includes(card)) {
                return this.completedTasks;
            } else {
                return null;
            }
        },

        saveTasksToStorage() {
            // Сохранение задач в локальное хранилище
            const tasks = {
                plannedTasks: this.plannedTasks,
                inProgressTasks: this.inProgressTasks,
                testingTasks: this.testingTasks,
                completedTasks: this.completedTasks
            };
            localStorage.setItem('tasks', JSON.stringify(tasks));
        },

        loadTasksFromStorage() {
            // Загрузка задач из локального хранилища
            const tasks = localStorage.getItem('tasks');

            if (tasks) {
                const parsedTasks = JSON.parse(tasks);
                this.plannedTasks = parsedTasks.plannedTasks || [];
                this.inProgressTasks = parsedTasks.inProgressTasks || [];
                this.testingTasks = parsedTasks.testingTasks || [];
                this.completedTasks = parsedTasks.completedTasks || [];
            }
        }
    },
});