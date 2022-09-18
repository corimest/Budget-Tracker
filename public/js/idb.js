let db; 

const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function(event) {
    const db = event.target.result; 
    db.createObjectStore('new_track', {autoIncrement: true }); 
}; 

request.onsuccess = function(event) {
    db = event.target.result; 

    if (navigator.onLine) {
        uploadTrack(); 
    }
}; 

request.onerror = function(event) {
    console.log(event.target.errorCode); 
}; 

function saveTrack(track) {
    const transaction = db.transaction(['new_track'], 'readwrite');
    const trackObjectStore = transaction.objectStore('new_track'); 

    trackObjectStore.add(record); 
}

function uploadTrack() {
    const transaction = db.transaction(['new_track'], 'readwrite');
    const trackObjectStore = transaction.objectStore('new_track'); 
    const getAll = trackObjectStore.getAll(); 

    getAll.onsuccess = function () {

        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const track = db.transaction(['new_track'], 'readwrite');

                    const trackObjectStore = transaction.objectStore('new_track');

                    trackObjectStore.clear();

                    alert('Success!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener('online', uploadTrack);
