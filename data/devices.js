// Common device resolutions for wallpapers
export const devices = [
    // iPhone
    { name: "iPhone 15 Pro Max", width: 1290, height: 2796, category: "iPhone" },
    { name: "iPhone 15 Pro / 15", width: 1179, height: 2556, category: "iPhone" },
    { name: "iPhone 14 Plus / 13 Pro Max", width: 1284, height: 2778, category: "iPhone" },
    { name: "iPhone 14 / 13 / 12", width: 1170, height: 2532, category: "iPhone" },
    { name: "iPhone SE (3rd gen)", width: 750, height: 1334, category: "iPhone" },

    // Android
    { name: "Samsung Galaxy S24 Ultra", width: 1440, height: 3120, category: "Android" },
    { name: "Samsung Galaxy S24", width: 1080, height: 2340, category: "Android" },
    { name: "Google Pixel 8 Pro", width: 1344, height: 2992, category: "Android" },
    { name: "Google Pixel 8", width: 1080, height: 2400, category: "Android" },
    { name: "OnePlus 12", width: 1440, height: 3168, category: "Android" },

    // iPad
    { name: "iPad Pro 12.9\"", width: 2048, height: 2732, category: "iPad" },
    { name: "iPad Pro 11\"", width: 1668, height: 2388, category: "iPad" },
    { name: "iPad Air", width: 1640, height: 2360, category: "iPad" },

    // Desktop
    { name: "MacBook Pro 14\"", width: 3024, height: 1964, category: "Desktop" },
    { name: "4K Desktop", width: 3840, height: 2160, category: "Desktop" },
    { name: "1080p Desktop", width: 1920, height: 1080, category: "Desktop" },

    // Custom
    { name: "Custom", width: null, height: null, category: "Custom" }
];

// Get device by name
export function getDevice(deviceName) {
    return devices.find(d => d.name === deviceName);
}

// Get devices by category
export function getDevicesByCategory(category) {
    return devices.filter(d => d.category === category);
}
