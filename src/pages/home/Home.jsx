import Sidebar from "../../components/sidebar/Sidebar";
import "./home.scss";
import Chart from "../../components/chart/Chart";
import { useEffect, useState } from "react";
import Table from "../../components/table/Table"
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingspinner/LoadingSpinner";


const Home = () => {
  const [sheetNames, setSheetNames] = useState([]);
  const [sheetID, setSheetID] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);


  const getDefaultView = () => {
    // Set default view based on device width
    return window.innerWidth > 600 ? 'chart' : 'table';
  };



  const [view, setView] = useState(getDefaultView()); // Set default view based on device width

  const [loading, setLoading] = useState(true);


  const { isSignedIn, user, isLoaded } = useUser();

  let key = import.meta.env.VITE_CLIENT_KEY;

  // Load sheetID from Clerk metadata when user is ready
  useEffect(() => {
    if (isLoaded && user) {
      try {
        const sheetIdFromMetadata = user.publicMetadata?.sheetId;
        
        if (sheetIdFromMetadata) {
          setSheetID(sheetIdFromMetadata);
        } else {
          console.error('No sheetId found for user. Please contact admin.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching sheetID:', error.message);
        setLoading(false);
      }
    }
  }, [isLoaded, user]);

  // Fetch sheet names from Google Sheets once we have sheetID
  useEffect(() => {
    const fetchSheetData = async () => {
      if (!sheetID) return;
      
      setLoading(true);

      try {
        // Direct call to Google Sheets API (no backend proxy needed!)
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?key=${key}`
        );
        const names = response.data.sheets.map((sheet) => sheet.properties.title);
        setSheetNames(names);
        setSelectedSheet(names[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sheet data:', error);
        setLoading(false);
      }
    };

    fetchSheetData();
  }, [sheetID, key]);

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div className="home">
      <Sidebar names={sheetNames} selectedSheet={selectedSheet} setSelectedSheet={setSelectedSheet} />
      <div className="homeContainer">
        <br />
        {window.innerWidth > 600 ? (
          <div className="viewToggle">
            <button onClick={() => handleViewChange("chart")} disabled={view === "chart"}>
              Chart View
            </button>
            <button onClick={() => handleViewChange("table")} disabled={view === "table"}>
              Table View
            </button>
          </div>
        ) : (<></>)}

        <div className="views">
          {loading ? (
            <LoadingSpinner />
          ) : !sheetID ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No sheet ID found for your account.</p>
              <p>Please contact admin to assign a sheet ID.</p>
            </div>
          ) : !selectedSheet ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>No sheet selected.</p>
            </div>
          ) : (
            <>
              {view === "chart" && <Chart sheetID={sheetID} websiteName={selectedSheet} />}
              {view === "table" && <Table sheetID={sheetID} websiteName={selectedSheet} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
