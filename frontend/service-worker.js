chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "takeScreenshot") {
		chrome.tabs.captureVisibleTab(sender.tab.windowId, {format: "png"}, (dataUrl) => {
			sendResponse({screenshot: dataUrl});
		});
		return true; // Keep the message channel open for async response
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.greeting == "body") {
		const tempContainer = chrome.createElement("div");
		tempContainer.innerHTML = message.bodyString;
		const element = tempContainer.firstChild;

		console.log(element);
	}

	if (message.greeting === "analysis") {
		sendResponse("safe");

		return true;
	}
});

function base64ToFile(base64String, fileName) {
	// Split the base64 string into content type and base64 data parts
	const [mimePart, dataPart] = base64String.split(",");

	// Extract the MIME type from the data URL
	const mimeType = mimePart.match(/:(.*?);/)[1];

	// Decode the base64 data into binary data
	const binaryString = atob(dataPart);
	const byteNumbers = new Uint8Array(binaryString.length);

	for (let i = 0; i < binaryString.length; i++) {
		byteNumbers[i] = binaryString.charCodeAt(i);
	}

	// Create a new file object with the decoded binary data
	return new File([byteNumbers], fileName, {type: mimeType});
}

async function postImageToServer(imageFile) {
	console.log(imageFile);
	const formData = new FormData();
	formData.append("file", imageFile);

	try {
		const response = await fetch("http://127.0.0.1:8000/upload/", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error("Failed to upload image");
		}

		const result = await response.json();
		console.log("Image upload successful:", result);
		return result;
	} catch (error) {
		console.error("Error uploading image:", error);
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "upload-image") {
		const dataurl = message.dataurl;
		const imageFile = base64ToFile(dataurl, "user.png");

		postImageToServer(imageFile)
			.then((result) => {
				sendResponse({success: true, result});
			})
			.catch((error) => {
				sendResponse({success: false, error: error.message});
			});
		return true; // Keeps the message channel open for async response
	}
});
