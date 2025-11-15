import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { SignOutButton } from "@clerk/clerk-react";



const Sidebar = ({ names, selectedSheet, setSelectedSheet }) => {

  const { isSignedIn, user, isLoaded } = useUser();

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Monetise Up</span>
        </Link>
      </div>
      <hr />
      <div className="center">
        <ul>
          {names.map((site, index) => (
            <li 
              key={index} 
              className={selectedSheet === site ? "selected" : ""}
              style={{ textDecoration: "none", background: selectedSheet == site ? "#31a2c4" : "transparent" }} 
              onClick={() => setSelectedSheet(site)}
            >
              <DashboardIcon className="icon" />
              <span>{site}</span>
            </li>
          ))}


          <p className="title">USER</p>
          <li>
            <AccountCircleOutlinedIcon className="icon" />
            <span>{isLoaded ? user.primaryEmailAddress.emailAddress  : "husuidj"}</span>
          </li>
          <li>
            <SignOutButton aftersignouturl="/" />
          </li>
          <li className="note">
            <span>{user?.primaryEmailAddress?.emailAddress === 'sujit.jha@pocketfm.com' ? "" : "Note: This dashboard indicates total revenue including the share of MonetiseUP and if there is any discrepancy we will notify you from our end."}</span>
          </li>
        </ul>
      </div>
    </div>
  );

};

export default Sidebar;
