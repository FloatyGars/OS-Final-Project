const queue = [];
const timeQuantum = 15;

document.getElementById("processForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const burst = parseInt(document.getElementById("burst").value);

  if (queue.some(p => p.name === name)) {
    alert("Caller name must be unique.");
    return;
  }

  queue.push({ name, burst, remaining: burst });
  updateQueueDisplay();
  this.reset();
});

function updateQueueDisplay() {
  const tableBody = document.querySelector("#queueList tbody");
  tableBody.innerHTML = '';
  queue.forEach((p, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name}</td>
      <td>${p.burst} min</td>
      <td><button class="remove-btn" onclick="removeProcess(${index})">Remove</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function removeProcess(index) {
  queue.splice(index, 1);
  updateQueueDisplay();
}

window.simulate = function simulate() {
  if (queue.length === 0) return;

  const gantt = document.getElementById("ganttChart");
  gantt.innerHTML = "";

  const waitingTimes = {};
  const turnaroundTimes = {};
  const arrivalTimes = {};
  let time = 0;
  let executionLog = [];
  const processes = queue.map(p => ({ ...p }));

  processes.forEach(p => arrivalTimes[p.name] = 0);
  const readyQueue = [...processes];
  const finished = [];

  while (readyQueue.length > 0) {
    const p = readyQueue.shift();
    const runTime = Math.min(timeQuantum, p.remaining);
    executionLog.push({ name: p.name, start: time, duration: runTime });
    p.remaining -= runTime;
    time += runTime;

    if (p.remaining > 0) {
      readyQueue.push(p);
    } else {
      turnaroundTimes[p.name] = time;
      const totalBurst = queue.find(q => q.name === p.name).burst;
      waitingTimes[p.name] = turnaroundTimes[p.name] - totalBurst;
      finished.push(p);
    }
  }

  // Render Gantt Chart
  executionLog.forEach((entry, index) => {
    const block = document.createElement("div");
    block.className = "gantt-block";
    block.innerHTML = `
      <div class="label">${entry.name}</div>
      <div class="burst-time">${entry.duration} units</div>
      <div class="time-labels">
        <span>${entry.start}</span>
        <span>${entry.start + entry.duration}</span>
      </div>
    `;
    const colors = ["#3AAFA9", "#0FA4AF", "#37718E", "#254E70"];
    block.style.backgroundColor = colors[index % colors.length];
    gantt.appendChild(block);

    if (index < executionLog.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "arrow-between";
      arrow.textContent = "➜";
      gantt.appendChild(arrow);
    }
  });

  // Final Time Marker
  const last = executionLog.at(-1);
  if (last) {
    const marker = document.createElement("div");
    marker.className = "gantt-block";
    marker.style.background = "transparent";
    marker.style.color = "#000";
    marker.style.border = "none";
    marker.innerHTML = "&nbsp;";
    gantt.appendChild(marker);
  }

  const avgWait = (Object.values(waitingTimes).reduce((a, b) => a + b, 0) / finished.length).toFixed(2);
  const avgTurnaround = (Object.values(turnaroundTimes).reduce((a, b) => a + b, 0) / finished.length).toFixed(2);
  document.getElementById("avgWaitingTime").innerText = `Average Waiting Time: ${avgWait}`;
  document.getElementById("avgTurnaroundTime").innerText = `Average Turnaround Time: ${avgTurnaround}`;
};
