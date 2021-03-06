const { app, BrowserWindow, ipcMain } = require('electron');
const { sendPdf, responsePdf, sendManifest } = require('./src/events.js');
const {
	default: installExtension,
	REACT_DEVELOPER_TOOLS,
	REDUX_DEVTOOLS,
} = require('electron-devtools-installer');
const { join } = require('path');
const url = require('url');
const { writeFileSync } = require('fs');
const pdfParser = require('./src/lib/redactPdf');
const { convertArrayToCSV } = require('convert-array-to-csv');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;

if (
	process.defaultApp ||
	/[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
	/[\\/]electron[\\/]/.test(process.execPath)
) {
	dev = true;
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
	app.commandLine.appendSwitch('high-dpi-support', 'true');
	app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		minWidth: 400,
		minHeight: 300,
		backgroundColor: '#ffffff',
		width: 600,
		height: 400,
		show: false,
	});

	// and load the index.html of the app.
	let indexPath;

	// Implementing Webpack
	if (dev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:9292',
			pathname: 'index.html',
			slashes: true,
		});
	} else {
		indexPath = url.format({
			protocol: 'file:',
			pathname: join(__dirname, 'dist', 'index.html'),
			slashes: true,
		});
	}

	mainWindow.loadURL(indexPath);

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();

		// Open the DevTools automatically if developing
		if (dev) {
			mainWindow.webContents.openDevTools();
		}
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.on('ready', () => {
	[REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS].forEach(extension => {
		installExtension(extension)
			.then(name => console.log(`Added Extension: ${name}`))
			.catch(err => console.log('An error occurred: ', err));
	});
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on('asynchronous-message', async (event, arg) => {
	if (arg.type === sendManifest && arg.payload.path && arg.payload.manifest) {
		writeFileSync(
			join(arg.payload.path, 'manifest.csv'),
			convertArrayToCSV(arg.payload.manifest)
		);
	} else if (
		arg.type === sendPdf &&
		arg.payload.original &&
		arg.payload.target &&
		arg.payload.name
	) {
		pdfParser(
			arg.payload.original,
			arg.payload.target,
			arg.payload.name.split(' ')
		);

		event.sender.send('asynchronous-reply', {
			type: responsePdf,
			payload: {
				path: arg.payload.original,
			},
		});
	} else {
		console.log(arg);
		throw 'no, bad, wrong';
	}
});
