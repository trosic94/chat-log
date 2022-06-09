import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import './styles/Style.css';

const App = () => {
  const [data, setData] = useState(null);
  const [searchData, setSearchData] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [searchUser, setSearchUser] = useState("");

  async function fetchData() {
    const result = await fetch("http://localhost/api/last-message");

    const data = await result.json();

    setData(data);
  }
  async function fetchSearchedData() {
    const searchResult = await fetch(`http://localhost/api/search-message?searchQuery=${searchWord}&searchUser=${searchUser}`);

    const searchDataVal = await searchResult.json();

    setSearchData(searchDataVal);
    
  }
  useEffect(() => {
    fetchData();
    fetchSearchedData();
  }, []);

  const tableBodyStyle = {
    display:'block',
    overflow : 'auto',
    maxHeight : '400px',
    width : '100%',
    whiteSpace : 'nowrap'
  }

  return (
    <>
      <div className="searchForm">
        <input type="text" placeholder="Search by user.." value={searchUser} onChange={(e) =>setSearchUser(e.target.value)}/>
        <input type="text" placeholder="Search by word.." value={searchWord} onChange={(e) =>setSearchWord(e.target.value)}/>
        <button type="button" onClick={fetchSearchedData}>Search</button>
      </div>
      <div className='scrollTable'>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Message</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            {searchData.map(item => (
                <tr key={item.id}>
                  <td>{item.user}</td>
                  <td>{item.message}</td>
                  <td>{item.datecreated}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
