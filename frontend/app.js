// Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

const { useState, useEffect, useRef } = React;

// Render backend URL
const API_BASE = "https://employee-timestamp-backend.onrender.com";

function App() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");

  const [hourlyRate, setHourlyRate] = useState(13); // Irish minimum wage baseline
  const [calculatedPay, setCalculatedPay] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);


  // LOAD EMPLOYEES
  
  useEffect(() => {
    fetch(`${API_BASE}/employees`)
      .then(res => res.json())
      .then(setEmployees)
      .catch(err => console.error("Employee fetch error:", err));
  }, []);

 
  // CAMERA CONTROLS

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

 
  // CLOCK IN / OUT

  const sendTimestamp = (action) => {
    if (!selected) return alert("Select an employee first");
    if (!videoRef.current.srcObject) return alert("Start camera first");

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const form = new FormData();
      form.append("selfie", blob, "selfie.jpg");
      form.append("employeeId", selected);

      fetch(`${API_BASE}/timestamp/${action}`, {
        method: "POST",
        body: form
      })
        .then(() => alert(`Clock-${action.toUpperCase()} recorded`))
        .catch(() => alert("Timestamp error"));
    }, "image/jpeg");
  };

 
  // LOAD SHIFT HISTORY

  const loadHistory = () => {
    if (!selected) return;

    fetch(`${API_BASE}/timestamps/${selected}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setShowHistory(true);
        calculatePay(data);
      })
      .catch(err => console.error("History error:", err));
  };


  // PAY CALCULATOR (Irish hourly logic)

  const calculatePay = (records) => {
    if (!records || records.length < 2) {
      setCalculatedPay(null);
      return;
    }

    let totalMs = 0;

    for (let i = 0; i < records.length - 1; i += 2) {
      const IN = new Date(records[i].time);
      const OUT = new Date(records[i + 1].time);
      totalMs += (OUT - IN);
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
    if (!newName || !newRole) return alert("Enter name and role");

    fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, role: newRole })
    })
      .then(res => res.json())
      .then(emp => {
        setEmployees([...employees, emp]);
        setNewName("");
        setNewRole("");
        setShowAdd(false);
        alert("Employee added");
      });
  };


  // UI

  return (
    <div>
      <h1>CraneBurg Timestamp System</h1>

      {/* ADD EMPLOYEE */}
      <button onClick={() => setShowAdd(!showAdd)}>Add Employee</button>

      {showAdd && (
        <div style={{ border: "1px solid black", padding: "10px", width: "250px" }}>
          <h3>New Employee</h3>
          <input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} /><br /><br />
          <input placeholder="Role" value={newRole} onChange={e => setNewRole(e.target.value)} /><br /><br />
          <button onClick={addEmployee}>Save</button>
        </div>
      )}

      <h3>Select Employee</h3>
      <select value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">-- choose --</option>
        {employees.map(e => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      <br /><br />

      {/* CAMERA */}
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={stopCamera} style={{ background: "red", color: "white" }}>Stop Camera</button>

      <br /><br />
      <video ref={videoRef} width="300" autoPlay playsInline></video>

      <br /><br />

      {/* ACTIONS */}
      {selected && (
        <>
          <button onClick={() => sendTimestamp("in")}>Clock In</button>
          <button onClick={() => sendTimestamp("out")}>Clock Out</button>
          <button onClick={loadHistory}>View Shift History</button>
        </>
      )}

      {/* HISTORY + PAY */}
      {showHistory && (
        <div style={{ marginTop: "20px" }}>
          <h2>Shift History</h2>

          {history.map((h, i) => (
            <div key={i}>{h.action} — {h.time}</div>
          ))}

          <h3>Pay Calculator</h3>
          Hourly Rate (€):
          <input
            type="number"
            value={hourlyRate}
            onChange={e => setHourlyRate(Number(e.target.value))}
          />

          {calculatedPay && (
            <>
              <p>Total Hours: {calculatedPay.hours}</p>
              <p>Total Pay: €{calculatedPay.pay}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
