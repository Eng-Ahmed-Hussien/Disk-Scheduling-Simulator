    // Global variables
    let requests = [];
    let results = {
      fcfs: { movements: [], total: 0 },
      scan: { movements: [], total: 0 },
      cscan: { movements: [], total: 0 }
    };
    
    // DOM elements
    const maxCylinderInput = document.getElementById('maxCylinder');
    const initialHeadInput = document.getElementById('initialHead');
    const requestCountInput = document.getElementById('requestCount');
    const requestsList = document.getElementById('requestsList');
    const canvas = document.getElementById('visualizationCanvas');
    const ctx = canvas.getContext('2d');
    
    // Initialize
    window.onload = function() {
      // Set max value for initial head
      updateMaxValues();
      
      // Add event listeners
      document.getElementById('generateRequests').addEventListener('click', generateRandomRequests);
      document.getElementById('addRequest').addEventListener('click', addManualRequest);
      document.getElementById('clearRequests').addEventListener('click', clearRequests);
      document.getElementById('runFCFS').addEventListener('click', () => runAlgorithm('fcfs'));
      document.getElementById('runSCAN').addEventListener('click', () => runAlgorithm('scan'));
      document.getElementById('runCSCAN').addEventListener('click', () => runAlgorithm('cscan'));
      document.getElementById('runAll').addEventListener('click', runAllAlgorithms);
      
      maxCylinderInput.addEventListener('change', updateMaxValues);
      
      // Initial drawing
      drawEmptyCanvas();
    };
    
    function updateMaxValues() {
      const maxCyl = parseInt(maxCylinderInput.value);
      initialHeadInput.max = maxCyl;
    }
    
    // Tab functionality
    function openTab(evt, tabName) {
      const tabcontent = document.getElementsByClassName("tabcontent");
      for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      
      const tablinks = document.getElementsByClassName("tablinks");
      for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
    }
    
    // Generate random requests
    function generateRandomRequests() {
      const maxCyl = parseInt(maxCylinderInput.value);
      const count = parseInt(requestCountInput.value);
      
      requests = [];
      for (let i = 0; i < count; i++) {
        requests.push(Math.floor(Math.random() * (maxCyl + 1)));
      }
      
      updateRequestsList();
    }
    
    // Add a manual request
    function addManualRequest() {
      const maxCyl = parseInt(maxCylinderInput.value);
      const request = prompt(`Enter cylinder request (0-${maxCyl}):`, "0");
      
      if (request !== null) {
        const value = parseInt(request);
        if (!isNaN(value) && value >= 0 && value <= maxCyl) {
          requests.push(value);
          updateRequestsList();
        } else {
          alert(`Please enter a valid number between 0 and ${maxCyl}.`);
        }
      }
    }
    
    // Clear requests
    function clearRequests() {
      requests = [];
      updateRequestsList();
      clearResults();
    }
    
    // Update the requests list display
    function updateRequestsList() {
      requestsList.innerHTML = '';
      requests.forEach(req => {
        const chip = document.createElement('span');
        chip.className = 'request-chip';
        chip.textContent = req;
        requestsList.appendChild(chip);
      });
    }
    
    // Clear previous results
    function clearResults() {
      results = {
        fcfs: { movements: [], total: 0 },
        scan: { movements: [], total: 0 },
        cscan: { movements: [], total: 0 }
      };
      
      document.getElementById('resultsTable').getElementsByTagName('tbody')[0].innerHTML = '';
      document.getElementById('comparisonTable').getElementsByTagName('tbody')[0].innerHTML = '';
      document.getElementById('visualSummary').innerHTML = '<p>Run an algorithm to see the visualization.</p>';
      document.getElementById('resultSummary').innerHTML = '<p>Run an algorithm to see the results.</p>';
      
      drawEmptyCanvas();
    }
    
    // Run a specific algorithm
    function runAlgorithm(type) {
      if (requests.length === 0) {
        alert('Please generate or add requests first.');
        return;
      }
      
      clearResults();
      
      const head = parseInt(initialHeadInput.value);
      const maxCyl = parseInt(maxCylinderInput.value);
      
      switch (type) {
        case 'fcfs':
          runFCFS(head);
          break;
        case 'scan':
          runSCAN(head, maxCyl);
          break;
        case 'cscan':
          runCSCAN(head, maxCyl);
          break;
      }
      
      updateResults(type);
      drawVisualization(type);
    }
    
    // Run all algorithms
    function runAllAlgorithms() {
      if (requests.length === 0) {
        alert('Please generate or add requests first.');
        return;
      }
      
      clearResults();
      
      const head = parseInt(initialHeadInput.value);
      const maxCyl = parseInt(maxCylinderInput.value);
      
      runFCFS(head);
      runSCAN(head, maxCyl);
      runCSCAN(head, maxCyl);
      
      updateComparisonTable();
      drawVisualization('all');
    }
    
    // FCFS Algorithm
    function runFCFS(head) {
      let current = head;
      let total = 0;
      let movements = [];
      
      for (let i = 0; i < requests.length; i++) {
        const move = Math.abs(requests[i] - current);
        movements.push({ from: current, to: requests[i], move: move, total: total + move });
        total += move;
        current = requests[i];
      }
      
      results.fcfs = { movements, total };
    }
    
    // SCAN Algorithm (Elevator)
    function runSCAN(head, maxCyl) {
      // Sort the requests + head position
      let sorted = [...requests, head].sort((a, b) => a - b);
      const headIndex = sorted.findIndex(v => v === head);
      
      let current = head;
      let total = 0;
      let movements = [];
      
      // Go towards 0 first
      for (let i = headIndex - 1; i >= 0; i--) {
        const move = Math.abs(sorted[i] - current);
        movements.push({ from: current, to: sorted[i], move: move, total: total + move });
        total += move;
        current = sorted[i];
      }
      
      // If we didn't reach 0, go there
      if (current > 0) {
        const move = current;
        movements.push({ from: current, to: 0, move: move, total: total + move });
        total += move;
        current = 0;
      }
      
      // Then go up to max cylinder
      for (let i = headIndex + 1; i < sorted.length; i++) {
        const move = Math.abs(sorted[i] - current);
        movements.push({ from: current, to: sorted[i], move: move, total: total + move });
        total += move;
        current = sorted[i];
      }
      
      results.scan = { movements, total };
    }
    
    // C-SCAN Algorithm
    function runCSCAN(head, maxCyl) {
      // Sort the requests + head position
      let sorted = [...requests, head].sort((a, b) => a - b);
      const headIndex = sorted.findIndex(v => v === head);
      
      let current = head;
      let total = 0;
      let movements = [];
      
      // Go towards max cylinder first
      for (let i = headIndex + 1; i < sorted.length; i++) {
        const move = Math.abs(sorted[i] - current);
        movements.push({ from: current, to: sorted[i], move: move, total: total + move });
        total += move;
        current = sorted[i];
      }
      
      // If we didn't reach max cylinder, go there
      if (current < maxCyl) {
        const move = maxCyl - current;
        movements.push({ from: current, to: maxCyl, move: move, total: total + move });
        total += move;
        current = maxCyl;
      }
      
      // Go to 0 (wrap around)
      const wrapMove = current; // Distance from max to 0
      movements.push({ from: current, to: 0, move: wrapMove, total: total + wrapMove, wrap: true });
      total += wrapMove;
      current = 0;
      
      // Service requests from 0 up to head
      for (let i = 0; i < headIndex; i++) {
        const move = Math.abs(sorted[i] - current);
        movements.push({ from: current, to: sorted[i], move: move, total: total + move });
        total += move;
        current = sorted[i];
      }
      
      results.cscan = { movements, total };
    }
    
    // Update the results table for an algorithm
    function updateResults(type) {
      const tbody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
      tbody.innerHTML = '';
      
      const movements = results[type].movements;
      const total = results[type].total;
      const avgMove = total / requests.length;
      
      movements.forEach((move, idx) => {
        const row = tbody.insertRow();
        
        row.insertCell(0).textContent = idx + 1;
        row.insertCell(1).textContent = move.from;
        row.insertCell(2).textContent = move.to;
        if (move.wrap) {
          row.insertCell(3).textContent = `${move.move} (wrap)`;
        } else {
          row.insertCell(3).textContent = move.move;
        }
        row.insertCell(4).textContent = move.total;
      });
      
      // Update summary
      const typeNames = {
        fcfs: 'FCFS',
        scan: 'SCAN',
        cscan: 'C-SCAN'
      };
      
      document.getElementById('resultSummary').innerHTML = `
        <p><strong>${typeNames[type]} Results:</strong></p>
        <p>Total head movement: ${total}</p>
        <p>Average movement per request: ${avgMove.toFixed(2)}</p>
      `;
    }
    
    // Update comparison table
    function updateComparisonTable() {
      const tbody = document.getElementById('comparisonTable').getElementsByTagName('tbody')[0];
      tbody.innerHTML = '';
      
      const fcfsTotal = results.fcfs.total;
      const avgRequests = requests.length;
      
      const algorithms = [
        { name: 'FCFS', result: results.fcfs },
        { name: 'SCAN', result: results.scan },
        { name: 'C-SCAN', result: results.cscan }
      ];
      
      algorithms.forEach(algo => {
        const row = tbody.insertRow();
        
        row.insertCell(0).textContent = algo.name;
        row.insertCell(1).textContent = algo.result.total;
        
        const avg = algo.result.total / avgRequests;
        row.insertCell(2).textContent = avg.toFixed(2);
        
        if (algo.name === 'FCFS') {
          row.insertCell(3).textContent = '-';
        } else {
          const improvement = ((fcfsTotal - algo.result.total) / fcfsTotal * 100).toFixed(2);
          row.insertCell(3).textContent = `${improvement}%`;
        }
      });
    }
    
    // Draw empty canvas
    function drawEmptyCanvas() {
      const maxCyl = parseInt(maxCylinderInput.value);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw x-axis (cylinder numbers)
      ctx.beginPath();
      ctx.moveTo(50, 350);
      ctx.lineTo(1050, 350);
      ctx.stroke();
      
      // Draw cylinder markers
      const step = Math.max(1, Math.floor(maxCyl / 10));
      for (let i = 0; i <= maxCyl; i += step) {
        const x = 50 + (i / maxCyl) * 1000;
        ctx.beginPath();
        ctx.moveTo(x, 350);
        ctx.lineTo(x, 355);
        ctx.stroke();
        
        ctx.fillText(i, x - 10, 370);
      }
      
      // Draw y-axis (time/steps)
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(50, 350);
      ctx.stroke();
      
      // Label axes
      ctx.font = '14px Arial';
      ctx.fillText('Cylinder Position', 500, 390);
      ctx.save();
      ctx.translate(20, 200);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Time / Step', 0, 0);
      ctx.restore();
    }
    
    // Draw visualization
    function drawVisualization(type) {
      drawEmptyCanvas();
      
      const maxCyl = parseInt(maxCylinderInput.value);
      const head = parseInt(initialHeadInput.value);
      
      // Legend
      ctx.font = '14px Arial';
      if (type === 'all') {
        ctx.fillStyle = 'blue';
        ctx.fillText('FCFS', 950, 50);
        ctx.fillStyle = 'green';
        ctx.fillText('SCAN', 950, 70);
        ctx.fillStyle = 'red';
        ctx.fillText('C-SCAN', 950, 90);
      } else {
        const typeColors = {
          fcfs: 'blue',
          scan: 'green',
          cscan: 'red'
        };
        const typeNames = {
          fcfs: 'FCFS',
          scan: 'SCAN',
          cscan: 'C-SCAN'
        };
        ctx.fillStyle = typeColors[type];
        ctx.fillText(typeNames[type], 950, 50);
      }
      
      // Mark initial head position
      const headX = 50 + (head / maxCyl) * 1000;
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(headX, 350, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('Initial Head', headX - 30, 335);
      
      // Draw request positions
      requests.forEach(req => {
        const x = 50 + (req / maxCyl) * 1000;
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.arc(x, 350, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      if (type === 'all') {
        drawAlgorithmPath('fcfs', 'blue', maxCyl);
        drawAlgorithmPath('scan', 'green', maxCyl);
        drawAlgorithmPath('cscan', 'red', maxCyl);
        
        // Update visual summary
        document.getElementById('visualSummary').innerHTML = `
          <p><strong>Algorithm Comparison:</strong></p>
          <p>FCFS Total: ${results.fcfs.total}, Average: ${(results.fcfs.total / requests.length).toFixed(2)}</p>
          <p>SCAN Total: ${results.scan.total}, Average: ${(results.scan.total / requests.length).toFixed(2)}</p>
          <p>C-SCAN Total: ${results.cscan.total}, Average: ${(results.cscan.total / requests.length).toFixed(2)}</p>
        `;
      } else {
        const typeColors = {
          fcfs: 'blue',
          scan: 'green',
          cscan: 'red'
        };
        drawAlgorithmPath(type, typeColors[type], maxCyl);
        
        // Update visual summary
        const typeNames = {
          fcfs: 'FCFS',
          scan: 'SCAN',
          cscan: 'C-SCAN'
        };
        document.getElementById('visualSummary').innerHTML = `
          <p><strong>${typeNames[type]} Results:</strong></p>
          <p>Total head movement: ${results[type].total}</p>
          <p>Average movement per request: ${(results[type].total / requests.length).toFixed(2)}</p>
        `;
      }
    }
    
    // Draw algorithm path
    function drawAlgorithmPath(type, color, maxCyl) {
      const movements = results[type].movements;
      if (movements.length === 0) return;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Starting point is the head
      let startX = 50 + (movements[0].from / maxCyl) * 1000;
      let startY = 350;
      ctx.moveTo(startX, startY);
      
      // Draw each movement
      movements.forEach((move, idx) => {
        const endX = 50 + (move.to / maxCyl) * 1000;
        const endY = 350 - (idx + 1) * (300 / (movements.length + 1));
        
        // If this is a wrap in C-SCAN, draw it differently
        if (move.wrap) {
          // Draw a curve for the wrap
          ctx.lineTo(startX, endY);
          ctx.stroke();
          
          // Draw dashed line for the wrap
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(startX, endY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Continue from the new point
          ctx.beginPath();
          ctx.moveTo(endX, endY);
        } else {
          // Regular line
          ctx.lineTo(endX, endY);
        }
        
        // Mark the point
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        
        startX = endX;
        startY = endY;
      });
      
      ctx.stroke();
    }