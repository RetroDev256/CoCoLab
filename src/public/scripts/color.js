export function randomColor() {
    const colors = [
        "#fb2c36",
        "#ff6900",
        "#fd9a00",
        "#efb100",
        "#7ccf00",
        "#00c951",
        "#00bc7d",
        "#00bba7",
        "#00b8db",
        "#00a6f4",
        "#2b7fff",
        "#615fff",
        "#8e51ff",
        "#ad46ff",
        "#e12afb",
        "#f6339a",
        "#ff2056",
    ];
    return colors[Math.floor(Math.random() * colors.length)].replace(
        "oklch",
        "hsl"
    );
}

export function getContrastColor(color) {
    // If a leading # is provided, remove it
    if (color.slice(0, 1) === "#") {
        color = color.slice(1);
    }

    // Convert to RGB values
    var r = parseInt(color.substr(0, 2), 16);
    var g = parseInt(color.substr(2, 2), 16);
    var b = parseInt(color.substr(4, 2), 16);

    // Get YIQ ratio (luminance calculation)
    var yiq = (r * 299 + g * 587 + b * 114) / 1000;

    // Check contrast and return black or white
    return yiq >= 128 ? "black" : "white";
}

export function getStyle(color) {
    if (!color) {
        color = randomColor();
    }
    return `background-color: ${color}; color: ${getContrastColor(color)};`;
}
