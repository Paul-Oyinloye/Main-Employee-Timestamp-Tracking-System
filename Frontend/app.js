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













}