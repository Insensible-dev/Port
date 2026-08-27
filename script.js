const DISCORD_ID = "659094544939352064";
const API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

const avatar = document.getElementById("discord-avatar");
const name = document.getElementById("discord-name");
const statusText = document.getElementById("discord-status");
const statusDot = document.getElementById("discord-status-dot");
const activityText = document.getElementById("discord-activity-text");

const statusNames = {
    online: "En ligne",
    idle: "Inactif",
    dnd: "Ne pas déranger",
    offline: "Hors ligne"
};

function getAvatarUrl(user) {
    if (!user.avatar) {
        return `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;
    }

    const extension = user.avatar.startsWith("a_") ? "gif" : "png";

    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=256`;
}

function updateStatus(data) {
    const user = data.discord_user;
    const status = data.discord_status || "offline";

    // Profil
    name.textContent = user.global_name || user.username;
    avatar.src = getAvatarUrl(user);
    avatar.alt = `Avatar de ${user.global_name || user.username}`;

    // Statut
    statusDot.className = "";
    statusDot.classList.add(status);

    statusText.textContent = statusNames[status] || "Inconnu";

    // Spotify
    if (data.listening_to_spotify && data.spotify) {
        const spotify = data.spotify;

        activityText.innerHTML = `
            <strong>${escapeHTML(spotify.song)}</strong>
            <br>
            <span>par ${escapeHTML(spotify.artist)}</span>
        `;

        activityText.classList.add("spotify-active");

        // Affiche la pochette si elle existe
        let cover = document.getElementById("spotify-cover");

        if (!cover) {
            cover = document.createElement("img");
            cover.id = "spotify-cover";
            cover.className = "spotify-cover";

            document
                .getElementById("discord-activity")
                .prepend(cover);
        }

        cover.src = spotify.album_art_url;
        cover.alt = `Pochette de ${spotify.album}`;
    } else {
        activityText.textContent = "Aucune activité détectée";
        activityText.classList.remove("spotify-active");

        const cover = document.getElementById("spotify-cover");

        if (cover) {
            cover.remove();
        }
    }
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

async function fetchDiscordStatus() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error("Réponse Lanyard invalide");
        }

        updateStatus(result.data);

    } catch (error) {
        console.error("Impossible de récupérer le statut Discord :", error);

        name.textContent = "Insomnie";
        statusText.textContent = "Statut indisponible";

        statusDot.className = "";
        statusDot.classList.add("offline");

        activityText.textContent = "Impossible de récupérer l'activité";
    }
}

// Première récupération
fetchDiscordStatus();

// Actualisation toutes les 15 secondes
setInterval(fetchDiscordStatus, 15000);


// Actualisation toutes les 15 secondes
setInterval(fetchDiscordStatus, 15000);
