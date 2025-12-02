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

}