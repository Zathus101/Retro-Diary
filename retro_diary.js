const supabaseUrl = 'https://egtunpdulfpoxqfvswnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVndHVucGR1bGZwb3hxZnZzd25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjY2MjgsImV4cCI6MjA2NDIwMjYyOH0.4fk-nLLPMXs2hi38C0nVc-cmTBfk9ZZBHDdbCH2G2F8';
const client  = supabase.createClient(supabaseUrl, supabaseKey);

window.onload = async function() {
    // DOM elements
    const authArea = document.getElementById('authArea');
    const formArea = document.getElementById('formArea');
    const entriesArea = document.getElementById('entriesArea');
    const addBtn = document.getElementById('addBtn');
    const viewBtn = document.getElementById('viewBtn');
    const clearBtn = document.getElementById('clearBtn');
    const h1 = document.querySelector('h1');
    const title = document.querySelector('title');

    // --- AUTH SECTION ---
    async function checkAuth() {
        const { data: { user } } = await client.auth.getUser();
        if (!user) {
            formArea.style.display = 'none';
            entriesArea.style.display = 'none';
            addBtn.style.display = 'none';
            viewBtn.style.display = 'none';
            clearBtn.style.display = 'none';
            return false;
        } else {
            authArea.innerHTML = `<button id="logoutBtn" class="btn">Logout</button>`;
            document.getElementById('logoutBtn').onclick = async function() {
                await client.auth.signOut();
                location.reload();
            };
            formArea.style.display = '';
            entriesArea.style.display = '';
            addBtn.style.display = '';
            viewBtn.style.display = '';
            clearBtn.style.display = '';
            return true;
        }
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = async function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            let { error } = await client.auth.signInWithPassword({ email, password });
            if (error) {
                alert('Login error: ' + error.message);
            } else {
                location.reload();
            }
        };
    }

    // Signup form handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.onsubmit = async function(e) {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            let { error } = await client.auth.signUp({ email, password });
            if (error) {
                alert('Sign up error: ' + error.message);
            } else {
                alert('Account created! Please check your email for confirmation.');
                signupForm.style.display = 'none';
                loginForm.style.display = '';
            }
        };
    }

    // Toggle between login and signup forms
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    if (showSignupBtn && signupForm && loginForm) {
        showSignupBtn.onclick = function() {
            loginForm.style.display = 'none';
            signupForm.style.display = '';
        };
    }
    if (showLoginBtn && signupForm && loginForm) {
        showLoginBtn.onclick = function() {
            signupForm.style.display = 'none';
            loginForm.style.display = '';
        };
    }

    // Wait for auth before showing diary
    const authed = await checkAuth();
    if (!authed) return;

    // --- DIARY APP SECTION ---
    function getUserName() {
        return JSON.parse(localStorage.getItem('diaryUserName') || 'null');
    }
    function setUserName(first, last) {
        localStorage.setItem('diaryUserName', JSON.stringify({ first, last }));
    }
    function capitalize(str) {
        return str.toUpperCase();
    }
    function updateDiaryTitle() {
        const user = getUserName();
        if (
            user &&
            typeof user.first === "string" && user.first.trim() !== "" &&
            typeof user.last === "string" && user.last.trim() !== ""
        ) {
            h1.textContent = `${user.first} ${user.last} DIARY`;
            title.textContent = `${user.first} ${user.last} Diary`;
        } else {
            h1.textContent = "RETRO DIARY";
            title.textContent = "Retro Diary App";
        }
    }

    // --- Supabase-aware save/get ---
    async function saveEntry(entry) {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return;
        entry.id = user.id; // Changed from user_id to id
        const { error } = await client.from('entries').insert([entry]);
        if (error) alert('Error saving entry: ' + error.message);
    }
    async function getEntries() {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return [];
        const { data, error } = await client
            .from('entries')
            .select('*')
            .eq('id', user.id) // Changed from user_id to id
            .order('timestamp', { ascending: false });
        if (error) {
            alert('Error loading entries: ' + error.message);
            return [];
        }
        return data;
    }
    async function clearEntries() {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return;
        const { error } = await client.from('entries').delete().eq('id', user.id); // Changed from user_id to id
        if (error) alert('Error clearing entries: ' + error.message);
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
        updateDiaryTitle();
    }

    function showMainMenu() {
        addBtn.style.display = '';
        viewBtn.style.display = '';
        clearBtn.style.display = '';
        formArea.innerHTML = '';
        entriesArea.innerHTML = '';
        let actionBtns = document.getElementById('actionBtns');
        if (actionBtns) actionBtns.innerHTML = '';
        // Add RESET DIARY button if not present
        if (!document.getElementById('resetBtn')) {
            const resetBtn = document.createElement('button');
            resetBtn.className = 'btn';
            resetBtn.id = 'resetBtn';
            resetBtn.textContent = 'RESET DIARY';
            resetBtn.onclick = async function() {
                if (confirm('Are you sure you want to reset the diary? This will delete all entries and your name.')) {
                    await clearEntries();
                    localStorage.removeItem('diaryUserName');
                    updateDiaryTitle();
                    entriesArea.innerHTML = '<span style="color:#0f0;">Diary reset.</span>';
                    if (actionBtns) actionBtns.innerHTML = '';
                    askForName();
                }
            };
            (actionBtns || entriesArea.parentNode).appendChild(resetBtn);
        }
        updateDiaryTitle();
    }

    addBtn.onclick = function() {
        entriesArea.innerHTML = '';
        addBtn.style.display = 'none';
        viewBtn.style.display = '';
        clearBtn.style.display = 'none';
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
            let nameField = entryName;
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

    // --- VIEW ENTRIES WITH EDIT & DELETE ---
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
                    <div class="entry-block">
                        <button class="btn archive-btn" data-id="${e.id}">
                            ${label}
                        </button>
                        <button class="btn edit-btn" data-id="${e.id}">Edit</button>
                        <button class="btn delete-btn" data-id="${e.id}">Delete</button>
                    </div>
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
            <button class="btn" id="resetBtn2">RESET DIARY</button>
        `;

        // View entry
        document.querySelectorAll('.archive-btn').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                const entry = entries.find(e => String(e.id) === String(id));
                if (entry) showEntry(entry, entries);
            };
        });

        // Delete entry
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = async function() {
                const id = this.getAttribute('data-id');
                if (confirm('Delete this entry?')) {
                    await client.from('entries').delete().eq('id', id);
                    viewBtn.onclick();
                }
            };
        });

        // Edit entry
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = function() {
                const id = this.getAttribute('data-id');
                const entry = entries.find(e => String(e.id) === String(id));
                if (entry) showEditForm(entry);
            };
        });

        document.getElementById('backBtn').onclick = function() {
            actionBtns.innerHTML = '';
            showMainMenu();
        };
        document.getElementById('clearBtn2').onclick = async function() {
            if (confirm('Are you sure you want to delete all diary entries?')) {
                await clearEntries();
                updateDiaryTitle();
                entriesArea.innerHTML = '<span style="color:#0f0;">All entries cleared.</span>';
                actionBtns.innerHTML = '';
            }
        };
        document.getElementById('resetBtn2').onclick = async function() {
            if (confirm('Are you sure you want to reset the diary? This will delete all entries and your name.')) {
                await clearEntries();
                localStorage.removeItem('diaryUserName');
                updateDiaryTitle();
                entriesArea.innerHTML = '<span style="color:#0f0;">Diary reset.</span>';
                actionBtns.innerHTML = '';
                askForName();
            }
        };
    };

    // --- EDIT FORM ---
    function showEditForm(entry) {
        formArea.innerHTML = `
            <form id="editEntryForm">
                <label for="editEntryName">Entry Name (optional):</label><br>
                <input id="editEntryName" type="text" value="${entry.name || ''}" maxlength="50"><br>
                <label for="editEntryText">Edit your diary entry:</label><br>
                <textarea id="editEntryText" rows="6" required>${entry.text || ''}</textarea><br>
                <button class="btn" type="submit">SAVE CHANGES</button>
            </form>
        `;
        document.getElementById('editEntryForm').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('editEntryName').value.trim();
            const text = document.getElementById('editEntryText').value.trim();
            await client.from('entries').update({ name, text }).eq('id', entry.id);
            formArea.innerHTML = '';
            viewBtn.onclick();
        };
    }

    // --- SHOW SINGLE ENTRY ---
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
            updateDiaryTitle();
            entriesArea.innerHTML = '<span style="color:#0f0;">All entries cleared.</span>';
            let actionBtns = document.getElementById('actionBtns');
            if (actionBtns) actionBtns.innerHTML = '';
        }
    };

    // On load: ask for name if not set, else show main menu and update title
    const user = getUserName();
    updateDiaryTitle();
    if (
        !user ||
        typeof user.first !== "string" || user.first.trim() === "" ||
        typeof user.last !== "string" || user.last.trim() === ""
    ) {
        askForName();
    } else {
        showMainMenu();
    }
};