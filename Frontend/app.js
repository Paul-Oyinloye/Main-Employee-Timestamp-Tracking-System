//Source for camera logic : https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

const { useState, useEffect, useRef } = React;

const API_BASE = "https://employee-timestamp-backend.onrender.com";

function App() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");

  const [hourlyRate, setHourlyRate] = useState(13); // Min wage Ireland 2025
  const [calculatedPay, setCalculatedPay] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  
  
  // Load employees
 
  useEffect(() => {
    fetch("http://127.0.0.1:3001/employees")
      .then(res => res.json())
      .then(setEmployees);
  }, []);

 
  // Camera controls

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
  };

 
  // Clock In / Out
 
  const sendTimestamp = (action) => {
    if (!selected) return alert("Select employee first!");
    if (!videoRef.current.srcObject) return alert("Start camera first!");

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const form = new FormData();

      form.append("selfie", file);
      form.append("employeeId", selected);

      fetch(`http://127.0.0.1:3001/timestamp/${action}`, {
        method: "POST",
        body: form
      })
        .then(() => alert(`Clock-${action} recorded!`));
    }, "image/jpeg");
  };

 
  // LOAD SHIFT HISTORY
 
  const loadHistory = () => {
    fetch(`http://127.0.0.1:3001/timestamps/${selected}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setShowHistory(true);
      });
  };


  // PAY CALCULATOR

  const calculatePay = () => {
    if (history.length < 2) return alert("Not enough timestamps recorded.");

    // pair IN + OUT timestamps
    let totalMs = 0;

    for (let i = 0; i < history.length - 1; i += 2) {
      const IN = new Date(history[i].time);
      const OUT = new Date(history[i + 1].time);

      totalMs += OUT - IN;
    }

    const hours = totalMs / (1000 * 60 * 60);
    const pay = hours * hourlyRate;

    setCalculatedPay({
      hours: hours.toFixed(2),
      pay: pay.toFixed(2)
    });
  };


  // ADD EMPLOYEE
 
  const addEmployee = () => {
    if (!newName || !newRole) return alert("Enter name & role");

    fetch("http://127.0.0.1:3001/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, role: newRole })
    })
      .then(res => res.json())
      .then(emp => {
        setEmployees([...employees, emp]);
        alert("Employee added!");
        setShowAdd(false);
      });
  };

 
  // UI

  return (
    <div>
      <h1>CraneBurg Timestamp System</h1>

      {/* ADD EMPLOYEE SECTION ------------------------------------------------ */}
      <button onClick={() => setShowAdd(!showAdd)}>Add Employee</button>

      {showAdd && (
        <div style={{ marginTop: "10px", padding: "10px", border: "1px solid black", width: "250px" }}>
          <h3>Add New Employee</h3>

          <input placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          /><br /><br />

          <input placeholder="Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          /><br /><br />

          <button onClick={addEmployee}>Save</button>
        </div>
      )}

      <br /><br />

      {/* SELECT EMPLOYEE ------------------------------------------------ */}
      <h3>Select Employee</h3>
      <select onChange={(e) => setSelected(e.target.value)}>
        <option>-- choose --</option>

        {employees.map(e => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      {/* CAMERA ------------------------------------------------ */}
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={stopCamera} style={{ background: "red", color: "white" }}>Stop Camera</button>

      <br /><br />
      <video ref={videoRef} width="300" autoPlay playsInline></video>

      <br /><br />

      {/* CLOCK BUTTONS ------------------------------------------------ */}
      {selected && (
        <>
          <button onClick={() => sendTimestamp("in")}>Clock In</button>
          <button onClick={() => sendTimestamp("out")}>Clock Out</button>
          <button onClick={loadHistory}>View Shift History</button>
        </>
      )}

      {/* SHIFT HISTORY ------------------------------------------------ */}
      {showHistory && (
        <div style={{ marginTop: "20px" }}>
          <h2>Shift History</h2>

          {history.map((h, i) => (
            <div key={i}>
              {h.action} — {h.time}
            </div>
          ))}

          <br />

          {/* PAY CALCULATOR -------------------------------------- */}
          <h3>Pay Calculator</h3>
          Hourly Rate (€):  
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
          />

          <button onClick={calculatePay}>Calculate Pay</button>

          {calculatedPay && (
            <div>
              <p>Total Hours: {calculatedPay.hours}</p>
              <p>Total Pay: €{calculatedPay.pay}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
