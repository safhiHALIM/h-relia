/**
 * Device Fingerprinting for shop47 Access Links
 * Generates a unique device identifier based on browser and system characteristics
 */

/**
 * Generate a device fingerprint using available browser APIs
 * @returns {string} SHA256 hash of device characteristics
 */
function generateDeviceId() {
    const characteristics = [];
    
    // User Agent
    characteristics.push(navigator.userAgent || 'unknown');
    
    // Screen information
    const screen = window.screen;
    characteristics.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    characteristics.push(screen.availWidth + 'x' + screen.availHeight);
    
    // Timezone
    characteristics.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown');
    
    // Language
    characteristics.push(navigator.language || 'unknown');
    
    // Platform
    characteristics.push(navigator.platform || 'unknown');
    
    // Hardware concurrency (CPU cores)
    characteristics.push(navigator.hardwareConcurrency || 'unknown');
    
    // Memory (if available)
    if (navigator.deviceMemory) {
        characteristics.push(navigator.deviceMemory.toString());
    }
    
    // WebGL information (if available)
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const renderer = gl.getParameter(gl.RENDERER);
            const vendor = gl.getParameter(gl.VENDOR);
            characteristics.push(renderer || 'unknown');
            characteristics.push(vendor || 'unknown');
        }
    } catch (e) {
        // WebGL not available
        characteristics.push('no-webgl');
    }
    
    // Canvas fingerprint (simplified)
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('NeoSafi Device ID', 2, 2);
        characteristics.push(canvas.toDataURL());
    } catch (e) {
        characteristics.push('no-canvas');
    }
    
    // Combine all characteristics
    const deviceString = characteristics.join('|');
    
    // Generate SHA256 hash
    return sha256(deviceString);
}

/**
 * Simple SHA256 implementation for client-side hashing
 * @param {string} message - The message to hash
 * @returns {string} SHA256 hash in hexadecimal format
 */
function sha256(message) {
    // Convert string to UTF-8 bytes
    const msgBuffer = new TextEncoder().encode(message);
    
    // Use Web Crypto API if available
    if (window.crypto && window.crypto.subtle) {
        return window.crypto.subtle.digest('SHA-256', msgBuffer)
            .then(hashBuffer => {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            })
            .catch(() => {
                // Fallback to simple hash if Web Crypto fails
                return simpleHash(message);
            });
    }
    
    // Fallback to simple hash
    return Promise.resolve(simpleHash(message));
}

/**
 * Simple hash function as fallback when SHA256 is not available
 * Note: This is not cryptographically secure, but sufficient for device identification
 * @param {string} str - String to hash
 * @returns {string} Simple hash
 */
function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive hex string
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Get device information for display purposes
 * @returns {object} Device information object
 */
function getDeviceInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
    };
}

/**
 * Check if device fingerprinting is supported
 * @returns {boolean} True if basic fingerprinting is supported
 */
function isDeviceFingerprintingSupported() {
    return !!(navigator.userAgent && window.screen && Intl.DateTimeFormat);
}

/**
 * Generate device ID synchronously (using fallback hash)
 * @returns {string} Device ID hash
 */
function generateDeviceIdSync() {
    const characteristics = [];
    
    // Basic characteristics that are always available
    characteristics.push(navigator.userAgent || 'unknown');
    characteristics.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    characteristics.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown');
    characteristics.push(navigator.language || 'unknown');
    characteristics.push(navigator.platform || 'unknown');
    
    const deviceString = characteristics.join('|');
    return simpleHash(deviceString);
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateDeviceId,
        generateDeviceIdSync,
        getDeviceInfo,
        isDeviceFingerprintingSupported
    };
}

// For browser usage, make functions available globally
if (typeof window !== 'undefined') {
    window.generateDeviceId = generateDeviceIdSync; // Use sync version for simplicity
    window.getDeviceInfo = getDeviceInfo;
    window.isDeviceFingerprintingSupported = isDeviceFingerprintingSupported;
}