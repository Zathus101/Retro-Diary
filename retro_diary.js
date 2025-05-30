// Supabase setup
const supabaseUrl = 'https://egtunpdulfpoxqfvswnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVndHVucGR1bGZwb3hxZnZzd25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjY2MjgsImV4cCI6MjA2NDIwMjYyOH0.4fk-nLLPMXs2hi38C0nVc-cmTBfk9ZZBHDdbCH2G2F8';
const client  = supabase.createClient(supabaseUrl, supabaseKey);

// Helper functions
async function saveEntry(entry) {
    const { error } = await client.from('entries').insert([entry]);
    if (error) alert('Error saving entry: ' + error.message);
}
async function getEntries() {
    const { data, error } = await client.from('entries').select('*').order('timestamp', { ascending: false });
    if (error) {
        alert('Error loading entries: ' + error.message);
        return [];
    }
    return data;
}
async function clearEntries() {
    const { error } = await client.from('entries').delete();
    if (error) alert('Error clearing entries: ' + error.message);
    localStorage.removeItem('diaryUserName');
    updateDiaryTitle();
}
function getUserName() {
    return JSON.parse(localStorage.getItem('diaryUserName') || 'null');
}
function setUserName(first, last) {
    localStorage.setItem('diaryUserName', JSON.stringify({ first, last }));
}
function capitalize(str) {
    return str.toUpperCase();
}

window.onload = function() {
    // DOM elements
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
    addBtn.style.display = 'none'; // Hide ADD ENTRY
    viewBtn.style.display = '';    // Show VIEW ENTRIES
    clearBtn.style.display = 'none'; // Hide CLEAR ALL ENTRIES
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
    document.getElementById('entryForm').onsubmit = async function(e) {
        e.preventDefault();
        const entryName = document.getElementById('entryName').value.trim();
        const text = document.getElementById('entryText').value.trim();
        const user = getUserName();
        let nameField = entryName;
        if (user && user.first && user.last) {
            nameField = entryName
                ? `${user.first} ${user.last} - ${entryName}`
                : `${user.first} ${user.last}`;
        }
        if (text) {
            const now = new Date();
            await saveEntry({
                name: nameField,
                text: text,
                timestamp: now.toLocaleString()
            });
            formArea.innerHTML = '<span style="color:#0f0;">Entry saved!</span>';
        }
    };
};

    viewBtn.onclick = async function() {
        addBtn.style.display = 'none';
        viewBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        formArea.innerHTML = '';
        const entries = await getEntries();
        if (entries.length === 0) {
            entriesArea.innerHTML = '<span style="color:#0f0;">No entries found.</span>';
        } else {
            entriesArea.innerHTML = entries.map((e) => {
                let label = e.timestamp;
                if (e.name && e.name.length > 0) {
                    label = `<span class="entry-name">${e.name}</span> <span class="timestamp">${e.timestamp}</span>`;
                }
                return `
                    <button class="btn archive-btn" data-id="${e.id}">
                        ${label}
                    </button>
                `;
            }).join('');
        }
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

        document.querySelectorAll('.archive-btn').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                const entry = entries.find(e => String(e.id) === String(id));
                if (entry) showEntry(entry, entries);
            };
        });

        document.getElementById('backBtn').onclick = function() {
            actionBtns.innerHTML = '';
            showMainMenu();
        };
        document.getElementById('clearBtn2').onclick = async function() {
            if (confirm('Are you sure you want to delete all diary entries?')) {
                await clearEntries();
                entriesArea.innerHTML = '<span style="color:#0f0;">All entries cleared.</span>';
                actionBtns.innerHTML = `<button class="btn" id="backBtn2">WOULD YOU LIKE TO GO BACK?</button>`;
                document.getElementById('backBtn2').onclick = function() {
                    actionBtns.innerHTML = '';
                    askForName();
                };
            }
        };
    };

    function showEntry(entry, allEntries) {
        let header = '';
        if (entry.name && entry.name.length > 0) {
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
        const text = entry.text.replace(/\n/g, '<br>');
        const entryTextDiv = document.getElementById('entryText');
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                if (text.slice(i, i + 4) === '<br>') {
                    entryTextDiv.innerHTML += '<br>';
                    i += 4;
                } else {
                    entryTextDiv.innerHTML += text[i];
                    i++;
                }
                setTimeout(typeWriter, 18);
            }
        }
        typeWriter();

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

    clearBtn.onclick = async function() {
        if (confirm('Are you sure you want to delete all diary entries?')) {
            await clearEntries();
            entriesArea.innerHTML = '<span style="color:#0f0;">All entries cleared.</span>';
            let actionBtns = document.getElementById('actionBtns');
            if (actionBtns) actionBtns.innerHTML = '';
            askForName();
        }
    };

    // On load: ask for name if not set, else show main menu and update title
    const user = getUserName();
    updateDiaryTitle();
    if (!user || !user.first || !user.last) {
        askForName();
    } else {
        showMainMenu();
    }
};