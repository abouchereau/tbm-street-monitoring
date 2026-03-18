class App {

    static get SOCKET_PORT() { return 3615;}
    static get MANDATORY_DEVICES() { return {
            "Arcade Joystick": "arcade-joystick",
            "FootSwitch":"footswitch",
            "RGBKeyboard":"rgbkeyboard",
            "DJ Hero PS":"dj-hero-ps",
            "NTS-1":"nts-1-digital-kit",
            "CH345 MIDI 1":"ch345",
            "nanoKEY":"nanokey2",
            "nanoKONTROL2":"nanokontrol2",
            "Arduino":"arduino",
            "Touch":"touch",
        };

    }


    socket = null;
    logInfoUl = null;
    logErrorUl = null;

    constructor() {
        this.init();
    }

    init() {
        this.displayComponents();
        this.initDom();        
        this.initButtons();
        setTimeout(() => {
            console.log("🔄 Tentative de connexion...");
            this.initSocket();
        }, 5000);
    }

    updateColor() {
        document.querySelectorAll(".stat-progress progress").forEach(progress => {
            const value = progress.value;
            progress.classList.remove("green", "orange", "red");

            if (value <= 60) {
                progress.classList.add("green");
            } else if (value <= 80) {
                progress.classList.add("orange");
            } else {
                progress.classList.add("red");
            }
        });
    }

    displayComponents() {
        const componentsDiv = document.getElementById("components");
        for (const deviceName in this.constructor.MANDATORY_DEVICES) {
            const deviceId = this.constructor.MANDATORY_DEVICES[deviceName];
            const card = document.createElement("div");
            card.classList.add("component-card", "inactive");
            card.id = "device-"+deviceId;
            card.innerHTML = `${deviceName}`;
            componentsDiv.appendChild(card);
        }
    }

    initDom() {
        this.logInfoUl = document.getElementById("logs-info");
        this.logErrorUl = document.getElementById("logs-error");
    }

    initSocket() {
        this.socket = new WebSocket(`ws://${window.location.hostname}:${App.SOCKET_PORT}`);

        this.socket.onopen = () => {
            console.log("✅ Connecté au serveur");            
            document.getElementById("state").style.display = "none";
            document.getElementById("monitor").style.display = "block";

        };

        this.socket.onmessage = (event) => {
            const json = JSON.parse(event.data);
            for (const key in json) {
                this.manageMessage(key, json[key]);
            }
            this.updateColor();
        };

        this.socket.onclose = () => {
            console.log("❌ Déconnecté du serveur");
            document.getElementById("state").style.display = "block";            
            document.getElementById("monitor").style.display = "none";
            setTimeout(() => {
                console.log("🔄 Tentative de reconnexion...");
                this.initSocket();
            }, 5000);
        };
    }

    initButtons() {
        document.getElementById("pause-app").addEventListener("click", () => {
            this.sendSocket(JSON.stringify({ action: "pause" }));
        });
        document.getElementById("restart-app").addEventListener("click", () => {
            this.sendSocket(JSON.stringify({ action: "restart" }));
        });
        document.getElementById("restart-pc").addEventListener("click", () => {
            this.sendSocket(JSON.stringify({ action: "restart-pc" }));
        });
        document.getElementById("shutdown-pc").addEventListener("click", () => {
            this.sendSocket(JSON.stringify({ action: "shutdown-pc" }));
        });
        document.getElementById("toggle-fullscreen").addEventListener("click", () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    }

    sendSocket(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        }
    }

    manageMessage(key, value) {
        switch (key) {
            case "logInfo":
                this.addLogInfo(value);
                break;
            case "logError":
                this.addLogError(value);
                break;
            case "deviceActive":
                this.activeDevice(value);   
                break;
            case "deviceInactive":
                this.inactiveDevice(value);   
                break;
            case "cpu1": case "cpu2": case "cpu3": case "cpu4": case "ram": case "disk": case "temp":
                this.updateMonitoring(key, value);
                break;
        }
    }

    retrieveDevice(deviceName) {
        for(const key in App.MANDATORY_DEVICES) {
            if (deviceName.indexOf(key) > -1) {
                return App.MANDATORY_DEVICES[key];
            }
        }
        return "unknown";
    }

    activeDevice(deviceName) {
        const deviceId= this.retrieveDevice(deviceName);
        const card = document.getElementById( "device-"+deviceId);
        if (card) {
            card.classList.remove("inactive");
            card.classList.add("active");
        }
    }

    inactiveDevice(deviceName) {
        const deviceId= this.retrieveDevice(deviceName);
        const card = document.getElementById("device-"+deviceId);
        if (card) {
            card.classList.remove("active");
            card.classList.add("inactive");
        }
    }

    updateMonitoring(key, value) {        
        const progessElt = document.getElementById("value-"+key);
        if (progessElt) {
            progessElt.value = value;          
        }
        const textElt = document.getElementById("value-"+key+"-text");
        if (textElt) {
            textElt.textContent = value + (key === "temp" ? "°C" : "%");
        }
    }

    addLogInfo(text) {
        const li = document.createElement("li");
        li.textContent = text;
        this.logInfoUl.appendChild(li);
    }

    addLogError(text) {
        const li = document.createElement("li");
        li.textContent = text;
        this.logErrorUl.appendChild(li);
    }
}