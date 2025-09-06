/**
 * @name EditUploadsReborn
 * @version 0.1.0
 * @author SteaN
 * @description Edit images before uploading. Inspired by Qwerasd's EditUploads.
 * @source https://github.com/SteeaaN/EditUploadsReborn
 * @updateUrl https://github.com/SteeaaN/EditUploadsReborn/blob/main/EditUploadsReborn.plugin.js
 */

module.exports = class EditUploadsReborn {
    defaultSettings = {
        saveOnChange: true,
        tools: {
            draw: { size: 10, color: "#ff0000" },
            line: { thickness: 10, color: "#ff0000" },
            arrow: { thickness: 10, color: "#ff0000" },
            rectangle: { thickness: 10, color: "#ff0000" },
            ellipse: { thickness: 10, color: "#ff0000" },
            "blur brush": { size: 48, amount: 3 },
            blur: { amount: 3 },
            "inverse blur": { amount: 3 }
        }
    };

    start() {
        this.icons = {
            rectangle: "▭",
            circle: "◯",
            brush: "🖌",
            blurBrush: "🖍️",
            blur: "💧",
            inverseBlur: "🔁",
            crop: "✂️",
            undo: "↶",
            redo: "↷",
            line: "➖",
            arrow: "➡️"
        };

        this.tools = [
            {
                name: 'draw',
                category: 'main',
                icon: this.icons.brush,
                settings: {
                    size: { type: 'range', min: 2, max: 150, value: 10 },
                    color: { type: 'color', value: '#ff0000' }
                },
                initialize: () => {},
                selected: function (canvas, ctx) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = this.settings.color.value;
                    ctx.lineWidth = Math.max(1, this.settings.size.value * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                },
                mouseDown: function (_, ctx, location) {
                    ctx.beginPath();
                    ctx.moveTo(location.x, location.y);
                },
                mouseMove: function (_, ctx, location) {
                    ctx.lineTo(location.x, location.y);
                    ctx.stroke();
                },
                mouseUp: function (_, ctx, location) {
                    ctx.lineTo(location.x, location.y);
                    ctx.stroke();
                }
            },

            {
                name: 'line',
                category: 'main',
                icon: this.icons.line,
                settings: {
                    thickness: { type: 'range', min: 1, max: 150, value: 3 },
                    color: { type: 'color', value: '#ffffff' }
                },
                initialize: function () {
                    this.imageCopy = document.createElement('canvas');
                    this.imageCopyCtx = this.imageCopy.getContext('2d');
                },
                selected: function (canvas, ctx) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.strokeStyle = this.settings.color.value;
                    ctx.lineWidth = Math.max(1, this.settings.thickness.value * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    this.imageCopy.width = canvas.width;
                    this.imageCopy.height = canvas.height;
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                },
                mouseDown: function (_, __, location) { this.startLoc = location; },
                mouseMove: function (_, ctx, location) {
                    ctx.drawImage(this.imageCopy, 0, 0);
                    ctx.beginPath();
                    ctx.moveTo(this.startLoc.x, this.startLoc.y);
                    ctx.lineTo(location.x, location.y);
                    ctx.stroke();
                },
                mouseUp: function (canvas, ctx, location, _, e) {
                    this.mouseMove(canvas, ctx, location, e);
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                }
            },

            {
                name: 'arrow',
                category: 'main',
                icon: this.icons.arrow,
                settings: {
                    thickness: { type: 'range', min: 1, max: 150, value: 3 },
                    color: { type: 'color', value: '#ffff00' }
                },
                initialize: function () {
                    this.imageCopy = document.createElement('canvas');
                    this.imageCopyCtx = this.imageCopy.getContext('2d');
                },
                selected: function (canvas, ctx) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.strokeStyle = this.settings.color.value;
                    ctx.lineWidth = Math.max(1, this.settings.thickness.value * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    this.imageCopy.width = canvas.width;
                    this.imageCopy.height = canvas.height;
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                },
                mouseDown: function (_, __, location) {
                    this.startLoc = location;
                },
                mouseMove: function (_, ctx, location) {
                    ctx.drawImage(this.imageCopy, 0, 0);

                    const x1 = this.startLoc.x;
                    const y1 = this.startLoc.y;
                    const x2 = location.x;
                    const y2 = location.y;

                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);

                    if (len === 0) return;

                    const angle = Math.atan2(dy, dx);

                    const lineWidth = this.settings.thickness.value;
                    const headLength = Math.max(10, lineWidth * 4);
                    const headWidth = lineWidth * 2.5;

                    const xLineEnd = x2 - Math.cos(angle) * headLength;
                    const yLineEnd = y2 - Math.sin(angle) * headLength;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(xLineEnd, yLineEnd);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(x2, y2);
                    ctx.lineTo(
                        xLineEnd - Math.cos(angle - Math.PI / 2) * headWidth / 2,
                        yLineEnd - Math.sin(angle - Math.PI / 2) * headWidth / 2
                    );
                    ctx.lineTo(
                        xLineEnd - Math.cos(angle + Math.PI / 2) * headWidth / 2,
                        yLineEnd - Math.sin(angle + Math.PI / 2) * headWidth / 2
                    );
                    ctx.closePath();
                    ctx.fillStyle = this.settings.color.value;
                    ctx.fill();
                },
                mouseUp: function (canvas, ctx, location, _, e) {
                    this.mouseMove(canvas, ctx, location, e);
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                }
            },

            {
                name: 'crop',
                category: 'main',
                icon: this.icons.crop,
                settings: {},
                initialize: function (_, __, tools) {
                    this.imageCopy = document.createElement('canvas');
                    this.imageCopyCtx = this.imageCopy.getContext('2d');
                    this.greyed = document.createElement('canvas');
                    this.greyedCtx = this.greyed.getContext('2d');
                },
                selected: async function (canvas, ctx) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.lineWidth = Math.max(1, 4 * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.strokeStyle = 'white';
                    this.imageCopy.width = canvas.width;
                    this.imageCopy.height = canvas.height;
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                    this.greyed.width = canvas.width;
                    this.greyed.height = canvas.height;
                    this.greyedCtx.drawImage(canvas, 0, 0);
                    this.greyedCtx.globalAlpha = 0.6;
                    this.greyedCtx.fillRect(0, 0, canvas.width, canvas.height);
                    this.greyedCtx.globalAlpha = 1;
                },
                mouseDown: function (_, __, location) { this.startLoc = location; },
                mouseMove: function (_, ctx, location) {
                    ctx.drawImage(this.greyed, 0, 0);
                    const [x, y, w, h] = [this.startLoc.x, this.startLoc.y, location.x - this.startLoc.x, location.y - this.startLoc.y];
                    ctx.drawImage(this.imageCopy, x, y, w, h, x, y, w, h);
                    ctx.strokeRect(x, y, w, h);
                },
                mouseUp: function (canvas, ctx, location, helpers) {
                    const [x, y, w, h] = [
                        this.startLoc.x >= location.x ? location.x : this.startLoc.x,
                        this.startLoc.y >= location.y ? location.y : this.startLoc.y,
                        Math.abs(location.x - this.startLoc.x),
                        Math.abs(location.y - this.startLoc.y)
                    ];
                    if (w < 2 || h < 2) return;
                    canvas.width = w;
                    canvas.height = h;
                    ctx.drawImage(this.imageCopy, x, y, w, h, 0, 0, w, h);
                    this.imageCopy.width = w;
                    this.imageCopy.height = h;
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                    this.greyed.width = canvas.width;
                    this.greyed.height = canvas.height;
                    this.greyedCtx.drawImage(canvas, 0, 0);
                    this.greyedCtx.globalAlpha = 0.6;
                    this.greyedCtx.fillRect(0, 0, canvas.width, canvas.height);
                    this.greyedCtx.globalAlpha = 1;
                    helpers.fitCanvas(canvas, canvas.parentNode);
                    ctx.lineWidth = Math.max(1, 4 * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.strokeStyle = 'white';
                }
            },

            {
                name: 'rectangle',
                category: 'shapes',
                icon: this.icons.rectangle,
                settings: {
                    thickness: { type: 'range', min: 1, max: 150, value: 10 },
                    color: { type: 'color', value: '#ff0000' }
                },
                initialize: function () {
                    this.imageCopy = document.createElement('canvas');
                    this.imageCopyCtx = this.imageCopy.getContext('2d');
                },
                selected: function (canvas, ctx) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.lineWidth = Math.max(1, this.settings.thickness.value * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.strokeStyle = this.settings.color.value;
                    this.imageCopy.width = canvas.width;
                    this.imageCopy.height = canvas.height;
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                },
                mouseDown: function (_, __, location) {
                    this.startLoc = location;
                },
                mouseMove: function (_, ctx, location, e) {
                    ctx.drawImage(this.imageCopy, 0, 0);

                    let x = this.startLoc.x;
                    let y = this.startLoc.y;
                    let w = location.x - this.startLoc.x;
                    let h = location.y - this.startLoc.y;

                    if (e && e.shiftKey) {
                        const size = Math.min(Math.abs(w), Math.abs(h));
                        w = w < 0 ? -size : size;
                        h = h < 0 ? -size : size;
                    }

                    if (e && e.altKey) {
                        x = this.startLoc.x - w;
                        y = this.startLoc.y - h;
                        w *= 2;
                        h *= 2;
                    }

                    ctx.strokeRect(x, y, w, h);
                },
                mouseUp: function (canvas, ctx, location, _, e) {
                    this.mouseMove(canvas, ctx, location, e);
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                }
            },

            {
                name: 'ellipse',
                category: 'shapes',
                icon: this.icons.circle,
                settings: {
                    thickness: { type: 'range', min: 2, max: 150, value: 4 },
                    color: { type: 'color', value: '#00ff00' }
                },
                initialize: function () {
                    this.imageCopy = document.createElement('canvas');
                    this.imageCopyCtx = this.imageCopy.getContext('2d');
                },
                selected: function (canvas, ctx) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.lineWidth = Math.max(1, this.settings.thickness.value * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.strokeStyle = this.settings.color.value;
                    this.imageCopy.width = canvas.width;
                    this.imageCopy.height = canvas.height;
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                },
                mouseDown: function (_, __, location) {
                    this.startLoc = location;
                },
                mouseMove: function (_, ctx, location, e) {
                    ctx.drawImage(this.imageCopy, 0, 0);

                    let x = this.startLoc.x;
                    let y = this.startLoc.y;
                    let w = location.x - this.startLoc.x;
                    let h = location.y - this.startLoc.y;

                    if (e && e.shiftKey) {
                        const size = Math.min(Math.abs(w), Math.abs(h));
                        w = w < 0 ? -size : size;
                        h = h < 0 ? -size : size;
                    }

                    if (e && e.altKey) {
                        x = this.startLoc.x - w;
                        y = this.startLoc.y - h;
                        w *= 2;
                        h *= 2;
                    }

                    ctx.beginPath();
                    ctx.ellipse(
                        x + w / 2,
                        y + h / 2,
                        Math.abs(w / 2),
                        Math.abs(h / 2),
                        0, 0, 2 * Math.PI
                    );
                    ctx.stroke();
                },
                mouseUp: function (canvas, ctx, location, _, e) {
                    this.mouseMove(canvas, ctx, location, e);
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                }
            },

            {
                name: 'blur brush',
                category: 'blur',
                icon: this.icons.blurBrush,
                settings: {
                    size: { type: 'range', min: 5, max: 250, value: 48 },
                    amount: { type: 'range', min: 1, max: 20, value: 3 }
                },
                initialize: function () {
                    this.blurred = document.createElement('canvas');
                    this.blurredCtx = this.blurred.getContext('2d');
                },
                selected: function (canvas, ctx, helpers) {
                    ctx.globalCompositeOperation = 'source-over';
                    this.blurred.width = canvas.width;
                    this.blurred.height = canvas.height;
                    const imgData = helpers.blurImage(canvas, this.settings.amount.value);
                    this.blurredCtx.putImageData(imgData, 0, 0);
                },
                mouseDown: function (_, __, location) { this.lastLoc = location; },
                mouseMove: function (canvas, ctx, location) {
                    const sizeCss = Math.max(1, this.settings.size.value * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    const r = Math.max(1, sizeCss / 2);
                    const lx = this.lastLoc ? this.lastLoc.x : location.x;
                    const ly = this.lastLoc ? this.lastLoc.y : location.y;
                    const dx = location.x - lx;
                    const dy = location.y - ly;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const step = Math.max(1, Math.floor(dist / (r * 0.6)));
                    for (let i = 0; i <= step; i++) {
                        const t = step === 0 ? 0 : i/step;
                        const cx = lx + dx * t;
                        const cy = ly + dy * t;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(cx, cy, r, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(this.blurred, 0, 0);
                        ctx.restore();
                    }
                    this.lastLoc = location;
                },
                mouseUp: function () { this.lastLoc = null; }
            },

            {
                name: 'blur',
                category: 'blur',
                icon: this.icons.blur,
                settings: {
                    amount: { type: 'range', min: 1, max: 20, value: 3 },
                },
                initialize: function () {
                    this.imageCopy = document.createElement('canvas');
                    this.imageCopyCtx = this.imageCopy.getContext('2d');
                    this.blurred = document.createElement('canvas');
                    this.blurredCtx = this.blurred.getContext('2d');
                },
                selected: function (canvas, ctx, helpers) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.lineWidth = Math.max(1, 2 * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.strokeStyle = 'white';
                    this.imageCopy.width = canvas.width;
                    this.imageCopy.height = canvas.height;
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                    const blurredCanvasImageData = helpers.blurImage(canvas, this.settings.amount.value);
                    this.blurred.width = canvas.width;
                    this.blurred.height = canvas.height;
                    this.blurredCtx.putImageData(blurredCanvasImageData, 0, 0);
                },
                mouseDown: function (_, __, location) { this.startLoc = location; },
                mouseMove: function (_, ctx, location) {
                    ctx.drawImage(this.imageCopy, 0, 0);
                    const [x, y, w, h] = [this.startLoc.x, this.startLoc.y, location.x - this.startLoc.x, location.y - this.startLoc.y];
                    ctx.drawImage(this.blurred, x, y, w, h, x, y, w, h);
                    ctx.strokeRect(x, y, w, h);
                },
                mouseUp: function (canvas, ctx, location) {
                    ctx.drawImage(this.imageCopy, 0, 0);
                    const [x, y, w, h] = [this.startLoc.x, this.startLoc.y, location.x - this.startLoc.x, location.y - this.startLoc.y];
                    ctx.drawImage(this.blurred, x, y, w, h, x, y, w, h);
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                }
            },

            {
                name: 'inverse blur',
                category: 'blur',
                icon: this.icons.inverseBlur,
                settings: {
                    amount: { type: 'range', min: 1, max: 20, value: 3 },
                },
                initialize: function () {
                    this.imageCopy = document.createElement('canvas');
                    this.imageCopyCtx = this.imageCopy.getContext('2d');
                    this.blurred = document.createElement('canvas');
                    this.blurredCtx = this.blurred.getContext('2d');
                },
                selected: async function (canvas, ctx, helpers) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.lineWidth = Math.max(1, 4 * (canvas.width / parseInt(canvas.style.width || canvas.width)));
                    ctx.lineJoin = "round";
                    ctx.lineCap = "round";
                    ctx.strokeStyle = 'white';
                    this.imageCopy.width = canvas.width;
                    this.imageCopy.height = canvas.height;
                    this.imageCopyCtx.drawImage(canvas, 0, 0);
                    const blurredCanvasImageData = await helpers.blurImage(canvas, this.settings.amount.value);
                    this.blurred.width = canvas.width;
                    this.blurred.height = canvas.height;
                    this.blurredCtx.putImageData(blurredCanvasImageData, 0, 0);
                },
                mouseDown: function (_, __, location) { this.startLoc = location; },
                mouseMove: function (_, ctx, location) {
                    ctx.drawImage(this.blurred, 0, 0);
                    const [x, y, w, h] = [this.startLoc.x, this.startLoc.y, location.x - this.startLoc.x, location.y - this.startLoc.y];
                    ctx.drawImage(this.imageCopy, x, y, w, h, x, y, w, h);
                    ctx.strokeRect(x, y, w, h);
                },
                mouseUp: function (canvas, ctx, location) {
                    ctx.drawImage(this.blurred, 0, 0);
                    const [x, y, w, h] = [this.startLoc.x, this.startLoc.y, location.x - this.startLoc.x, location.y - this.startLoc.y];
                    ctx.drawImage(this.imageCopy, x, y, w, h, x, y, w, h);
                    this.blurredCtx.drawImage(canvas, 0, 0);
                }
            }
        ];

        this.observer = new MutationObserver(m => {
            for (const mu of m) for (const n of mu.addedNodes) if (n.nodeType === 1) this.injectButton(n);
        });
        this.observer.observe(document.body, { childList: true, subtree: true });
        this.injectButton(document.body);
    }

    stop() {
        if (this.observer) this.observer.disconnect();
        document.querySelectorAll(".edit-uploads-btn").forEach(b => b.remove());
    }

    saveSettings() {
        BdApi.Data.save("EditUploadsReborn", "settings", this.settings);
    }

    getSettingsPanel() {
        if (!this.settings) {
            this.settings = Object.assign(
                {},
                this.defaultSettings,
                BdApi.Data.load("EditUploadsReborn", "settings") || {}
            );
        }

        const panel = document.createElement("div");
        panel.style.padding = "10px";
        panel.style.color = "#ddd";
        panel.style.display = "flex";
        panel.style.flexDirection = "column";
        panel.style.gap = "10px";

        const toggleWrap = document.createElement("label");
        toggleWrap.style.display = "flex";
        toggleWrap.style.alignItems = "center";
        toggleWrap.style.gap = "6px";

        const toggle = document.createElement("input");
        toggle.type = "checkbox";
        toggle.checked = this.settings.saveOnChange;
        toggle.onchange = () => {
            this.settings.saveOnChange = toggle.checked;
            this.saveSettings();
        };

        const text = document.createElement("span");
        text.innerText = "Save settings on change";

        toggleWrap.appendChild(toggle);
        toggleWrap.appendChild(text);
        panel.appendChild(toggleWrap);

        this.tools.forEach((tool) => {
            if (!tool.settings || Object.keys(tool.settings).length === 0) return;
            const section = document.createElement("div");
            section.style.border = "1px solid #444";
            section.style.padding = "8px";
            section.style.borderRadius = "6px";

            const title = document.createElement("div");
            title.style.fontWeight = "bold";
            title.style.marginBottom = "6px";
            title.innerText = tool.name;
            section.appendChild(title);

            Object.entries(tool.settings).forEach(([optKey, optConf]) => {
                const wrap = document.createElement("div");
                wrap.style.display = "flex";
                wrap.style.flexDirection = "column";
                wrap.style.marginBottom = "6px";

                const caption = document.createElement("span");
                caption.innerText = optKey;
                caption.style.marginBottom = "4px";
                wrap.appendChild(caption);

                const globalVal = this.settings.tools?.[tool.name]?.[optKey];

                if (optConf.type === "range") {
                    const min = optConf.min;
                    const max = optConf.max;
                    const value = globalVal ?? optConf.value;

                    const controls = document.createElement("div");
                    controls.style.display = "flex";
                    controls.style.alignItems = "center";
                    controls.style.gap = "6px";

                    const range = document.createElement("input");
                    range.type = "range";
                    range.min = min;
                    range.max = max;
                    range.value = value;

                    const number = document.createElement("input");
                    number.type = "number";
                    number.min = min;
                    number.max = max;
                    number.value = value;
                    number.style.width = "60px";

                    const suffix = document.createElement("span");
                    suffix.innerText = "px";
                    suffix.style.minWidth = "20px";
                    suffix.style.textAlign = "left";

                    const updateValue = (v) => {
                        let num = Number(v);
                        if (num < min) num = min;
                        if (num > max) num = max;
                        range.value = num;
                        number.value = num;

                        if (!this.settings.tools[tool.name]) this.settings.tools[tool.name] = {};
                        this.settings.tools[tool.name][optKey] = num;
                        this.saveSettings();
                    };

                    range.oninput = () => updateValue(range.value);
                    number.oninput = () => updateValue(number.value);

                    controls.appendChild(range);
                    controls.appendChild(number);
                    controls.appendChild(suffix);
                    wrap.appendChild(controls);
                } else if (optConf.type === "color") {
                    const value = globalVal ?? optConf.value;
                    const input = document.createElement("input");
                    input.type = "color";
                    input.value = value;
                    input.oninput = () => {
                        if (!this.settings.tools[tool.name]) this.settings.tools[tool.name] = {};
                        this.settings.tools[tool.name][optKey] = input.value;
                        this.saveSettings();
                    };
                    wrap.appendChild(input);
                }

                section.appendChild(wrap);
            });

            panel.appendChild(section);
        });

        return panel;
    }


    injectButton(root) {
        root.querySelectorAll(".actionBarContainer_aa605f").forEach(container => {
            if (container.querySelector(".edit-uploads-btn")) return;
            const btn = document.createElement("div");
            btn.className = "button_f7ecac edit-uploads-btn";
            btn.setAttribute("role", "button");
            btn.setAttribute("aria-label", "Редактировать изображение");
            btn.innerText = "🖌️";
            btn.style.cursor = "pointer";
            btn.style.display = "flex";
            btn.style.alignItems = "center";
            btn.style.justifyContent = "center";
            btn.style.fontSize = "14px";
            btn.style.marginLeft = "4px";
            btn.onclick = e => {
                e.stopPropagation();
                const uploadContainer = container.closest(".uploadContainer_aa605f");
                this.openEditModal(container, uploadContainer);
            };
            container.querySelector(".wrapper_f7ecac")?.appendChild(btn);
        });
    }

    guessFilenameFromUrl(url) {
        try {
            if (!url) return null;
            if (url.startsWith('data:')) return null;
            const u = new URL(url, location.href);
            const p = u.pathname.split('/').pop() || '';
            return decodeURIComponent(p.split('?')[0]) || null;
        } catch (e) {
            return null;
        }
    }

    parseDataUrlMime(dataUrl) {
        const m = /^data:([^;]+);base64,/.exec(dataUrl || '');
        return m ? m[1] : null;
    }

    getExtFromMime(mime) {
        if (!mime) return null;
        const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'video/mp4': 'mp4', 'application/pdf': 'pdf', 'image/webp': 'webp' };
        return map[mime] || mime.split('/').pop();
    }

    sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    getUploadInfo(upload) {
        if (!upload) return { src: null, filename: null, type: null };
        const link = upload.querySelector('a[download]');
        if (link) {
            const href = link.href;
            const filename = link.getAttribute('download') || this.guessFilenameFromUrl(href);
            return { src: href, filename, type: null };
        }
        const filenameEl = upload.querySelector('[class*="fileName"], [class*="file-name"], [class*="filename"], [class*="name"]');
        if (filenameEl && filenameEl.textContent && filenameEl.textContent.trim()) {
            const text = filenameEl.textContent.trim();
            const media = upload.querySelector('img, video, source, a[href]');
            const src = (media && (media.src || media.href)) || null;
            return { src, filename: text, type: null };
        }
        const img = upload.querySelector('img');
        if (img) {
            const filename = img.alt || img.getAttribute('aria-label') || this.guessFilenameFromUrl(img.src) || null;
            return { src: img.src, filename, type: null };
        }
        const video = upload.querySelector('video');
        if (video) {
            const source = video.querySelector('source');
            const src = source?.src || video.src || null;
            const filename = this.guessFilenameFromUrl(src);
            return { src, filename, type: null };
        }
        const anyA = upload.querySelector('a[href]');
        if (anyA) {
            const href = anyA.href;
            const filename = anyA.getAttribute('download') || anyA.textContent.trim() || this.guessFilenameFromUrl(href);
            return { src: href, filename, type: null };
        }
        const dsName = upload.dataset && (upload.dataset.filename || upload.dataset.name || upload.dataset.fileName);
        if (dsName) {
            const media = upload.querySelector('img, video, source, a[href]');
            const src = (media && (media.src || media.href)) || null;
            return { src, filename: dsName, type: null };
        }
        return { src: null, filename: null, type: null };
    }

    blurImage(canvas, amount) {
        const px = Math.max(1, Math.min(40, amount * 2));
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width;
        tmp.height = canvas.height;
        const tctx = tmp.getContext('2d');
        if (tctx.filter !== undefined) {
            tctx.filter = `blur(${px}px)`;
            tctx.drawImage(canvas, 0, 0);
            tctx.filter = 'none';
            return tctx.getImageData(0, 0, canvas.width, canvas.height);
        } else {
            const steps = Math.max(1, Math.floor(px / 4));
            tctx.globalAlpha = 0.5;
            for (let i = 0; i < steps; i++) tctx.drawImage(canvas, 0, 0);
            tctx.globalAlpha = 1;
            return tctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    }

    fitCanvas(canvas, container) {
        const maxW = Math.min(container.clientWidth * 0.9, window.innerWidth * 0.9);
        canvas.style.width = Math.min(maxW, canvas.width) + 'px';
        const wpx = parseFloat(canvas.style.width);
        if (wpx && canvas.width) {
            canvas.style.height = (canvas.height * (wpx / canvas.width)) + 'px';
        } else {
            canvas.style.height = canvas.height + 'px';
        }
    }

    async openEditModal(container, currentUpload) {
        const img = currentUpload?.querySelector("img");
        if (!img) return;

        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100vw";
        modal.style.height = "100vh";
        modal.style.background = "rgba(0,0,0,0.7)";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = "9999";

        const editor = document.createElement("div");
        editor.style.background = "#2f3136";
        editor.style.padding = "16px";
        editor.style.borderRadius = "10px";
        editor.style.display = "flex";
        editor.style.flexDirection = "column";
        editor.style.gap = "10px";
        editor.style.maxWidth = "92vw";
        editor.style.maxHeight = "92vh";
        editor.style.overflow = "auto";

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = img.src;
        await new Promise(res => { image.onload = res; });

        const canvasWrap = document.createElement('div');
        canvasWrap.style.position = 'relative';
        canvasWrap.style.display = 'inline-block';
        canvasWrap.style.maxWidth = '80vw';
        canvasWrap.style.maxHeight = '70vh';
        canvasWrap.style.overflow = 'auto';

        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.style.width = Math.min(image.width, window.innerWidth * 0.6) + "px";
        canvas.style.height = (canvas.height * (parseFloat(canvas.style.width) / canvas.width || 1)) + "px";

        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        canvasWrap.appendChild(canvas);
        editor.appendChild(canvasWrap);

        const helpers = {
            getCoords: (e, cvs) => {
                const rect = cvs.getBoundingClientRect();
                const scaleX = cvs.width / rect.width;
                const scaleY = cvs.height / rect.height;
                return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
            },
            blurImage: (cvs, amount) => this.blurImage(cvs, amount),
            fitCanvas: (cvs, parent) => this.fitCanvas(cvs, parent)
        };

        const toolsArea = document.createElement('div');
        toolsArea.style.display = 'flex';
        toolsArea.style.gap = '12px';
        toolsArea.style.marginTop = '8px';
        toolsArea.style.alignItems = 'flex-start';

        const leftToolsColumn = document.createElement('div');
        leftToolsColumn.style.display = 'flex';
        leftToolsColumn.style.flexDirection = 'column';
        leftToolsColumn.style.gap = '8px';
        leftToolsColumn.style.minWidth = '120px';

        const mainToolsPanel = document.createElement('div');
        mainToolsPanel.style.display = 'flex';
        mainToolsPanel.style.gap = '6px';
        mainToolsPanel.style.alignItems = 'center';

        const shapesPanel = document.createElement('div');
        shapesPanel.style.display = 'flex';
        shapesPanel.style.gap = '6px';
        shapesPanel.style.alignItems = 'center';

        const blurPanel = document.createElement('div');
        blurPanel.style.display = 'flex';
        blurPanel.style.gap = '6px';
        blurPanel.style.alignItems = 'center';

        leftToolsColumn.appendChild(mainToolsPanel);
        leftToolsColumn.appendChild(shapesPanel);
        leftToolsColumn.appendChild(blurPanel);

        toolsArea.appendChild(leftToolsColumn);
        editor.appendChild(toolsArea);

        const settingsPanel = document.createElement('div');
        settingsPanel.style.display = 'flex';
        settingsPanel.style.gap = '6px';
        settingsPanel.style.alignItems = 'center';
        settingsPanel.style.minHeight = '80px';
        settingsPanel.style.flexDirection = 'column';
        settingsPanel.style.alignItems = 'flex-start';
        editor.appendChild(settingsPanel);

        const undoBtn = document.createElement('button');
        undoBtn.title = 'Undo (Ctrl+Z)';
        undoBtn.innerText = this.icons.undo;
        undoBtn.style.padding = '6px';
        undoBtn.disabled = true;

        const redoBtn = document.createElement('button');
        redoBtn.title = 'Redo (Ctrl+Alt+Z)';
        redoBtn.innerText = this.icons.redo;
        redoBtn.style.padding = '6px';
        redoBtn.disabled = true;

        const history = [];
        let historyIndex = -1;
        const MAX_HISTORY = 50;

        const pushHistory = async () => {
            if (historyIndex < history.length - 1) history.splice(historyIndex + 1);
            try {
                const dataUrl = canvas.toDataURL('image/png');
                const styleWidth = canvas.style.width || (canvas.width + 'px');
                const styleHeight = canvas.style.height || (canvas.height + 'px');
                history.push({
                    dataUrl,
                    width: canvas.width,
                    height: canvas.height,
                    styleWidth,
                    styleHeight
                });
                if (history.length > MAX_HISTORY) history.shift();
                historyIndex = history.length - 1;
            } catch (e) {
                console.warn('history push failed', e);
            }
            updateUndoRedo();
        };

        const restoreHistory = async (idx) => {
            if (idx < 0 || idx >= history.length) return;
            const state = history[idx];
            const imgState = new Image();
            imgState.src = state.dataUrl;
            await new Promise(r => imgState.onload = r);

            canvas.width = state.width;
            canvas.height = state.height;
            ctx = canvas.getContext('2d');
            ctx.drawImage(imgState, 0, 0);

            if (state.styleWidth || state.styleHeight) {
                if (state.styleWidth) canvas.style.width = state.styleWidth;
                if (state.styleHeight) canvas.style.height = state.styleHeight;
            } else {
                helpers.fitCanvas(canvas, canvas.parentNode);
            }

            historyIndex = idx;

            if (activeTool && activeTool.instance && typeof activeTool.instance.selected === 'function') {
                activeTool.instance.selected(canvas, ctx, helpers);
            }
            updateUndoRedo();
        };

        const undo = async () => {
            if (historyIndex > 0) await restoreHistory(historyIndex - 1);
        };
        const redo = async () => {
            if (historyIndex < history.length - 1) await restoreHistory(historyIndex + 1);
        };
        const updateUndoRedo = () => {
            undoBtn.disabled = !(historyIndex > 0);
            redoBtn.disabled = !(historyIndex < history.length - 1);
        };

        await pushHistory();

        let activeTool = null;

        const toolButtons = [];
        this.tools.forEach((t) => {
            const btn = document.createElement('button');
            btn.title = t.name;
            btn.innerText = (t.icon ? t.icon + ' ' : '') + t.name;
            btn.style.padding = '6px';
            btn.style.cursor = 'pointer';

            if (t.category === 'main') mainToolsPanel.appendChild(btn);
            else if (t.category === 'shapes') shapesPanel.appendChild(btn);
            else if (t.category === 'blur') blurPanel.appendChild(btn);
            else mainToolsPanel.appendChild(btn);

            btn.addEventListener('click', () => {
                selectTool(t, btn);
            });

            toolButtons.push({ tool: t, btn });
        });

        const selectTool = (t, btn) => {
            if (activeTool && activeTool.btn) activeTool.btn.style.boxShadow = '';
            const inst = Object.assign({}, t);
            inst.settings = JSON.parse(JSON.stringify(t.settings || {}));
            for (const k in inst.settings) {
                if (inst.settings[k].type === 'range' && inst.settings[k].value === undefined)
                    inst.settings[k].value = inst.settings[k].default || 1;
            }

            if (this.settings && this.settings.tools && this.settings.tools[t.name]) {
                const defaults = this.settings.tools[t.name];
                for (const key in inst.settings) {
                    if (defaults[key] !== undefined) {
                        inst.settings[key].value = defaults[key];
                    }
                }
            }

            if (typeof inst.initialize === 'function') inst.initialize(canvas, ctx, this.tools);
            if (typeof inst.selected === 'function') inst.selected(canvas, ctx, helpers);
            activeTool = { tool: t, btn, instance: inst };

            btn.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.08) inset';

            settingsPanel.innerHTML = '';
            for (const key in inst.settings) {
                const s = inst.settings[key];
                if (s.type === 'range') {
                    const wrap = document.createElement('label');
                    wrap.style.display = 'flex';
                    wrap.style.flexDirection = 'column';
                    wrap.style.fontSize = '12px';
                    wrap.style.color = '#ddd';
                    wrap.innerText = key;

                    const controls = document.createElement('div');
                    controls.style.display = 'flex';
                    controls.style.alignItems = 'center';
                    controls.style.gap = '6px';

                    const input = document.createElement('input');
                    input.type = 'range';
                    input.min = s.min;
                    input.max = s.max;
                    input.value = s.value;

                    const number = document.createElement('input');
                    number.type = 'number';
                    number.min = s.min;
                    number.max = s.max;
                    number.value = s.value;
                    number.style.width = '60px';

                    const suffix = document.createElement("span");
                    suffix.innerText = "px";
                    suffix.style.minWidth = "20px";
                    suffix.style.textAlign = "left";

                    const updateValue = (val) => {
                        s.value = Number(val);
                        input.value = s.value;
                        number.value = s.value;
                        if (typeof inst.selected === 'function') inst.selected(canvas, ctx, helpers);

                        if (this.settings && this.settings.saveOnChange) {
                            if (!this.settings.tools[t.name]) this.settings.tools[t.name] = {};
                            this.settings.tools[t.name][key] = s.value;
                            this.saveSettings();
                        }
                    };

                    input.oninput = () => updateValue(input.value);
                    number.oninput = () => updateValue(number.value);

                    controls.appendChild(input);
                    controls.appendChild(number);
                    controls.appendChild(suffix);
                    wrap.appendChild(controls);
                    settingsPanel.appendChild(wrap);
                } else if (s.type === 'color') {
                    const wrap = document.createElement('label');
                    wrap.style.display = 'flex';
                    wrap.style.flexDirection = 'column';
                    wrap.style.fontSize = '12px';
                    wrap.style.color = '#ddd';
                    wrap.innerText = key;
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = s.value;
                    input.oninput = () => {
                        s.value = input.value;
                        if (typeof inst.selected === 'function') inst.selected(canvas, ctx, helpers);

                        if (this.settings && this.settings.saveOnChange) {
                            if (!this.settings.tools[t.name]) this.settings.tools[t.name] = {};
                            this.settings.tools[t.name][key] = s.value;
                            this.saveSettings();
                        }
                    };
                    wrap.appendChild(input);
                    settingsPanel.appendChild(wrap);
                }
            }
        };


        const defaultBtnObj = toolButtons.find(tb => tb.tool.name === 'draw') || toolButtons[0];
        if (defaultBtnObj) defaultBtnObj.btn.click();

        let isDrawing = false;
        let changedSinceDown = false;

        const getLocationFromEvent = (e) => helpers.getCoords(e, canvas);

        const onMouseDown = (e) => {
            if (!activeTool || !activeTool.instance) return;
            isDrawing = true;
            changedSinceDown = false;
            const loc = getLocationFromEvent(e);
            if (typeof activeTool.instance.mouseDown === 'function') activeTool.instance.mouseDown(canvas, ctx, loc);
        };

        const onMouseMove = (e) => {
            if (!activeTool || !activeTool.instance) return;
            if (!isDrawing) return;
            changedSinceDown = true;
            const loc = getLocationFromEvent(e);
            if (typeof activeTool.instance.mouseMove === 'function') activeTool.instance.mouseMove(canvas, ctx, loc, e);
        };

        const onMouseUp = async (e) => {
            if (!activeTool || !activeTool.instance) return;
            if (!isDrawing) return;
            isDrawing = false;
            const loc = getLocationFromEvent(e);
            if (typeof activeTool.instance.mouseUp === 'function') activeTool.instance.mouseUp(canvas, ctx, loc, helpers, e);
            if (changedSinceDown) await pushHistory();
        };

        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        undoBtn.onclick = async () => { await undo(); };
        redoBtn.onclick = async () => { await redo(); };

        const onKeyDown = async (e) => {
            if (e.code === 'KeyZ' && e.ctrlKey && !e.altKey) {
                e.preventDefault();
                await undo();
                return;
            }
            if (e.code === 'KeyZ' && e.ctrlKey && e.altKey) {
                e.preventDefault();
                await redo();
                return;
            }
        };
        window.addEventListener('keydown', onKeyDown);

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'space-between';
        actions.style.marginTop = '8px';
        actions.style.gap = '8px';

        const leftActions = document.createElement('div');
        leftActions.style.display = 'flex';
        leftActions.style.gap = '8px';
        leftActions.appendChild(undoBtn);
        leftActions.appendChild(redoBtn);

        const saveBtn = document.createElement('button');
        saveBtn.innerText = "💾 Save";
        saveBtn.style.padding = '8px 12px';
        saveBtn.onclick = async () => {
            try {
                const merged = document.createElement('canvas');
                merged.width = canvas.width;
                merged.height = canvas.height;
                const mctx = merged.getContext('2d');
                mctx.drawImage(canvas, 0, 0);

                const currentInfo = this.getUploadInfo(currentUpload);
                let originalMime = null;
                if (currentInfo.src) {
                    try {
                        const resp = await fetch(currentInfo.src);
                        const b = await resp.blob();
                        if (b && b.type && b.type.startsWith('image/')) originalMime = b.type;
                    } catch (e) {}
                } else {
                    const dataMime = this.parseDataUrlMime(img.src);
                    if (dataMime && dataMime.startsWith('image/')) originalMime = dataMime;
                }
                const targetType = originalMime && originalMime.startsWith('image/') ? originalMime : 'image/png';
                const blob = await new Promise(res => merged.toBlob(res, targetType));
                const ext = this.getExtFromMime(targetType) || 'png';

                let newFileName = currentInfo.filename ? currentInfo.filename : `edited.${ext}`;
                if (currentInfo.filename) {
                    const parts = currentInfo.filename.split('.');
                    if (parts.length > 1) {
                        parts[parts.length - 1] = ext;
                        newFileName = parts.join('.');
                    }
                }
                const newFile = new File([blob], newFileName, { type: blob.type || targetType });

                const allUploads = [...document.querySelectorAll(".uploadContainer_aa605f")];
                const files = [];
                const uploadsToRemove = [];
                const skipped = [];

                for (const upload of allUploads) {
                    const info = this.getUploadInfo(upload);

                    if (upload === currentUpload) {
                        files.push(newFile);
                        uploadsToRemove.push(upload);
                        continue;
                    }

                    if (info.src) {
                        try {
                            const resp = await fetch(info.src);
                            const b = await resp.blob();
                            const filename = info.filename || this.guessFilenameFromUrl(info.src) || `file.${this.getExtFromMime(b.type) || 'bin'}`;
                            files.push(new File([b], filename, { type: b.type || 'application/octet-stream' }));
                            uploadsToRemove.push(upload);
                            continue;
                        } catch (e) {}
                    }

                    skipped.push(info.filename || this.guessFilenameFromUrl(info.src) || 'unknown');
                }

                for (const u of uploadsToRemove) {
                    const removeBtn = u.querySelector(".button_f7ecac.dangerous_f7ecac");
                    if (removeBtn) removeBtn.click();
                }

                await this.sleep(150);

                const fileInput = [...document.querySelectorAll('input[type="file"]')].find(i => i.offsetParent !== null) ||
                                  document.querySelector('input[type="file"]');

                if (fileInput && files.length) {
                    const dt = new DataTransfer();
                    for (const f of files) dt.items.add(f);
                    try {
                        fileInput.files = dt.files;
                        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    } catch (e) {
                        const pasteDT = new DataTransfer();
                        for (const f of files) pasteDT.items.add(f);
                        const pasteEvent = new ClipboardEvent("paste", { clipboardData: pasteDT, bubbles: true, cancelable: true });
                        const inputEl = document.querySelector("div[role=textbox][contenteditable=true]");
                        if (inputEl) inputEl.dispatchEvent(pasteEvent);
                        else throw new Error("No target to insert files");
                    }
                } else if (files.length) {
                    const pasteDT = new DataTransfer();
                    for (const f of files) pasteDT.items.add(f);
                    const pasteEvent = new ClipboardEvent("paste", { clipboardData: pasteDT, bubbles: true, cancelable: true });
                    const inputEl = document.querySelector("div[role=textbox][contenteditable=true]");
                    if (inputEl) inputEl.dispatchEvent(pasteEvent);
                    else throw new Error("No target to insert files");
                }

                if (skipped.length) {
                    BdApi.alert("Attention", "Upload order may change");
                }

                cleanupAndClose();
            } catch (err) {
                console.error(err);
                BdApi.alert("Error", "An error occurred during processing.");
            }
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = "❌ Cancel";
        cancelBtn.style.padding = '8px 12px';
        cancelBtn.onclick = () => cleanupAndClose();

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" || e.code === "Escape" || e.keyCode === 27) {
                e.preventDefault();
                cleanupAndClose();
            }
        });

        const rightActions = document.createElement('div');
        rightActions.style.display = 'flex';
        rightActions.style.gap = '8px';
        rightActions.appendChild(saveBtn);
        rightActions.appendChild(cancelBtn);

        actions.appendChild(leftActions);
        actions.appendChild(rightActions);
        editor.appendChild(actions);

        modal.appendChild(editor);
        document.body.appendChild(modal);
        
        const cleanupAndClose = () => {
            try {
                canvas.removeEventListener('mousedown', onMouseDown);
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                window.removeEventListener('keydown', onKeyDown);
            } catch (e) {}
            try { document.body.removeChild(modal); } catch (e) {}
        };
    }
};
