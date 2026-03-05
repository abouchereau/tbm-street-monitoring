class App {

    static get SOCKET_PORT() { return 3615;}
    static get MANDATORY_DEVICES() { return {
            "Arcade Joystick": "arcade-joystick",
            "FootSwitch":"footswitch",
            "RGBKeyboard":"rgbkeyboard",
            "DJ Hero PS":"dj-hero-ps",
            "NTS-1 digital kit":"nts-1-digital-kit",
            "CH345":"ch345",
            "nanoKEY2":"nanokey2",
            "nanoKONTROL2":"nanokontrol2",
            "Arduino":"arduino"
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
        this.initSocket();
        this.initButtons();
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
        this.socket = new WebSocket("ws://localhost:" + this.constructor.SOCKET_PORT);

        this.socket.onopen = () => {
            console.log("✅ Connecté au serveur");
        };

        this.socket.onmessage = (event) => {
            const json = JSON.parse(event.data);
            for (const key in json) {
                this.manageMessage(key, json[key]);
            }
        };

        this.socket.onclose = () => {
            console.log("❌ Déconnecté du serveur");
        };
    }

    initButtons() {
        document.getElementById("pause-app").addEventListener("click", () => {
            this.sendSocket(JSON.stringify({ action: "restart" }));
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
            case "cpu": case "ram": case "disk": case "temp":
                this.updateMonitoring(key, value);
                break;
        }
    }

    activeDevice(deviceName) {
        const card = document.getElementById( this.constructor.MANDATORY_DEVICES[deviceName]);
        if (card) {
            card.classList.remove("inactive");
            card.classList.add("active");
        }
    }

    inactiveDevice(deviceName) {
        const card = document.getElementById(this.constructor.MANDATORY_DEVICES[deviceName]);
        if (card) {
            card.classList.remove("active");
            card.classList.add("inactive");
        }
    }

    updateMonitoring(key, value) {
        const element = document.getElementById("value-"+key);
        if (element) {
            element.textContent = value;
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