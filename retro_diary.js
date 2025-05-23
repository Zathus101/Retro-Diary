// Helper to get and set entries in localStorage
function getEntries() {
    return JSON.parse(localStorage.getItem('diaryEntries') || '[]');
}
function saveEntry(entry) {
    const entries = getEntries();
    entries.unshift(entry);
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
}
function clearEntries() {
    localStorage.removeItem('diaryEntries');
    localStorage.removeItem('diaryUserName'); // Also clear the user's name
    updateDiaryTitle(); // Reset the title to "RETRO DIARY"
}

// Helper for user name
function getUserName() {
    return JSON.parse(localStorage.getItem('diaryUserName') || 'null');
}
function setUserName(first, last) {
    localStorage.setItem('diaryUserName', JSON.stringify({ first, last }));
}

const formArea = document.getElementById('formArea');
const entriesArea = document.getElementById('entriesArea');
const addBtn = document.getElementById('addBtn');
const viewBtn = document.getElementById('viewBtn');
const clearBtn = document.getElementById('clearBtn');
const h1 = document.querySelector('h1');
const title = document.querySelector('title');

function updateDiaryTitle() {
    const user = getUserName();
    if (user && user.first && user.last) {
        h1.textContent = `${user.first} ${user.last} DIARY`;
        title.textContent = `${user.first} ${user.last} Diary`;
    } else {
        h1.textContent = "RETRO DIARY";
        title.textContent = "Retro Diary App";
    }
}

function capitalize(str) {
    return str.toUpperCase();
}

function askForName() {
    formArea.innerHTML = `
        <form id="nameForm">
            <label for="firstName">First Name:</label><br>
            <input id="firstName" type="text" required autocomplete="off"><br>
            <label for="lastName">Last Name:</label><br>
            <input id="lastName" type="text" required autocomplete="off"><br>
            <button class="btn" type="submit">START DIARY</button>
        </form>
    `;
    entriesArea.innerHTML = '';
    addBtn.style.display = 'none';
    viewBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    let actionBtns = document.getElementById('actionBtns');
    if (actionBtns) actionBtns.innerHTML = '';
    document.getElementById('nameForm').onsubmit = function(e) {
        e.preventDefault();
        let first = document.getElementById('firstName').value.trim();
        let last = document.getElementById('lastName').value.trim();
        if (first && last) {
            first = capitalize(first);
            last = capitalize(last);
            setUserName(first, last);
            updateDiaryTitle();
            formArea.innerHTML = '';
            showMainMenu();
        }
    };
}

function showMainMenu() {
    addBtn.style.display = '';
    viewBtn.style.display = '';
    clearBtn.style.display = '';
    formArea.innerHTML = '';
    entriesArea.innerHTML = '';
    let actionBtns = document.getElementById('actionBtns');
    if (actionBtns) actionBtns.innerHTML = '';
}

addBtn.onclick = function() {
    entriesArea.innerHTML = '';
    addBtn.style.display = '';
    viewBtn.style.display = '';
    clearBtn.style.display = '';
    let actionBtns = document.getElementById('actionBtns');
    if (actionBtns) actionBtns.innerHTML = '';
    formArea.innerHTML = `
        <form id="entryForm">
            <label for="entryName">Entry Name (optional):</label><br>
            <input id="entryName" type="text" autocomplete="off" maxlength="50"><br>
            <label for="entryText">What do you want to write in your diary?</label><br>
            <textarea id="entryText" rows="6" required spellcheck="true"></textarea><br>
            <button class="btn" type="submit">SAVE ENTRY</button>
        </form>
    `;
    document.getElementById('entryForm').onsubmit = function(e) {
        e.preventDefault();
        const name = document.getElementById('entryName').value.trim();
        const text = document.getElementById('entryText').value.trim();
        if (text) {
            const now = new Date();
            saveEntry({
                name: name,
                text: text,
                timestamp: now.toLocaleString()
            });
            formArea.innerHTML = '<span style="color:#0f0;">Entry saved!</span>';
        }
    };
};

