/* -----------------------------------------------------------
    JavaScript für persönliche Portfolio-Seite
    Autor: Zoltan Ress
    Datum: 2025-12-18
----------------------------------------------------------- */

let isAnimating = false;

function navigateCard(fromCard, toCard, direction) {
    if (isAnimating) return;
    isAnimating = true;

    const fromElement = document.querySelector(`[data-card="${fromCard}"]`);
    const toElement = document.querySelector(`[data-card="${toCard}"]`);
    const video = document.getElementById('bgVideo');
    const mask = document.getElementById('maskOverlay');
    const textAtTheBottom = document.getElementById('textAtTheBottom');
    const listElementOne = document.getElementById('LE-1');
    const listElementTwo = document.getElementById('LE-2');
    const listElementThree = document.getElementById('LE-3');

    // Video Steuerung basierend auf Card
    if (fromCard === 'presy') {
        // Kurzes Delay für sanften Übergang
        setTimeout(() => {
            resetVideo(video, mask, textAtTheBottom, listElementOne, listElementTwo, listElementThree);
        }, 200);
    } else if (toCard === 'presy') {
        startVideo(video, mask, textAtTheBottom, listElementOne, listElementTwo, listElementThree);
    }

    // SCHRITT 1: Setze toCard in Schicht 2 (next-card, z-index 50)
    toElement.classList.add('next-card');

    // SCHRITT 2: Bestimme die Verschiebungsrichtung für fromCard
    let transform = '';
    switch(direction) {
        case 'down':
            transform = 'translateY(100vh)';
            break;
        case 'up':
            transform = 'translateY(-100vh)';
            break;
        case 'left':
            transform = 'translateX(-100vw)';
            break;
        case 'right':
            transform = 'translateX(100vw)';
            break;
    }

    // SCHRITT 3: Führe die Animation aus (fromCard wird weggeschoben)
    // Kurzes Delay damit der Browser die z-index Änderung registriert
    setTimeout(() => {
        fromElement.style.transform = transform;
    }, 10);

    // SCHRITT 4: Nach Animation - Cleanup und Schichtwechsel
    setTimeout(() => {
        // fromCard geht zurück ins Lager (Schicht 1, z-index 1)
        fromElement.classList.remove('current-card');
        fromElement.style.transition = 'none';  // Animation ausschalten
        fromElement.style.transform = '';

        // Nach kurzem Delay Transition wieder aktivieren
        setTimeout(() => {
            fromElement.style.transition = '';
        }, 50);
        
        // toCard wird zur aktuellen Card (Schicht 3, z-index 100)
        toElement.classList.remove('next-card');
        toElement.classList.add('current-card');
        
        isAnimating = false;
    }, 650);
}


/* Startet das Video von vorne auf der Karte 'Presy'. */
function startVideo(video, mask, textAtTheBottom, listElementOne, listElementTwo, listElementThree) {
    if (video) {
        // 1. Video von vorne starten
        video.currentTime = 0;
        video.play().catch(e => console.log("Autoplay wurde vom Browser blockiert.", error));
        
        // 2. CSS Animation restarten (Reflow-Trick)
        void mask.offsetWidth;  // Erzwingt Neuberechnung des Layouts
        mask.classList.add('animate-mask');

        // 3. Text-Animation starten
        textAtTheBottom.classList.add('animate-color');

        // 4. Listenelement Animation starten
        listElementOne.classList.add('animate-color');
        listElementTwo.classList.add('animate-color');
        listElementThree.classList.add('animate-color');
    };
}
/* Stoppt das Video auf der Karte 'Presy' und setzt es zurück. */
function resetVideo(video, mask, textAtTheBottom, listElementOne, listElementTwo, listElementThree) {
    if (video) {
        video.pause();
        video.currentTime = 0; // Reset für den nächsten Besuch
        
        mask.classList.remove('animate-mask');

        textAtTheBottom.classList.remove('animate-color');

        listElementOne.classList.remove('animate-color');
        listElementTwo.classList.remove('animate-color');
        listElementThree.classList.remove('animate-color');
    }
}


// Touch/Swipe Support
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const viewport = document.querySelector('.viewport');

viewport.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

viewport.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, false);

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;

    // Bestimme welche Card gerade sichtbar ist
    const visibleCard = getVisibleCard();

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
            // Swipe right
            handleSwipeGesture(visibleCard, 'right');
        } else {
            // Swipe left
            handleSwipeGesture(visibleCard, 'left');
        }
    } else if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
            // Swipe down
            handleSwipeGesture(visibleCard, 'down');
        } else {
            // Swipe up
            handleSwipeGesture(visibleCard, 'up');
        }
    }
}


function getVisibleCard() {
    const cards = document.querySelectorAll('.card');
    let highestZIndex = -1;
    let visibleCard = null;

    cards.forEach(card => {
        if (card.classList.contains('hidden')) return;
        const zIndex = parseInt(window.getComputedStyle(card).zIndex);
        if (zIndex > highestZIndex) {
            highestZIndex = zIndex;
            visibleCard = card.getAttribute('data-card');
        }
    });

    return visibleCard;
}


function handleSwipeGesture(currentCard, direction) {
    // Definiere Swipe-Navigation basierend auf aktueller Card
    const swipeMap = {
        'landing': {
            'up': ['landing', 'preview', 'up']
        },
        'preview': {
            'up': ['preview', 'presy', 'up']
        },
        'presy': {
            'right': ['presy', 'cv', 'right'],
            'left': ['presy', 'others', 'left']
        },
        'cv': {
            'up': ['cv', 'likes', 'up']
        },
        'others': {
            'up': ['others', 'likes', 'up']
        },
        'likes': {
            'up': ['likes', 'ende', 'up']
        },
        'ende': {
            'down': ['ende', 'landing', 'down']
        }
    };

    if (swipeMap[currentCard] && swipeMap[currentCard][direction]) {
        const [from, to, dir] = swipeMap[currentCard][direction];
        navigateCard(from, to, dir);
    }
}

// Prüfe URL-Parameter beim Laden
window.addEventListener('DOMContentLoaded', () => {
    const returnCard = sessionStorage.getItem('returnCard');
    
    if (returnCard) {
        navigateCard('landing', returnCard, 'up');
        sessionStorage.removeItem('returnCard');
    }
});

function setTheme(themeName) {
    // Zugriff auf das html-Element
    const htmlElement = document.documentElement;
    
    // Alle theme-Klassen entfernen
    htmlElement.classList.remove('theme-light', 'theme-dark', 'theme-ocean');
    
    // Neue Klasse hinzufügen
    htmlElement.classList.add(themeName);
    
    // Anzeige aktualisieren
    document.getElementById('class-display').textContent = themeName;
}