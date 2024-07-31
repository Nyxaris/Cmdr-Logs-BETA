let logs = [];
let currentFilter = 'all';
let startDate = null;
let endDate = null;

async function getAccess() {
    const token = getCookie('access_token');
    if (!token) {
        window.location.href = '/403.html';
        return false;
    }

    try {
        const response = await fetch('/.netlify/functions/get-access', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 403) {
            window.location.href = '/403.html';
            return false;
        }

        const result = await response.json();
        return result.message === 'Authorized';

    } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = '/403.html';
        return false;
    }
}

async function getLogs() {
    try {
        let response = await fetch('/.netlify/functions/log-handler');
        logs = await response.json();
        displayLogs();
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}

function displayLogs() {
    let logsContainer = document.getElementById('logs');
    logsContainer.innerHTML = '';

    let filteredLogs = logs.filter(log => {
        // Filter by type
        if (currentFilter !== 'all' && log.type !== currentFilter) return false;

        // Filter by date
        let logDate = new Date(log.timestamp);
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;

        return true;
    });

    filteredLogs.forEach(log => {
        let logItem = document.createElement('div');
        logItem.classList.add('log-item');
        
        if (log.type === 'notice') {
            logItem.classList.add('log-notice');
        } else if (log.type === 'warn') {
            logItem.classList.add('log-warn');
        } else if (log.type === 'alert') {
            logItem.classList.add('log-alert');
        }

        logItem.innerHTML = `
            <h3>${log.title}</h3>
            <p id="message">${log.message}</p>
            <div class="log-meta">
                <p id="timestamp"><strong>DATE:</strong> ${log.timestamp}</p>
                <p id="type"><strong>TYPE:</strong> ${log.type}</p>
            </div>
        `;

        logsContainer.insertBefore(logItem, logsContainer.firstChild);
    });
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-buttons button').forEach(button => {
        button.classList.remove('active');
    });

    let filterButton = document.getElementById(filter);
    if (filterButton) {
        filterButton.classList.add('active');
    } else {
        console.warn(`Filter button with id '${filter}' not found.`);
    }
    displayLogs();
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await getAccess();
    if (isAuthenticated) {
        getLogs();

        document.getElementById('all').addEventListener('click', () => setFilter('all'));
        document.getElementById('notice').addEventListener('click', () => setFilter('notice'));
        document.getElementById('warn').addEventListener('click', () => setFilter('warn'));
        document.getElementById('alert').addEventListener('click', () => setFilter('alert'));
    }
});