viewBtn.onclick = function() {
    addBtn.style.display = 'none';
    viewBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    formArea.innerHTML = '';
    const entries = getEntries();
    if (entries.length === 0) {
        entriesArea.innerHTML = '<span style="color:#0f0;">No entries found.</span>';
    } else {
        // Show entry name (if present) and date/time in the archive button
        entriesArea.innerHTML = entries.map((e, idx) => {
            let label = e.timestamp;
            if (e.name && e.name.length > 0) {
                label = `<span class="entry-name">${e.name}</span> <span class="timestamp">${e.timestamp}</span>`;
            }
            return `
                <button class="btn archive-btn" data-idx="${idx}">
                    ${label}
                </button>
            `;
        }).join('');
    }
    // Add the "Would you like to go back?" and "Clear All Entries" buttons OUTSIDE the .entries box
    let actionBtns = document.getElementById('actionBtns');
    if (!actionBtns) {
        actionBtns = document.createElement('div');
        actionBtns.id = 'actionBtns';
        entriesArea.parentNode.appendChild(actionBtns);
    }
    actionBtns.innerHTML = `
        <button class="btn" id="backBtn">WOULD YOU LIKE TO GO BACK?</button>
        <button class="btn" id="clearBtn2">CLEAR ALL ENTRIES</button>
    `;

    // Archive button click event
    document.querySelectorAll('.archive-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            showEntry(entries[idx], entries);
        };
    });

    document.getElementById('backBtn').onclick = function() {
        actionBtns.innerHTML = '';
        showMainMenu();
    };
    document.getElementById('clearBtn2').onclick = function() {
        if (confirm('Are you sure you want to delete all diary entries?')) {
            clearEntries();
            entriesArea.innerHTML = '<span style="color:#0f0;">All entries cleared.</span>';
            actionBtns.innerHTML = `<button class="btn" id="backBtn2">WOULD YOU LIKE TO GO BACK?</button>`;
            document.getElementById('backBtn2').onclick = function() {
                actionBtns.innerHTML = '';
                askForName(); // Ask for name again after clearing
            };
        }
    };
};

function showEntry(entry, allEntries) {
    let header = '';
    if (entry.name && entry.name.length > 0) {
        // Entry name first, then date/time
        header = `<div class="entry-name">${entry.name}</div>
                  <div class="timestamp">${entry.timestamp}</div>`;
    } else {
        header = `<div class="timestamp">${entry.timestamp}</div>`;
    }
    entriesArea.innerHTML = `
        <div class="entry" id="animatedEntry">
            ${header}
            <div id="entryText"></div>
        </div>
    `;
    // Animate the entry text like an old PC
    const text = entry.text.replace(/\n/g, '<br>');
    const entryTextDiv = document.getElementById('entryText');
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            // Handle <br> tags instantly
            if (text.slice(i, i + 4) === '<br>') {
                entryTextDiv.innerHTML += '<br>';
                i += 4;
            } else {
                entryTextDiv.innerHTML += text[i];
                i++;
            }
            setTimeout(typeWriter, 18); // Adjust speed here (ms per character)
        }
    }
    typeWriter();

    // Place the back button outside the entry box
    let actionBtns = document.getElementById('actionBtns');
    if (!actionBtns) {
        actionBtns = document.createElement('div');
        actionBtns.id = 'actionBtns';
        entriesArea.parentNode.appendChild(actionBtns);
    }
    actionBtns.innerHTML = `<button class="btn" id="backToArchiveBtn">BACK TO ARCHIVE</button>`;
    document.getElementById('backToArchiveBtn').onclick = function() {
        actionBtns.innerHTML = '';
        viewBtn.onclick();
    };
}

clearBtn.onclick = function() {
    if (confirm('Are you sure you want to delete all diary entries?')) {
        clearEntries();
        entriesArea.innerHTML = '<span style="color:#0f0;">All entries cleared.</span>';
        let actionBtns = document.getElementById('actionBtns');
        if (actionBtns) actionBtns.innerHTML = '';
        askForName(); // Ask for name again after clearing
    }
};

// On load: ask for name if not set, else show main menu and update title
window.onload = function() {
    const user = getUserName();
    updateDiaryTitle();
    if (!user || !user.first || !user.last) {
        askForName();
    } else {
        showMainMenu();
    }
};