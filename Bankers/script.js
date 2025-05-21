function generateTables() {
    const doctorCount = parseInt(document.getElementById('doctorCount').value);
    const toolCount = parseInt(document.getElementById('toolCount').value);

    // Array of tool names to be used as headings
    const toolNames = ["Syringe", "ECG", "Defibrillator", "Stethoscope", "Thermometer"];

    // Limit toolNames to the number of tools requested
    const usedToolNames = toolNames.slice(0, toolCount);

    const tablesSection = document.getElementById('tablesSection');
    tablesSection.innerHTML = '';

    const createTable = (idPrefix, label) => {
        let html = `<label>${label}</label><table><tr><th>Doctor</th>`;

        
        for (let t = 0; t < toolCount; t++) {
            html += `<th>${usedToolNames[t]}</th>`;
        }
        html += '</tr>';

        for (let d = 0; d < doctorCount; d++) {
            html += `<tr><td>Doctor ${d + 1}</td>`;  
            for (let t = 0; t < toolCount; t++) {
                html += `<td><input type="number" min="0" id="${idPrefix}-${d}-${t}" /></td>`;
            }
            html += '</tr>';
        }

        html += '</table>';
        return html;
    };

    tablesSection.innerHTML += createTable("max", "Max Requirements");
    tablesSection.innerHTML += createTable("alloc", "Currently Allocated");

    // Available input section
    const availableDiv = document.getElementById('availableInputs');
    availableDiv.innerHTML = '';

    for (let t = 0; t < toolCount; t++) {
        availableDiv.innerHTML += `${usedToolNames[t]}: <input type="number" min="0" id="avail-${t}"> `;
    }
}


function runBankers() {
    const doctorCount = parseInt(document.getElementById('doctorCount').value);
    const toolCount = parseInt(document.getElementById('toolCount').value);

    const max = [], alloc = [], available = [], need = [];

    for (let d = 0; d < doctorCount; d++) {
        max[d] = [];
        alloc[d] = [];
        need[d] = [];

        for (let t = 0; t < toolCount; t++) {
            max[d][t] = parseInt(document.getElementById(`max-${d}-${t}`).value) || 0;
            alloc[d][t] = parseInt(document.getElementById(`alloc-${d}-${t}`).value) || 0;
            need[d][t] = max[d][t] - alloc[d][t];
        }
    }

    for (let t = 0; t < toolCount; t++) {
        available[t] = parseInt(document.getElementById(`avail-${t}`).value) || 0;
    }

    // Actual Safety algorithm
    const work = [...available];
    const finish = Array(doctorCount).fill(false);
    const safeSequence = [];

    let changed = true;
    while (safeSequence.length < doctorCount && changed) {
        changed = false;

        for (let i = 0; i < doctorCount; i++) {
            if (!finish[i]) {
                let canProceed = true;
                for (let j = 0; j < toolCount; j++) {
                    if (need[i][j] > work[j]) {
                        canProceed = false;
                        break;
                    }
                }

                if (canProceed) {
                    for (let j = 0; j < toolCount; j++) {
                        work[j] += alloc[i][j];
                    }
                    finish[i] = true;
                    safeSequence.push(`D${i}`);
                    changed = true;
                }
            }
        }
    }

    const resultDiv = document.getElementById('resultSection');
    if (safeSequence.length === doctorCount) {
        resultDiv.innerHTML = `<strong>Safe Sequence Found:</strong> ${safeSequence.join(" → ")}`;
    } else {
        resultDiv.innerHTML = `<strong style="color:red;">System is NOT in a Safe State. Potential Deadlock!</strong>`;
    }
}
