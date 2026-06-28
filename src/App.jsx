import React, { useState, useEffect, useRef } from "react";
import { ZegoSuperBoardManager } from "zego-superboard-web";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import ToolBox from "./Toolbox/ToolBox";

function App() {
  const [currentTool, setCurrentTool] = useState(null);

  // ---------------- CONFIG ----------------
  const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID);
  const serverUrl = import.meta.env.VITE_ZEGO_SERVER_URL;

  console.log("AppID:", appID);
  console.log("Server URL:", serverUrl);

  const userID = "67890";
  const userName = "Mayank";
  const roomID = "454533";

  const token =
    "04AAAAAGpCd2YADFcyVZfUMktUgHx8TwCvKAxWeeEP1OipWbtrM2MYps3mG8fn74ZzlwEXPWUgvO3lu5SoTurGxAMTFKKYbrldnZs8zZwTqDXJxpEGSqNC/YbwN+DOfVWzN6Qc5+LYk0z4fpAVhAmfInYuRFbxVsh+/36/C9JnFtARfS5gKawrQVitS+HU/GTErFeRfaJa/0eW4V9KqM80Tib4PoGVPKfr1+2zPEfCvhtkXOIdKuE7PQA6a5mYDAPwIQDxD2g/fAE=";

  const whiteboardID = "myWhiteboard";

  const zgRef = useRef(null);
  const zegoSuperBoardRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Creating Express Engine...");

        const zg = new ZegoExpressEngine(appID, serverUrl);
        zgRef.current = zg;

        const zegoSuperBoard = ZegoSuperBoardManager.getInstance();
        zegoSuperBoardRef.current = zegoSuperBoard;

        console.log("Initializing SuperBoard...");

        await zegoSuperBoard.init(zg, {
          parentDomID: "superboard",
          appID,
          userID,
          token,
        });

        console.log("SuperBoard Initialized");

        setCurrentTool(zegoSuperBoard.getToolType());

        console.log("Logging into room...");

        await zg.loginRoom(
          roomID,
          token,
          {
            userID,
            userName,
          },
          {
            userUpdate: true,
          }
        );

        console.log("Room Login Successful");

        console.log("Creating Whiteboard...");

        await zegoSuperBoard.createWhiteboardView({
          name: whiteboardID,
          perPageWidth: 1600,
          perPageHeight: 900,
          pageCount: 1,
        });

        console.log("Whiteboard Created Successfully");
      } catch (err) {
        console.error("ZEGO ERROR");
        console.error(err);
      }
    };

    init();

    return () => {
      console.log("Cleanup...");

      try {
        zegoSuperBoardRef.current?.destroyWhiteboardView(whiteboardID);
      } catch (e) {}

      try {
        zgRef.current?.logoutRoom(roomID);
      } catch (e) {}
    };
  }, []);

  const handleToolClick = (tool) => {
    const board = zegoSuperBoardRef.current;

    if (!board) return;

    board.setToolType(tool.type);
    setCurrentTool(tool.type);
  };

  return (
    <div className="app">
      <div
        id="superboard"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      />

      <ToolBox
        currentTool={currentTool}
        onClick={handleToolClick}
      />
    </div>
  );
}

export default App;