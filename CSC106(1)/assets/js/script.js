document.addEventListener("DOMContentLoaded", () => {
  const datetimeInput = document.getElementById("datetime");
  loadLogs();

  // Function to update time every second
  function updateDateTime() {
    const now = new Date();
    const formattedTime = now.toLocaleString(); // Formats date and time as string
    datetimeInput.value = formattedTime; // Update the input field with the current time
  }

  // Set the initial time when the page loads
  updateDateTime();

  // Update the time every second (1000 milliseconds)
  setInterval(updateDateTime, 1000);
  const form = document.getElementById("visitorForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = form.name.value.trim();
      const contact = form.contact.value.trim();
      const affiliationType =
        document.getElementById("affiliationSelect").value;
      const affiliationDetails =
        document.querySelector("#affiliationInput input")?.value || "";
      const personVisited = document.getElementById(
        "personVisitedSelect"
      ).value;
      const purpose = document.getElementById("purposeSelect").value;
      const purposeDetails =
        document.querySelector("#purposeDetails input")?.value || "";

      const log = {
        datetime: new Date().toLocaleString(),
        name,
        contact,
        affiliation: `${affiliationType.toUpperCase()}: ${affiliationDetails}`,
        personVisited,
        purpose: purposeDetails ? `${purpose} - ${purposeDetails}` : purpose,
      };

      const logs = JSON.parse(localStorage.getItem("logs")) || [];
      logs.unshift(log);
      localStorage.setItem("logs", JSON.stringify(logs));

      alert("Log submitted successfully!");

      form.reset();
      displayRecentLogs();
    });

    document
      .getElementById("affiliationSelect")
      .addEventListener("change", function () {
        const type = this.value;
        document.getElementById("affiliationInput").innerHTML = `
        <label class="form-label">${
          type.charAt(0).toUpperCase() + type.slice(1)
        } Name</label>
        <input type="text" class="form-control" required />
      `;
      });

    document
      .getElementById("purposeSelect")
      .addEventListener("change", function () {
        const selected = this.value;
        const extraInputNeeded = [
          "thesis",
          "course",
          "survey",
          "office",
          "office",
          "exam",
        ].includes(selected);

        document.getElementById("purposeDetails").innerHTML = extraInputNeeded
          ? `<label class="form-label">More Details</label>
           <input type="text" class="form-control" placeholder="Add additional details" />`
          : "";
      });
  }

  if (document.getElementById("logTable")) {
    displayRecentLogs();
  }

  if (document.getElementById("filterInput")) {
    const filterInput = document.getElementById("filterInput");
    const filterText = document.getElementById("filterText");

    loadLogs(); // Load all initially

    filterInput.addEventListener("input", () => {
      const search = filterInput.value.toLowerCase();
      const logs = JSON.parse(localStorage.getItem("logs")) || [];

      const filtered = logs.filter((log) =>
        Object.values(log).some((val) =>
          String(val).toLowerCase().includes(search)
        )
      );

      filterText.textContent = search
        ? `Filtered ${filtered.length} result(s)`
        : "";

      loadLogs(filtered);
    });
  }
});

function displayRecentLogs() {
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  const table = document.querySelector("#logTable tbody");
  if (!table) return;

  table.innerHTML = "";
  logs.slice(0, 5).forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.datetime}</td>
      <td>${log.name}</td>
      <td>${log.affiliation}</td>
      <td>${log.personVisited}</td>
      <td>${log.purpose}</td>
    `;
    table.appendChild(row);
  });
}

function loadLogs(logsToDisplay = null) {
  const logs = logsToDisplay || JSON.parse(localStorage.getItem("logs")) || [];
  const tableBody = document.getElementById("logEntries");
  if (!tableBody) return;

  // Log the loaded data to ensure it's available
  console.log(logs);

  tableBody.innerHTML = "";

  logs.forEach((log, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.datetime}</td>
      <td>${log.affiliation}</td>
      <td>${log.name}</td>
      <td>${log.contact}</td>
      <td>${log.personVisited}</td>
      <td>${log.purpose}</td>
      <td><button class="btn btn-danger delete-btn" data-index="${index}">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });

  // Add event listeners for delete buttons
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", deleteLog);
  });
}

function deleteLog(e) {
  // Confirm deletion
  const confirmDelete = confirm("Are you sure you want to delete this log?");
  if (!confirmDelete) return;

  // Get the index of the log from the data-index attribute
  const index = e.target.getAttribute("data-index");

  // Retrieve the logs from localStorage
  const logs = JSON.parse(localStorage.getItem("logs")) || [];

  // Remove the log at the specified index
  logs.splice(index, 1);

  // Save the updated logs back to localStorage
  localStorage.setItem("logs", JSON.stringify(logs));

  // Reload the logs to reflect the changes
  loadLogs();
}

document
  .getElementById("printReportBtn")
  .addEventListener("click", function () {
    window.print();
  });

document
  .getElementById("generateReportBtn")
  .addEventListener("click", function () {
    const name = document.getElementById("filterName").value.toLowerCase();
    const personVisited = document
      .getElementById("filterPersonVisited")
      .value.toLowerCase();
    const purpose = document
      .getElementById("filterPurpose")
      .value.toLowerCase();
    const month = document.getElementById("filterMonth").value;

    const allData = JSON.parse(localStorage.getItem("logs")) || [];

    const filtered = allData.filter((entry) => {
      const entryName = entry.name.toLowerCase();
      const entryVisited = entry.personVisited.toLowerCase();
      const entryPurpose = entry.purpose.toLowerCase();
      const entryDate = new Date(entry.datetime);

      const entryMonth = `${entryDate.getFullYear()}-${String(
        entryDate.getMonth() + 1
      ).padStart(2, "0")}`;

      return (
        (!name || entryName.includes(name)) &&
        (!personVisited || entryVisited.includes(personVisited)) &&
        (!purpose || entryPurpose.includes(purpose)) &&
        (!month || entryMonth === month)
      );
    });

    displayResults(filtered);
  });

function displayResults(data) {
  const tbody = document.getElementById("reportTableBody");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center">No results found.</td></tr>';
    return;
  }

  data.forEach((entry) => {
    const row = `
        <tr>
          <td>${entry.datetime}</td>
          <td>${entry.name}</td>
          <td>${entry.affiliation}</td>
          <td>${entry.contact}</td>
          <td>${entry.personVisited}</td>
          <td>${entry.purpose}</td>
        </tr>`;
    tbody.innerHTML += row;
  });
}
