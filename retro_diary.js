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
}

const formArea = document.getElementById('formArea');
const entriesArea = document.getElementById('entriesArea');
const addBtn = document.getElementById('addBtn');
const viewBtn = document.getElementById('viewBtn');

function showMainMenu() {
    addBtn.style.display = '';
    viewBtn.style.display = '';
    formArea.innerHTML = '';
    entriesArea.innerHTML = '';
    // Add Clear All Entries button
    const clearDiv = document.createElement('div');
    clearDiv.innerHTML = `<button class="btn" id="clearBtn">CLEAR ALL ENTRIES</button>`;
    entriesArea.appendChild(clearDiv);
    document.getElementById('clearBtn').onclick = function() {
        if (confirm('Are you sure you want to delete all diary entries?')) {
            clearEntries();
            entriesArea.innerHTML = '<span style="color:#0f0;">All entries cleared.</span>';
        }
    };
}

addBtn.onclick = function() {
    entriesArea.innerHTML = '';
    addBtn.style.display = '';
    viewBtn.style.display = '';
    formArea.innerHTML = `
        <form id="entryForm">
            <label for="entryText">What do you want to write in your diary?</label><br>
            <textarea id="entryText" rows="6" required spellcheck="true"></textarea><br>
            <button class="btn" type="submit">SAVE ENTRY</button>
        </form>
    `;
    document.getElementById('entryForm').onsubmit = function(e) {
        e.preventDefault();
        const text = document.getElementById('entryText').value.trim();
        if (text) {
            const now = new Date();
            saveEntry({
                text,
                timestamp: now.toLocaleString()
            });
            formArea.innerHTML = '<span style="color:#0f0;">Entry saved!</span>';
        }
    };
};

viewBtn.onclick = function() {
    addBtn.style.display = 'none';
    viewBtn.style.display = 'none';
    formArea.innerHTML = '';
    const entries = getEntries();
    if (entries.length === 0) {
        entriesArea.innerHTML = '<span style="color:#0f0;">No entries found.</span>';
    } else {
        // Show only the archive of dates as clickable buttons
        entriesArea.innerHTML = entries.map((e, idx) => `
            <button class="btn archive-btn" data-idx="${idx}">
                ${e.timestamp}
            </button>
        `).join('');
    }
    // Add the "Would you like to go back?" and "Clear All Entries" buttons at the bottom
    const bottomDiv = document.createElement('div');
    bottomDiv.style.marginTop = '30px';
    bottomDiv.innerHTML = `
        <button class="btn" id="backBtn">WOULD YOU LIKE TO GO BACK?</button>
        <button class="btn" id="clearBtn2">CLEAR ALL ENTRIES</button>
    `;
    entriesArea.appendChild(bottomDiv);

    // Archive button click event
    document.querySelectorAll('.archive-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            showEntry(entries[idx], entries);
        };
    });

    document.getElementById('backBtn').onclick = showMainMenu;
    document.getElementById('clearBtn2').onclick = function() {
        if (confirm('Are you sure you want to delete all diary entries?')) {
            clearEntries();
            entriesArea.innerHTML = '<span style="color:#0f0;">All entries cleared.</span>';
            // Optionally, show the back button again
            const backDiv2 = document.createElement('div');
            backDiv2.style.marginTop = '30px';
            backDiv2.innerHTML = `<button class="btn" id="backBtn2">WOULD YOU LIKE TO GO BACK?</button>`;
            entriesArea.appendChild(backDiv2);
            document.getElementById('backBtn2').onclick = showMainMenu;
        }
    };
};

function showEntry(entry, allEntries) {
    entriesArea.innerHTML = `
        <div class="entry">
            <div class="timestamp">${entry.timestamp}</div>
            <div>${entry.text.replace(/\n/g, '<br>')}</div>
        </div>
        <div style="margin-top:30px;">
            <button class="btn" id="backToArchiveBtn">BACK TO ARCHIVE</button>
        </div>
    `;
    document.getElementById('backToArchiveBtn').onclick = function() {
        // Re-show the archive
        viewBtn.onclick();
    };
}

// Show main menu on load
showMainMenu();