const API_URL = "http://localhost:5000/api/tasks";

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'No due date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Get priority badge class
function getPriorityClass(priority) {
    switch (priority) {
        case 'High': return 'bg-danger';
        case 'Medium': return 'bg-warning text-dark';
        case 'Low': return 'bg-success';
        default: return 'bg-secondary';
    }
}

// Get status badge class
function getStatusClass(status) {
    switch (status) {
        case 'Completed': return 'bg-success';
        case 'In Progress': return 'bg-primary';
        case 'Pending': return 'bg-secondary';
        default: return 'bg-light text-dark';
    }
}

// Fetch tasks from server
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";
        
        tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            
            li.innerHTML = `
                <div class="me-3">
                    <div class="d-flex align-items-center mb-1">
                        <span class="fw-bold me-2">${task.title}</span>
                        <span class="badge ${getPriorityClass(task.priority)} me-2">${task.priority}</span>
                        <span class="badge ${getStatusClass(task.status)}">${task.status}</span>
                    </div>
                    <div class="text-muted small mb-1">${task.description || ''}</div>
                    <div class="small ${task.dueDate && new Date(task.dueDate) < new Date() ? 'text-danger' : 'text-muted'}">
                        ${formatDate(task.dueDate)}
                    </div>
                </div>
                <div>
                    <select class="form-select form-select-sm me-2 d-inline-block w-auto" onchange="updateStatus('${task._id}', this.value)">
                        <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                    <button class="btn btn-sm btn-danger" onclick="deleteTask('${task._id}')">
                        Delete
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });
    } catch (err) {
        console.error("Error fetching tasks:", err);
    }
}

// Add a new task
async function addTask(event) {
    event.preventDefault();
    
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const status = document.getElementById("taskStatus").value;
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    if (!title) {
        alert("Please enter a task title");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                title, 
                description, 
                status, 
                priority, 
                dueDate 
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add task');
        }

        // Reset form
        document.getElementById("taskForm").reset();
        fetchTasks();
    } catch (err) {
        console.error("Error adding task:", err);
        alert("Error adding task: " + err.message);
    }
}

// Update task status
async function updateStatus(id, status) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                status: status,
                completed: status === 'Completed'
            })
        });
        fetchTasks();
    } catch (err) {
        console.error("Error updating task:", err);
    }
}

// Delete task
async function deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            fetchTasks();
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    }
}

// Load tasks on page load
document.addEventListener("DOMContentLoaded", fetchTasks);
// Add form submit event listener
document.getElementById("taskForm").addEventListener("submit", addTask);