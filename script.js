
/* ============================================================
   INIT
   ============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================================
   IMAGE FALLBACKS
   ============================================================ */
document.querySelectorAll(".mosaic-item img").forEach((img) => {
    img.onerror = function () {
        this.style.display = "none";
        this.parentElement.style.backgroundColor = getFallbackColor();
    };
});

const fallbackColors = ["#F3F4F6", "#E5E7EB", "#D1D5DB", "#F9FAFB"];

function getFallbackColor() {
    return fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
}

/* ============================================================
   MODE TOGGLE
   ============================================================ */
const toggleButtons = document.querySelectorAll(".toggle-btn");
const modeContents = document.querySelectorAll(".mode-content");
const STORAGE_KEY = "cd_mode";

function setMode(mode) {
    toggleButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
        btn.setAttribute(
            "aria-checked",
            btn.dataset.mode === mode ? "true" : "false",
        );
    });

    modeContents.forEach((content) => {
        const isTarget = content.id === `${mode}-content`;
        if (isTarget) {
            content.classList.add("active");
        } else {
            content.classList.remove("active");
        }
    });

    localStorage.setItem(STORAGE_KEY, mode);

    // Re-trigger observer for newly visible content
    setTimeout(observeElements, 100);
}

toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (!btn.classList.contains("active")) {
            setMode(btn.dataset.mode);
        }
    });
});

const savedMode = localStorage.getItem(STORAGE_KEY) || "technical";
setMode(savedMode);

/* ============================================================
   MODAL
   ============================================================ */
const modal = document.getElementById("password-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const passwordStep = document.getElementById("modal-password-step");
const resourceStep = document.getElementById("modal-resource-step");
const passwordInput = document.getElementById("modal-password-input");
const errorMsg = document.getElementById("modal-error");
const fallbackMsg = document.getElementById("modal-fallback");
const passwordActions = document.getElementById("modal-password-actions");
const resourceName = document.getElementById("modal-resource-name");

let currentTargetKey = "";
let currentTargetConfig = null;
let currentTargetLabel = "";

const RESOURCE_LABELS = {
    beta: "Resume",
    gamma: "Leadership & Development Journey",
    delta: "People & Portraits",
};

const MSG_UNAVAILABLE = "This resource is not available right now. Please try again later.";

function isProtectedDocument(targetConfig) {
    return targetConfig && typeof targetConfig === "object";
}

function showPasswordStep() {
    passwordStep.removeAttribute("hidden");
    resourceStep.setAttribute("hidden", "true");
    passwordActions.removeAttribute("hidden");
    errorMsg.setAttribute("hidden", "true");
    fallbackMsg.setAttribute("hidden", "true");
    modalDescription.textContent = "Enter the passphrase to continue.";
}

function showResourceStep(message) {
    passwordStep.setAttribute("hidden", "true");
    resourceStep.removeAttribute("hidden");
    passwordActions.setAttribute("hidden", "true");
    fallbackMsg.textContent = message || "";
    if (message) {
        fallbackMsg.removeAttribute("hidden");
    } else {
        fallbackMsg.setAttribute("hidden", "true");
    }
    resourceName.textContent = currentTargetLabel;
    modalDescription.textContent = "Choose how you'd like to access this document.";
}

window.openModal = function (targetKey) {
    const aliasMap = {
        resume: "beta",
        journey: "gamma",
        portraits: "delta",
    };

    const key = CONFIG[targetKey] ? targetKey : aliasMap[targetKey] || targetKey;
    currentTargetKey = key;
    currentTargetConfig = CONFIG[key] || null;
    currentTargetLabel = RESOURCE_LABELS[key] || "Protected Content";

    modalTitle.textContent = currentTargetLabel;
    showPasswordStep();
    modal.removeAttribute("hidden");
    passwordInput.value = "";
    passwordInput.focus();
    document.body.style.overflow = "hidden";
};

window.closeModal = function () {
    modal.setAttribute("hidden", "true");
    currentTargetKey = "";
    currentTargetConfig = null;
    currentTargetLabel = "";
    document.body.style.overflow = "";
};

window.openProtectedResource = function (resourceType) {
    if (!isProtectedDocument(currentTargetConfig)) {
        fallbackMsg.textContent = MSG_UNAVAILABLE;
        fallbackMsg.removeAttribute("hidden");
        return;
    }

    const targetUrl = currentTargetConfig[resourceType] || "";
    if (!targetUrl) {
        fallbackMsg.textContent = MSG_UNAVAILABLE;
        fallbackMsg.removeAttribute("hidden");
        return;
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
    closeModal();
};

window.submitModal = function () {
    const entered = passwordInput.value || "";
    if (entered === CONFIG.alpha) {
        if (isProtectedDocument(currentTargetConfig)) {
            showResourceStep();
        } else if (currentTargetConfig) {
            window.open(currentTargetConfig, "_blank", "noopener,noreferrer");
            closeModal();
        } else {
            showResourceStep(MSG_UNAVAILABLE);
        }
    } else {
        errorMsg.removeAttribute("hidden");
        passwordInput.focus();
    }
};

passwordInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        submitModal();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeModal();
    }
});

modal.addEventListener("click", function (e) {
    if (e.target === modal) {
        closeModal();
    }
});

const CONFIG = {
    alpha: "detour",
    beta: {
        view: "https://docs.google.com/document/d/1OTWiyCprKCBVP8KhfgkYevxJhDTeL34CKir8EXaNvzs/view",
        pdf: "https://docs.google.com/document/d/1OTWiyCprKCBVP8KhfgkYevxJhDTeL34CKir8EXaNvzs/export?format=pdf",
    },
    gamma: {
        view: "https://docs.google.com/document/d/1GHbgdyt7SKLMB7pNHmGaqOhsS2Ep8P9JFdeS4IGvyyU/view",
        pdf: "https://docs.google.com/document/d/1GHbgdyt7SKLMB7pNHmGaqOhsS2Ep8P9JFdeS4IGvyyU/export?format=pdf",
    },
    delta: "https://drive.google.com/drive/folders/19nxC1Ui4X668ctlnqOhlOTy_EBfeZa5h?usp=sharing",
};

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */
function observeElements() {
    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    document.querySelectorAll(".fade-in").forEach((element) => {
        if (element.offsetParent !== null) {
            observer.observe(element);
        }
    });
}

document.addEventListener("DOMContentLoaded", observeElements);

/* ============================================================
   PAGE LOAD
   ============================================================ */
window.addEventListener("load", function () {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
        overlay.classList.add("hidden");
        overlay.setAttribute("aria-hidden", "true");
    }
});
