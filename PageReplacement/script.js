function simulateFIFO(roomCount, sequenceInput) {
  const sequence = sequenceInput.split(',').map(p => p.trim().toUpperCase());
  const rooms = new Array(roomCount).fill(null);
  let pointer = 0;  // Next room to "replace"
  let hits = 0, misses = 0;
  const steps = [];

  sequence.forEach((patient, index) => {
    let isHit = rooms.includes(patient);

    if (isHit) {
      hits++;
    } else {
      rooms[pointer] = patient;
      pointer = (pointer + 1) % roomCount;
      misses++;
    }

    const roomState = rooms.map((occupant) => ({
      patient: occupant || "-",
      isActive: occupant === patient,
      isHit: isHit && occupant === patient,
    }));

    steps.push({
      stepNum: index + 1,
      patient,
      isHit,
      rooms: roomState,
    });
  });

  return {
    steps,
    summary: { hits, misses }
  };
}

function runSimulation() {
  const roomCount = parseInt(document.getElementById('roomCount').value);
  const patientSequence = document.getElementById('patientSequence').value;

  if (!roomCount || roomCount < 1) {
    alert("Please enter a valid number of consultation rooms (at least 1).");
    return;
  }
  if (!patientSequence.trim()) {
    alert("Please enter a valid patient sequence.");
    return;
  }

  const result = simulateFIFO(roomCount, patientSequence);

  let htmlOutput = "";

  result.steps.forEach(step => {
    htmlOutput += `<div class="step"><strong>Step ${step.stepNum}:</strong> Patient <b>${step.patient}</b> ${step.isHit ? `<span style="color:#82dd55; font-weight: bold;">(HIT)</span>` : `<span style="color:#e23636; font-weight: bold;">(MISS)</span>`
}`;

    htmlOutput += `<div class="rooms">`;
    step.rooms.forEach(room => {
      let classes = "room";
      if (room.isHit) classes += " hit";
      else if (room.patient !== "-") classes += " miss";
      if (room.isActive) classes += " active";

      htmlOutput += `<div class="${classes}">${room.patient}</div>`;
    });
    htmlOutput += `</div></div>`;
  });

  htmlOutput += `<div class="summary">Total Hits: ${result.summary.hits} &nbsp;&nbsp; Total Misses: ${result.summary.misses}</div>`;

  document.getElementById('simulationOutput').innerHTML = htmlOutput;
}
