// Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

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

  const [hourlyRate, setHourlyRate] = useState(13);
  const [calculatedPay, setCalculatedPay] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /* ---------------- LOAD EMPLOYEES ---------------- */
  useEffect(() => {
    fetch(`${API_BASE}/employees`)
      .then(res => res.json())
      .then(setEmployees)
      .catch(err => console.error(err));
  }, []);

  /* ---------------- CAMERA ---------------- */
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
  };

  /* ---------------- CLOCK IN / OUT ---------------- */
  const sendTimestamp = (action) => {
    if (!selected) return alert("Select employee first");
    if (!videoRef.current.srcObject) return alert("Start camera first");

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob(blob => {
      const form = new FormData();
      form.append("selfie", blob, "selfie.jpg");
      form.append("employeeId", selected);

      fetch(`${API_BASE}/timestamp/${action}`, {
        method: "POST",
        body: form
      }).then(() => alert(`Clock-${action} recorded`));
    });
  };

  /* ---------------- LOAD SHIFT HISTORY ---------------- */
  const loadHistory = () => {
    if (!selected) return;

    fetch(`${API_BASE}/timestamps/${selected}`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) =>
          new Date(a.time) - new Date(b.time)
        );
        setHistory(sorted);
        setShowHistory(true);
        calculatePay(sorted);
      })
      .catch(err => console.error(err));
  };

  /* ---------------- PAY CALCULATOR ---------------- */
  const calculatePay = (data) => {
    if (!data || data.length < 2) return;

    let totalMs = 0;

    for (let i = 0; i < data.length - 1; i += 2) {
      if (data[i].action === "IN" && data[i + 1]?.action === "OUT") {
        totalMs += new Date(data[i + 1].time) - new Date(data[i].time);
      }
    }

    const hours = totalMs / (1000 * 60 * 60);
    setCalculatedPay({
      hours: hours.toFixed(2),
      pay: (hours * hourlyRate).toFixed(2)
    });
  };

  /* ---------------- ADD EMPLOYEE ---------------- */
  const addEmployee = () => {
    if (!newName || !newRole) return;

    fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, role: newRole })
    })
      .then(res => res.json())
      .then(emp => {
        setEmployees([...employees, emp]);
        setShowAdd(false);
        setNewName("");
        setNewRole("");
      });
  };

  /* ---------------- UI ---------------- */
  return (
    <div>
      <h1>CraneBurg Timestamp System</h1>

      <button onClick={() => setShowAdd(!showAdd)}>Add Employee</button>

      {showAdd && (
        <div>
          <input placeholder="Name" value={newName}
            onChange={e => setNewName(e.target.value)} />
          <input placeholder="Role" value={newRole}
            onChange={e => setNewRole(e.target.value)} />
          <button onClick={addEmployee}>Save</button>
        </div>
      )}

      <h3>Select Employee</h3>
      <select onChange={e => setSelected(e.target.value)}>
        <option>-- choose --</option>
        {employees.map(e => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      <br /><br />

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={stopCamera} style={{ background: "red", color: "white" }}>
        Stop Camera
      </button>

      <br /><br />
      <video ref={videoRef} width="300" autoPlay playsInline />

      <br /><br />

      {selected && (
        <>
          <button onClick={() => sendTimestamp("in")}>Clock In</button>
          <button onClick={() => sendTimestamp("out")}>Clock Out</button>
          <button onClick={loadHistory}>View Shift History</button>
        </>
      )}

      {showHistory && (
        <div>
          <h2>Shift History</h2>
          {history.map((h, i) => (
            <div key={i}>{h.action} — {h.time}</div>
          ))}

          <h3>Pay Calculator</h3>
          € / hour:
          <input type="number"
            value={hourlyRate}
            onChange={e => setHourlyRate(+e.target.value)} />

          {calculatedPay && (
            <p>
              Hours: {calculatedPay.hours}<br />
              Pay: €{calculatedPay.pay}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
