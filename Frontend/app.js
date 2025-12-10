// Source for camera logic: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

const { useState, useEffect, useRef } = React;

function App() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [payment, setPayment] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const HOURLY_RATE = 13; // Assuming Irish minimum wage

  // Load employees on mount
  useEffect(() => {
    fetch("http://127.0.0.1:3001/employees")
      .then(res => res.json())
      .then(setEmployees);
  }, []);

  // Start camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Capture selfie and upload
  const sendTimestamp = (action) => {
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
      }).then(() => alert(`Clock-${action} recorded!`));
    }, "image/jpeg");
  };

  // Fetch employee history
  const loadHistory = () => {
    fetch(`http://127.0.0.1:3001/timestamps/${selected}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        calculatePayment(data);
      });
  };

  // Payment calculation from timestamps
  const calculatePayment = (records) => {
    /*
      logic:
      - Calculate hours = (OUT - IN)
      - Total Payment = hours * 13
    */

    let totalHours = 0;

    for (let i = 0; i < records.length; i++) {
      if (records[i].action === "IN" && records[i + 1] && records[i + 1].action === "OUT") {
        const inTime = new Date(records[i].time);
        const outTime = new Date(records[i + 1].time);

        const diffHours = (outTime - inTime) / (1000 * 60 * 60);
        totalHours += diffHours;
      }
    }

    const totalPay = totalHours * HOURLY_RATE;

    setPayment({
      hours: totalHours.toFixed(2),
      pay: totalPay.toFixed(2),
      rate: HOURLY_RATE
    });
  };

  return (
    <div>
      <h2>Select Employee</h2>

      <select onChange={(e) => setSelected(e.target.value)}>
        <option>-- choose --</option>
        {employees.map(e => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={stopCamera} style={{ background: "red", color: "white" }}>Stop Camera</button>

      <video ref={videoRef} width="300" autoPlay playsInline></video>

      {/* Clock In / Out */}
      {selected && (
        <>
          <button onClick={() => sendTimestamp("in")}>Clock In</button>
          <button onClick={() => sendTimestamp("out")}>Clock Out</button>
        </>
      )}

      {/* View History */}
      <button onClick={loadHistory}>View Shift History</button>

      {/* Show History */}
      <h3>Shift History</h3>
      <ul>
        {history.map(h => (
          <li key={h.id}>
            {h.action} — {h.time}
          </li>
        ))}
      </ul>

      {/* Payment Calculator */}
      {payment && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid black" }}>
          <h3>Payment Summary</h3>
          <p>Total Hours Worked: {payment.hours} hrs</p>
          <p>Rate: €{payment.rate}/hr</p>
          <p><b>Total Pay: €{payment.pay}</b></p>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
