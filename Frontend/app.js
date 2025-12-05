
//Source for camera logic :https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

const { useState, useEffect, useRef } = React;

function App() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);


  useEffect(() => {
    fetch("http://localhost:3000/employees")
      .then(res => res.json())
      .then(setEmployees);
  }, []);


  //To Start camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
  };


  // Captures selfie  upload
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

      fetch(`http://localhost:3000/timestamp/${action}`, {
        method: "POST",
        body: form
      }).then(() => alert(`Clock-${action} recorded!`));
    }, "image/jpeg");
  };













}