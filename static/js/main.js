// let videoStream;
// let liveOCRInterval;

// async function startLiveOCR() {
//     const video = document.getElementById('video');
//     const interval = document.getElementById('ocrInterval').value;

//     try {
//         videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = videoStream;
//         video.play();

//         liveOCRInterval = setInterval(async () => {
//             const canvas = document.createElement('canvas');
//             canvas.width = video.videoWidth;
//             canvas.height = video.videoHeight;
//             canvas.getContext('2d').drawImage(video, 0, 0);

//             const dataUrl = canvas.toDataURL('image/png');
//             const res = await fetch('/capture', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ image: dataUrl })
//             });
//             const data = await res.json();

//             document.getElementById('textOutput').innerText = data.text;
//             document.getElementById('brailleOutput').innerText = data.braille;
//         }, parseInt(interval));

//     } catch (err) {
//         alert("Camera error: " + err);
//     }
// }

// function stopLiveOCR() {
//     if (videoStream) videoStream.getTracks().forEach(track => track.stop());
//     if (liveOCRInterval) clearInterval(liveOCRInterval);
//     alert("Live OCR stopped.");
// }

// async function uploadImage() {
//     const input = document.getElementById('imageInput');
//     const file = input.files[0];
//     if (!file) return alert("Select an image first");

//     const reader = new FileReader();
//     reader.onload = async function(e) {
//         const res = await fetch('/capture', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ image: e.target.result })
//         });
//         const data = await res.json();
//         document.getElementById('textOutput').innerText = data.text;
//         document.getElementById('brailleOutput').innerText = data.braille;
//     };
//     reader.readAsDataURL(file);
// }

// function downloadBraille() {
//     const braille = document.getElementById('brailleOutput').innerText;
//     if (!braille) return alert("No braille to download");
//     const blob = new Blob([braille], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'braille.txt';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
// }



let videoStream;
let liveOCRInterval;

async function startLiveOCR() {
    const video = document.getElementById('video');
    const interval = document.getElementById('ocrInterval').value;

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream;
        video.play();

        liveOCRInterval = setInterval(async () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);

            const dataUrl = canvas.toDataURL('image/png');
            const res = await fetch('/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: dataUrl })
            });
            const data = await res.json();

            document.getElementById('textOutput').innerText = data.text;
            document.getElementById('brailleOutput').innerText = data.braille;
        }, parseInt(interval));

        alert("Live OCR started. Braille and audio will update automatically.");
    } catch (err) {
        alert("Camera error: " + err);
    }
}

function stopLiveOCR() {
    if (videoStream) videoStream.getTracks().forEach(track => track.stop());
    if (liveOCRInterval) clearInterval(liveOCRInterval);
    alert("Live OCR stopped.");
}

async function uploadImage() {
    const input = document.getElementById('imageInput');
    const file = input.files[0];
    if (!file) return alert("Select an image first");

    const reader = new FileReader();
    reader.onload = async function(e) {
        const res = await fetch('/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: e.target.result })
        });
        const data = await res.json();
        document.getElementById('textOutput').innerText = data.text;
        document.getElementById('brailleOutput').innerText = data.braille;
    };
    reader.readAsDataURL(file);
}

function downloadBraille() {
    const braille = document.getElementById('brailleOutput').innerText;
    if (!braille) return alert("No braille to download");
    const blob = new Blob([braille], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'braille.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
