export function random() {
    const colors = [
        "red-500",
        "orange-500",
        "amber-500",
        "yellow-500",
        "lime-500",
        "green-500",
        "emerald-500",
        "teal-500",
        "cyan-500",
        "sky-500",
        "blue-500",
        "indigo-500",
        "violet-500",
        "purple-500",
        "fuchsia-500",
        "pink-500",
        "rose-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
export function getBackground(color) {
    if (color) {
        return {
            style: `background-color: ${color}`,
            class: "",
        };
    } else {
        return {
            style: "",
            class: `bg-${random()}`,
        };
    }
}
