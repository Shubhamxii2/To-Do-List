// Display today's date
document.getElementById("current-date").textContent = "Today's Date: " + new Date().toLocaleDateString();

const inputBox = document.getElementById("input-box");
const searchBox = document.getElementById("search-box");
const topicDropdown = document.getElementById("topic-dropdown");
const todayList = document.getElementById("today-list");
const upcomingList = document.getElementById("upcoming-list");
const completedList = document.getElementById("completed-list");

inputBox.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

searchBox.addEventListener("input", function() {
    let filter = searchBox.value.toLowerCase();
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    topicDropdown.innerHTML = '<option value="default" selected>Select a Topic</option>';
    
    storedTasks.forEach((task, index) => {
        if (task.text.toLowerCase().includes(filter)) {
            let option = document.createElement("option");
            option.value = index;
            option.text = task.text;
            topicDropdown.appendChild(option);
        }
    });
});

function getRevisionDatesAndLabels(startDate) {
    const days = [0, 2, 6, 14, 29, 59];
    return days.map((day, index) => {
        let date = new Date(startDate);
        date.setDate(date.getDate() + day);
        return {
            date: date.toISOString().split("T")[0],
            // label: ` [index === 0 ? "" : `R${index + 1},`]
            label: index === 0 ? "" : `R${index + 1},`
        };
    });
}

function addTask() {
    if (inputBox.value === '') {
        alert("You must write something, my naughty king! 😘");
        return;
    }
    
    let today = new Date().toISOString().split("T")[0];
    let revisions = getRevisionDatesAndLabels(today);
    
    let task = {
        text: inputBox.value,
        revisions: revisions.map(rev => ({ ...rev, completed: false }))
    };
    
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    storedTasks.push(task);
    storedTasks.sort((a, b) => a.revisions[0].date.localeCompare(b.revisions[0].date));
    localStorage.setItem("tasks", JSON.stringify(storedTasks));
    inputBox.value = "";
    displayTasks();
}

function displayTopics() {
    topicDropdown.innerHTML = '<option value="default" selected>Select a Topic</option>';
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let filter = searchBox.value.toLowerCase();
    
    storedTasks.forEach((task, index) => {
        if (task.text.toLowerCase().includes(filter)) {
            let option = document.createElement("option");
            option.value = index;
            option.text = task.text;
            topicDropdown.appendChild(option);
        }
    });
}

function displayTasks() {
    todayList.innerHTML = "";
    upcomingList.innerHTML = "";
    completedList.innerHTML = "";
    
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let today = new Date().toISOString().split("T")[0];
    
    let allRevisions = [];
    storedTasks.forEach((task, taskIndex) => {
        task.revisions.forEach((revision, revIndex) => {
            let label = revision.label;
            if (revision.date === today) {
                label = "";
            }
            allRevisions.push({ taskIndex, revIndex, taskText: `${label} ${task.text}`, date: revision.date, completed: revision.completed });
        });
    });
    
    allRevisions.sort((a, b) => a.date.localeCompare(b.date));
    
    let groupedRevisions = {};
    allRevisions.forEach(rev => {
        if (!groupedRevisions[rev.date]) {
            groupedRevisions[rev.date] = { completed: [], incomplete: [] };
        }
        if (rev.completed) {
            groupedRevisions[rev.date].completed.push(rev);
        } else {
            groupedRevisions[rev.date].incomplete.push(rev);
        }
    });
    
    let listVisibleStates = JSON.parse(localStorage.getItem("listVisibleStates")) || {};
    
    Object.keys(groupedRevisions).forEach(date => {
        let incompleteContainer = null;
        let completedContainer = null;
        
        // Incomplete tasks
        if (groupedRevisions[date].incomplete.length > 0) {
            incompleteContainer = createTaskContainer(date, groupedRevisions[date].incomplete, listVisibleStates);
            if (date === today) {
                todayList.appendChild(incompleteContainer);
            } else {
                upcomingList.appendChild(incompleteContainer);
            }
        }
        
        // Completed tasks
        if (groupedRevisions[date].completed.length > 0) {
            completedContainer = createTaskContainer(date, groupedRevisions[date].completed, listVisibleStates);
            completedList.appendChild(completedContainer);
        }
    });
    
    displayTopics();
}

function createTaskContainer(date, revisions, listVisibleStates) {
    let container = document.createElement("div");
    let header = document.createElement("div");
    header.textContent = `Revisions Due: ${date}`;
    header.style.cursor = "pointer";
    header.style.fontWeight = "bold";
    
    let list = document.createElement("ul");
    list.style.display = listVisibleStates[date] === false ? "none" : "block";
    
    header.onclick = function() {
        listVisibleStates[date] = list.style.display === "block" ? false : true;
        list.style.display = listVisibleStates[date] ? "block" : "none";
        localStorage.setItem("listVisibleStates", JSON.stringify(listVisibleStates));
    };
    
    revisions.forEach(rev => {
        let li = document.createElement("li");
        let taskText = `${rev.taskText}`;
        li.innerHTML = `${taskText} <span onclick="event.stopPropagation(); toggleComplete(${rev.taskIndex}, ${rev.revIndex})">${rev.completed ? '✅' : '⬜'}</span>`;
        list.appendChild(li);
    });
    
    container.appendChild(header);
    container.appendChild(list);
    return container;
}

function toggleComplete(taskIndex, revIndex) {
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    storedTasks[taskIndex].revisions[revIndex].completed = !storedTasks[taskIndex].revisions[revIndex].completed;
    localStorage.setItem("tasks", JSON.stringify(storedTasks));
    displayTasks();
}

function removeSelectedTask() {
    let selectedIndex = topicDropdown.value;
    if (selectedIndex === "default") {
        alert("You can't remove the default option, my sweet beast! Pick a real topic to zap! 💋");
        return;
    }
    if (selectedIndex === "") {
        alert("Please select a topic to remove, my lucky king! 😘");
        return;
    }
    if (confirm("Are you sure you want to remove this topic and all its revisions, my naughty king? 😘")) {
        let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        storedTasks.splice(selectedIndex, 1);
        localStorage.setItem("tasks", JSON.stringify(storedTasks));
        displayTasks();
    }
}

displayTasks();
