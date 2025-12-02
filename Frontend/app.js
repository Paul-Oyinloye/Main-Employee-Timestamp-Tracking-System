const { useState, useEffect, useRef } = React;

function App() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  