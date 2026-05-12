const State = {
    currentModule: null,
    history: JSON.parse(localStorage.getItem('mech_app_history')) || {}
};

function loadModule(moduleId) {
    const container = document.getElementById('app-container');
    State.currentModule = moduleId;
    
    // Update Active Button
    document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.getAttribute('onclick').includes(moduleId));
    if (activeBtn) activeBtn.classList.add('active');
    
    // Route to specific module renderers
    if (moduleId === 'thermo') {
        renderThermo(container);
    } else if (moduleId === 'solids') {
        renderSolids(container);
    } else {
        container.innerHTML = `<div class="module-content">
            <h2>${moduleId.toUpperCase()}</h2>
            <p>Module content for ${moduleId} will be loaded here. Add the corresponding math logic to this section.</p>
        </div>`;
    }
    
    saveProgress({ lastVisited: moduleId });
}

function saveProgress(data) {
    State.history = { ...State.history, ...data };
    localStorage.setItem('mech_app_history', JSON.stringify(State.history));
}

// Auto-load last visited module
window.onload = () => {
    if (State.history.lastVisited) {
        loadModule(State.history.lastVisited);
    }
};
