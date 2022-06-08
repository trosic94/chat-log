import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const App = () => {
  const [data, setData] = useState(null);

  async function fetchData() {
    const result = await fetch("http://localhost/api/last-message");

    const data = await result.json();

    setData(data);
  }
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <h1>last message</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
