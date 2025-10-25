import React, { useState, useEffect, useRef } from "react";
import { ZegoSuperBoardManager } from 'zego-superboard-web';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';
import ToolBox from './Toolbox/ToolBox';

function App() {
  const [currentTool, setCurrentTool] = useState(null);

  // --- Configuration ---
  const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
  const serverUrl = import.meta.env.VITE_ZEGO_SERVER_URL;
  const userID = "67890"; // Make sure this matches your token
  const roomID = "454533";
  const userName = "Mayank";
  
  // --- PASTE YOUR NEW VALID TOKEN HERE ---
  const token = "04AAAAAGj90v4ADO0MCs0CORcGBbnsKwCui46kQpsp7RtRnVHdFLh2TFIx6nlk5yXuelYHnZVHaVdoFjXWHT9gJWHWeUuxELUbLEKrY9wsNMM9RaqbcibRWqClKdNUsTfVg26ONcN6EaZGA+B3dirSZRLCipZgyvzI1bEOGKGv6wfsNdK7nwq0PZmVr/s8Z9BXlKyaTPGI7UJeyDf6XqfevY/1E60HQVSfv8nRXaUgF51Q3PAeUJUQSyxhalap5Al5Ivgfs6FPAQ==";
  
  // This is the ID we give to our whiteboard
  const whiteboardID = 'myWhiteboard'; 

  // Use refs to store the SDK instances
  const zgRef = useRef(null);
  const zegoSuperBoardRef = useRef(null);

  useEffect(() => {
    // Initialize SDKs only once
    zgRef.current = new ZegoExpressEngine(appID, serverUrl);
    zegoSuperBoardRef.current = ZegoSuperBoardManager.getInstance();

    // Make local copies for the async function and cleanup
    const zg = zgRef.current;
    const zegoSuperBoard = zegoSuperBoardRef.current;

    const initSuperBoard = async () => {
      try {
        console.log("Calling zegoSuperBoard.init()...");
        await zegoSuperBoard.init(zg, {
          parentDomID: 'superboard', // The div must exist
          appID,
          userID,
          token
        });
        console.log("...init() SUCCESSFUL");

        setCurrentTool(zegoSuperBoard.getToolType());

        console.log("Calling zg.loginRoom()...");
        await zg.loginRoom(roomID, token, { userID, userName }, { userUpdate: true });
        console.log("...loginRoom() SUCCESSFUL");

        console.log("Calling zegoSuperBoard.createWhiteboardView()...");
        await zegoSuperBoard.createWhiteboardView({
          name: whiteboardID, // Use the variable
          perPageWidth: 1600,
          perPageHeight: 900,
          pageCount: 1,
        });
        console.log("...createWhiteboardView() SUCCESSFUL.");

      } catch (err) {
        console.error("!!!!!!!! Zego SDK Error !!!!!!!!");
        console.error(err); // Will show token or network errors here
      }
    };

    initSuperBoard();

    // Cleanup function
    return () => {
      console.log("Cleanup: Unmounting component.");
      
      // FIX: Pass the whiteboardID to destroy the correct view
      zegoSuperBoard?.destroyWhiteboardView(whiteboardID); 
      // ZegoSuperBoardManager.destroyInstance(); // <-- THIS LINE IS REMOVED
      zg?.logoutRoom(roomID);
    };

  }, []); // Empty array [] runs this ONCE on mount

  const handleToolClick = (tool) => {
    // Get the instance from the ref
    const zegoSuperBoard = zegoSuperBoardRef.current;
    if (zegoSuperBoard) {
      zegoSuperBoard.setToolType(tool.type);
      setCurrentTool(tool.type);
    }
  };

  return (
    <div className='app'>
      {/* This div is the mount point for the whiteboard */}
      <div id="superboard"></div>
      
      <ToolBox currentTool={currentTool} onClick={handleToolClick} />
    </div>
  );
}

export default App;