// Source for camera logic: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

const { useState, useEffect, useRef } = React;

function App() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);   // NEW: history state
  const [cameraOn, setCameraOn] = useState(false); // NEW: track camera status

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load all employees on first render
  useEffect(() => {
    fetch("http://127.0.0.1:3001/employees")
      .then(res => res.json())
      .then(setEmployees);
  }, []);

  // START CAMERA
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (err) {
      alert("Camera access denied");
    }
  };


  // STOP CAMERA (NEW)
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
      setCameraOn(false);
    }
  };

  // CAPTURE SELFIE + SEND TIMESTAMP
  const sendTimestamp = (action) => {
    if (!cameraOn) {
      return alert("Camera is not started!");
    }

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
      }).then(() => {
        alert(`Clock-${action} recorded!`);
        loadHistory(); // refresh history after action
      });

    }, "image/jpeg");
  };

  // LOAD TIMESTAMP HISTORY (NEW)
  const loadHistory = () => {
    if (!selected) return alert("Select an employee first!");

    fetch(`http://127.0.0.1:3001/timestamps/${selected}`)
      .then(res => res.json())
      .then(setHistory);
  };

  return (
    <div>
      <h2>Select Employee</h2>

      <select onChange={(e) => setSelected(e.target.value)}>
        <option value="">-- choose --</option>
        {employees.map(e => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      {/* CAMERA CONTROLS */}
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={stopCamera} disabled={!cameraOn}>Stop Camera</button>

      {/* VIDEO FEED */}
      <video ref={videoRef} width="300" autoPlay playsInline></video>

      {/* CLOCK IN / OUT BUTTONS */}
      {selected && (
        <>
          <button onClick={() => sendTimestamp("in")}>Clock In</button>
          <button onClick={() => sendTimestamp("out")}>Clock Out</button>
        </>
      )}

      {/* HISTORY BUTTON */}
      <button onClick={loadHistory} disabled={!selected}>
        Show History
      </button>

      {/* HISTORY DISPLAY */}
      <h3>Timestamp History</h3>
      <ul>
        {history.map((h) => (
          <li key={h.id}>
            [{h.action}] {h.time}  
            <br />
            <img 
              src={`http://127.0.0.1:3001/${h.photo_path}`} 
              width="100"
            />
          </li>
        ))}
      </ul>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
