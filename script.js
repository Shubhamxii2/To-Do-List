// Display today's date
document.getElementById("current-date").textContent = "Today's Date: " + new Date().toLocaleDateString();

const inputBox = document.getElementById("input-box");
const searchBox = document.getElementById("search-box");
const topicDropdown = document.getElementById("topic-dropdown");
const todayList = document.getElementById("today-list");
const upcomingList = document.getElementById("upcoming-list");
const completedList = document.getElementById("completed-list");

// Add topic when Enter key is pressed
inputBox.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

// Search functionality for the dropdown
searchBox.addEventListener("input", function() {
    let filter = searchBox.value.toLowerCase();
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    topicDropdown.innerHTML = '<option value="default" selected>Select a Topic</option>'; // Always keep default
    
    storedTasks.forEach((task, index) => {
        if (task.text.toLowerCase().includes(filter)) {
            let option = document.createElement("option");
            option.value = index;
            option.text = task.text;
            topicDropdown.appendChild(option);
        }
    });
});

// Calculate revision dates and Rn labels
function getRevisionDatesAndLabels(startDate) {
    const days = [0, 1, 3, 7, 15, 30, 60];
    return days.map((day, index) => {
        let date = new Date(startDate);
        date.setDate(date.getDate() + day);
        return {
            date: date.toISOString().split("T")[0],
            label: `R${index}`
        };
    });
}

// Add a new topic with revision schedule
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
    localStorage.setItem("tasks", JSON.stringify(storedTasks));
    inputBox.value = "";
    displayTasks();
}

// Display topics in the dropdown
function displayTopics() {
    topicDropdown.innerHTML = '<option value="default" selected>Select a Topic</option>'; // Always keep default
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

// Display tasks with "Rn Topic" format
function displayTasks() {
    todayList.innerHTML = "";
    upcomingList.innerHTML = "";
    completedList.innerHTML = "";
    
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let today = new Date().toISOString().split("T")[0];
    
    storedTasks.forEach((task, taskIndex) => {
        task.revisions.forEach((revision, revIndex) => {
            let li = document.createElement("li");
            let taskText = `${revision.label} ${task.text} (Due: ${revision.date})`;
            li.innerHTML = `${taskText} <span onclick="toggleComplete(${taskIndex}, ${revIndex})">${revision.completed ? '✅' : '⬜'}</span>`;
            
            if (revision.date === today && !revision.completed) {
                todayList.appendChild(li);
            } else if (revision.date > today && !revision.completed) {
                upcomingList.appendChild(li);
            } else if (revision.completed) {
                completedList.appendChild(li);
            }
        });
    });
    
    // Update the dropdown
    displayTopics();
}

// Toggle completion status of a revision
function toggleComplete(taskIndex, revIndex) {
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    storedTasks[taskIndex].revisions[revIndex].completed = !storedTasks[taskIndex].revisions[revIndex].completed;
    localStorage.setItem("tasks", JSON.stringify(storedTasks));
    displayTasks();
}

// Remove the selected topic
function removeSelectedTask() {
    let selectedIndex = topicDropdown.value;
    if (selectedIndex === "default") {
        alert("You can't remove the default option! Pick a real topic to zap! ");
        return;
    }
    if (selectedIndex === "") {
        alert("Please select a topic to remove, my lucky king! 😘");
        return;
    }
    if (confirm("😡😡😡Are you sure you want to remove this topic and all its revisions, Mister 😡😡😡")) {
        let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        storedTasks.splice(selectedIndex, 1);
        localStorage.setItem("tasks", JSON.stringify(storedTasks));
        displayTasks();
    }
}

// Load tasks when the page opens
displayTasks();
