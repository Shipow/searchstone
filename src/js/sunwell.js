/**
 * Sunwell
 * =======
 * Sunwell is a renderer for hearthstone cards.
 *
 * @author Christian Engel <hello@wearekiss.com>
 */

(function () {
    'use strict';

    var sunwell,
        assets = {},
        ready = false,
        renderQuery = [],
        maxRendering = 12,
        rendering = 0,
        renderCache = {},
        buffers = [],
        pluralRegex = /(\d+)(.+?)\|4\((.+?),(.+?)\)/g,
        validRarity = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

    function log(msg) {
        if (!sunwell.settings.debug) {
            return;
        }
        console.log(msg);
    }

    /**
     * Returns a new render buffer (canvas).
     * @returns {*}
     */
    function getBuffer() {
        if (buffers.length) {
            return buffers.pop();
        }
        return document.createElement('canvas');
    }

    /**
     * Makes a new render buffer available for recycling.
     * @param buffer
     */
    function freeBuffer(buffer) {
        buffers.push(buffer);
    }

    var imgReplacement;

    function getMissingImg(assetId) {
        log('Substitute for ' + assetId);

        if (imgReplacement) {
            return imgReplacement;
        }

        var buffer = getBuffer(),
            bufferctx = buffer.getContext('2d');
        buffer.width = buffer.height = 512;
        bufferctx.save();
        bufferctx.fillStyle = 'grey';
        bufferctx.fillRect(0, 0, 512, 512);
        bufferctx.fill();
        bufferctx.fillStyle = 'red';
        bufferctx.textAlign = 'center';
        bufferctx.textBaseline = 'middle';
        bufferctx.font = '50px Belwe';
        bufferctx.fillText('missing artwork', 256, 256);
        bufferctx.restore();
        imgReplacement = new Image();
        imgReplacement.src = buffer.toDataURL();
        return imgReplacement;
    }

    function getAsset(id) {
        return assets[id] || getMissingImg(id);
    }

    window.sunwell = sunwell = window.sunwell || {};

    sunwell._buffers = buffers;
    sunwell._renderQuery = renderQuery;
    sunwell._activeRenders = rendering;

    sunwell.settings = sunwell.settings || {};

    sunwell.settings.titleFont = sunwell.settings.titleFont || 'Belwe Bold';
    sunwell.settings.bodyFont = sunwell.settings.bodyFont || 'ITC Franklin Condensed';
    sunwell.settings.bodyFontSize = sunwell.settings.bodyFontSize || 60;
    sunwell.settings.bodyFontOffset = sunwell.settings.bodyFontOffset || {x: 0, y: 0};
    sunwell.settings.bodyLineHeight = sunwell.settings.bodyLineHeight || 50;
    sunwell.settings.assetFolder = sunwell.settings.assetFolder || '/assets/';
    sunwell.settings.textureFolder = sunwell.settings.textureFolder || '/artwork/';
    sunwell.settings.smallTextureFolder = sunwell.settings.smallTextureFolder || null;
    sunwell.settings.autoInit = sunwell.settings.autoInit || true;
    sunwell.settings.idAsTexture = sunwell.settings.idAsTexture || false;


    sunwell.settings.debug = sunwell.settings.debug || false;

    sunwell.init = function () {
        ready = true;
        if (renderQuery.length) {
            renderTick();
        }
    };
    if (!sunwell.settings.autoInit) {
        sunwell.init();
    }

    /**
     * Calculate the checksum for an object.
     * @param o
     * @returns {number}
     */
    function checksum(o) {
        var i, key, s = '';
        var chk = 0x12345678;

        for (key in o) {
            s = s + key + o[key];
        }

        for (i = 0; i < s.length; i++) {
            chk += (s.charCodeAt(i) * (i + 1));
        }

        return chk;
    }

    /**
     * Helper function to draw the oval mask for the cards artwork.
     * @param ctx
     * @param x
     * @param y
     * @param w
     * @param h
     */
    function drawEllipse(ctx, x, y, w, h) {
        var kappa = 0.5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        //ctx.closePath(); // not used correctly, see comments (use to close off open path)
        ctx.stroke();
    }

    /**
     * Preloads the basic card assets.
     * You can call this before you start to render any cards, but you don't have to.
     */
    function fetchAssets(loadAssets) {
        return new Promise(function (resolve) {
            var loaded = 0,
                loadingTotal = 1,
                result = {},
                key,
                isTexture,
                smallTexture,
                isUrl,
                srcURL;

            for (var i = 0; i < loadAssets.length; i++) {
                key = loadAssets[i];
                isTexture = false;
                smallTexture = false;

                if (key.substr(0, 2) === 'h:') {
                    isTexture = true;
                    smallTexture = !!(sunwell.settings.smallTextureFolder && true);
                    key = key.substr(2);
                }

                if (key.substr(0, 2) === 't:') {
                    isTexture = true;
                    key = key.substr(2);
                    if (assets[key] !== undefined) {
                        if (assets[key].width === 256) {
                            assets[key] = undefined;
                        }
                    }
                }

                if (key.substr(0, 2) === 'u:') {
                    isUrl = true;
                    key = key.substr(2);
                }

                if (assets[key] === undefined) {
                    assets[key] = new Image();
                    assets[key].crossOrigin = "Anonymous";
                    assets[key].loaded = false;
                    loadingTotal++;
                    (function (key) {
                        assets[key].addEventListener('load', function () {
                            loaded++;
                            assets[key].loaded = true;
                            result[key] = assets[key];
                            if (!assets[key].width || !assets[key].height) {
                                assets[key].src = getMissingImg().src;
                            }
                            if (loaded >= loadingTotal) {
                                resolve(result);
                            }
                        });
                        assets[key].addEventListener('error', function () {
                            loaded++;

                            assets[key].src = getMissingImg().src;
                            assets[key].loaded = true;
                            result[key] = assets[key];
                            if (loaded >= loadingTotal) {
                                resolve(result);
                            }
                        });
                    })(key);
                    if (isUrl) {
                        assets[key].src = key;
                    } else {
                        if (isTexture) {
                            assets[key].isTexture = true;
                            if (smallTexture) {
                                srcURL = sunwell.settings.smallTextureFolder + key + '.jpg';
                            } else {
                                srcURL = sunwell.settings.textureFolder + key + '.jpg';
                            }
                        } else {
                            srcURL = sunwell.settings.assetFolder + key + '.png';
                        }
                        log('Requesting ' + srcURL);
                        assets[key].src = srcURL;
                    }
                } else {
                    loadingTotal++;
                    if (assets[key].loaded) {
                        loaded++;
                        result[key] = assets[key];
                    } else {
                        (function (key) {
                            assets[key].addEventListener('load', function () {
                                loaded++;
                                result[key] = assets[key];
                                if (loaded >= loadingTotal) {
                                    resolve(result);
                                }
                            });
                        })(key);
                    }
                }
            }

            loadingTotal--;
            if (loaded > 0 && loaded >= loadingTotal) {
                resolve(result);
            }
        });
    }

    /**
     * Get the bounding box of a canvas' content.
     * @param ctx
     * @param alphaThreshold
     * @returns {{x: *, y: *, maxX: (number|*|w), maxY: *, w: number, h: number}}
     */
    function contextBoundingBox(ctx) {
        var w = ctx.canvas.width, h = ctx.canvas.height;
        var data = ctx.getImageData(0, 0, w, h).data;
        var x, y, minX = 999, minY = 999, maxX = 0, maxY = 0;

        var out = false;

        for (y = h - 1; y > -1; y--) {
            if (out) {
                break;
            }
            for (x = 0; x < w; x++) {
                if (data[((y * (w * 4)) + (x * 4)) + 3] > 0) {
                    maxY = Math.max(maxY, y);
                    out = true;
                    break;
                }
            }
        }

        if (maxY === undefined) {
            return null;
        }

        out2:
            for (x = w - 1; x > -1; x--) {
                for (y = 0; y < h; y++) {
                    if (data[((y * (w * 4)) + (x * 4)) + 3] > 0) {
                        maxX = Math.max(maxX, x);
                        break out2;
                    }
                }
            }

        out3:
            for (x = 0; x < maxX; x++) {
                for (y = 0; y < h; y++) {
                    if (data[((y * (w * 4)) + (x * 4)) + 3] > 0) {
                        minX = Math.min(x, minX);
                        break out3;
                    }
                }
            }

        out4:
            for (y = 0; y < maxY; y++) {
                for (x = 0; x < w; x++) {
                    if (data[((y * (w * 4)) + (x * 4)) + 3] > 0) {
                        minY = Math.min(minY, y);
                        break out4;
                    }
                }
            }

        return {x: minX, y: minY, maxX: maxX, maxY: maxY, w: maxX - minX, h: maxY - minY};
    }

    /**
     * Renders a given number to the defined position.
     * The x/y position should be the position on an unscaled card.
     *
     * @param targetCtx
     * @param x
     * @param y
     * @param s
     * @param number
     * @param size
     * @param [drawStyle="0"] Either "+", "-" or "0". Default: "0"
     */
    function drawNumber(targetCtx, x, y, s, number, size, drawStyle) {
        var buffer = getBuffer();
        var bufferCtx = buffer.getContext('2d');

        if (drawStyle === undefined) {
            drawStyle = '0';
        }

        buffer.width = 256;
        buffer.height = 256;

        number = number.toString();

        number = number.split('');

        var tX = 10;

        bufferCtx.font = size + 'px Belwe';

        bufferCtx.lineCap = 'round';
        bufferCtx.lineJoin = 'round';
        bufferCtx.textBaseline = 'hanging';

        bufferCtx.textAlign = 'left';

        var color = 'white';

        if (drawStyle === '-') {
            color = '#f00';
        }

        if (drawStyle === '+') {
            color = '#0f0';
        }

        for (var i = 0; i < number.length; i++) {
            bufferCtx.lineWidth = 13;
            bufferCtx.strokeStyle = 'black';
            bufferCtx.fillStyle = 'black';
            bufferCtx.fillText(number[i], tX, 10);
            bufferCtx.strokeText(number[i], tX, 10);

            bufferCtx.fillStyle = color;
            bufferCtx.strokeStyle = color;
            bufferCtx.lineWidth = 2.5;
            bufferCtx.fillText(number[i], tX, 10);
            //ctx.strokeText(text[i], x, y);

            tX += bufferCtx.measureText(number[i]).width;
        }

        var b = contextBoundingBox(bufferCtx);

        targetCtx.drawImage(buffer, b.x, b.y, b.w, b.h, (x - (b.w / 2)) * s, (y - (b.h / 2)) * s, b.w * s, b.h * s);

        freeBuffer(buffer);
    }

    /**
     * Finishes a text line and starts a new one.
     * @param bufferTextCtx
     * @param bufferRow
     * @param bufferRowCtx
     * @param xPos
     * @param yPos
     * @param totalWidth
     * @returns {*[]}
     */
    function finishLine(bufferTextCtx, bufferRow, bufferRowCtx, xPos, yPos, totalWidth) {
        if (sunwell.settings.debug) {
            bufferTextCtx.save();
            bufferTextCtx.strokeStyle = 'red';
            bufferTextCtx.beginPath();
            bufferTextCtx.moveTo((totalWidth / 2) - (xPos / 2), yPos);
            bufferTextCtx.lineTo((totalWidth / 2) + (xPos / 2), yPos);
            bufferTextCtx.stroke();
            bufferTextCtx.restore();
        }

        var xCalc = (totalWidth / 2) - (xPos / 2);

        if (xCalc < 0) {
            xCalc = 0;
        }

        if (xPos > 0 && bufferRow.width > 0) {
            bufferTextCtx.drawImage(
                bufferRow,
                0,
                0,
                xPos > bufferRow.width ? bufferRow.width : xPos,
                bufferRow.height,
                xCalc,
                yPos,
                Math.min(xPos, bufferRow.width),
                bufferRow.height
            );
        }

        xPos = 5;
        yPos += bufferRow.height;
        bufferRowCtx.clearRect(0, 0, bufferRow.width, bufferRow.height);

        return [xPos, yPos];
    }


    function draw(cvs, ctx, card, s, callback, internalCB) {

        var sw = card.sunwell,
            t,
            drawTimeout,
            drawProgress = 0,
            renderStart = Date.now();

        drawTimeout = setTimeout(function () {
            log('Drawing timeout at point ' + drawProgress + ' in ' + card.title);
            log(card);
            internalCB();
            if (callback) {
                callback(cvs);
            }
        }, 5000);

        if (typeof card.texture === 'string') {
            t = getAsset(card.texture);
        } else {
            if (card.texture instanceof Image) {
                t = card.texture;
            } else {
                t = getBuffer();
                t.width = card.texture.crop.w;
                t.height = card.texture.crop.h;
                (function () {
                    var tCtx = t.getContext('2d');
                    tCtx.drawImage(card.texture.image, card.texture.crop.x, card.texture.crop.y, card.texture.crop.w, card.texture.crop.h, 0, 0, t.width, t.height);
                })();
            }
        }

        if (!t) {
            t = getAsset('~');
        }

        drawProgress = 2;

        ctx.save();
        ctx.clearRect(0, 0, cvs.width, cvs.height);

        drawProgress = 3;

        ctx.save();
        if (card.type === 'MINION') {
            drawEllipse(ctx, 180 * s, 75 * s, 430 * s, 590 * s);
            ctx.clip();
            ctx.fillStyle = 'grey';
            ctx.fillRect(0, 0, 765 * s, 1100 * s);
            ctx.drawImage(t, 0, 0, t.width, t.height, 100 * s, 75 * s, 590 * s, 590 * s);
        }

        if (card.type === 'SPELL') {
            ctx.rect(125 * s, 165 * s, 529 * s, 434 * s);
            ctx.clip();
            ctx.fillStyle = 'grey';
            ctx.fillRect(0, 0, 765 * s, 1100 * s);
            ctx.drawImage(t, 0, 0, t.width, t.height, 125 * s, 117 * s, 529 * s, 529 * s);
        }

        if (card.type === 'WEAPON') {
            drawEllipse(ctx, 150 * s, 135 * s, 476 * s, 468 * s);
            ctx.clip();
            ctx.fillStyle = 'grey';
            ctx.fillRect(0, 0, 765 * s, 1100 * s);
            ctx.drawImage(t, 0, 0, t.width, t.height, 150 * s, 135 * s, 476 * s, 476 * s);
        }
        ctx.restore();

        drawProgress = 4;

        ctx.drawImage(getAsset(sw.cardBack), 0, 0, 764, 1100, 0, 0, cvs.width, cvs.height);

        drawProgress = 5;

        if (card.multiClassGroup && card.type === "MINION") {
          ctx.drawImage(getAsset(sw.multiBanner), 0, 0, 184, 369, 17 * s, 88 * s, 184 * s, 369 * s);
        }

        if(card.costHealth){
            ctx.drawImage(getAsset('health'), 0, 0, 167, 218, 24 * s, 62 * s, 167 * s, 218 * s);
            ctx.save();
            ctx.shadowBlur=50*s;
            ctx.shadowColor='#FF7275';
            ctx.shadowOffsetX = 1000;
            ctx.globalAlpha = 0.5;
            ctx.drawImage(getAsset('health'), 0, 0, 167, 218, (24 * s)-1000, 62 * s, 167 * s, 218 * s);
            ctx.restore();
        } else {
            ctx.drawImage(getAsset('gem'), 0, 0, 182, 180, 24 * s, 82 * s, 182 * s, 180 * s);
        }

        drawProgress = 6;

        if (card.type === 'MINION') {
            if (sw.rarity) {
                ctx.drawImage(getAsset(sw.rarity), 0, 0, 146, 146, 326 * s, 607 * s, 146 * s, 146 * s);
            }

            ctx.drawImage(getAsset('title'), 0, 0, 608, 144, 94 * s, 546 * s, 608 * s, 144 * s);

            if (card.race) {
                ctx.drawImage(getAsset('race'), 0, 0, 529, 106, 125 * s, 937 * s, 529 * s, 106 * s);
            }

            ctx.drawImage(getAsset('attack'), 0, 0, 214, 238, 0, 862 * s, 214 * s, 238 * s);
            ctx.drawImage(getAsset('health'), 0, 0, 167, 218, 575 * s, 876 * s, 167 * s, 218 * s);

            if (card.rarity === 'LEGENDARY') {
                ctx.drawImage(getAsset('dragon'), 0, 0, 569, 417, 196 * s, 0, 569 * s, 417 * s);
            }
        }

        drawProgress = 7;

        if (card.type === 'SPELL') {
            if (sw.rarity) {
                ctx.drawImage(getAsset(sw.rarity), 0, 0, 149, 149, 311 * s, 607 * s, 150 * s, 150 * s);
            }

            ctx.drawImage(getAsset('title-spell'), 0, 0, 646, 199, 66 * s, 530 * s, 646 * s, 199 * s);
        }

        if (card.type === 'WEAPON') {
            if (sw.rarity) {
                ctx.drawImage(getAsset(sw.rarity), 0, 0, 146, 144, 315 * s, 592 * s, 146 * s, 144 * s);
            }

            ctx.drawImage(getAsset('title-weapon'), 0, 0, 660, 140, 56 * s, 551 * s, 660 * s, 140 * s);

            ctx.drawImage(getAsset('swords'), 0, 0, 312, 306, 32 * s, 906 * s, 187 * s, 183 * s);
            ctx.drawImage(getAsset('shield'), 0, 0, 301, 333, 584 * s, 890 * s, 186 * s, 205 * s);
        }

        drawProgress = 8;


        if (card.set !== 'CORE') {
          (function () {
            ctx.globalCompositeOperation = 'color-burn';
            if (card.type === 'MINION') {
                if (card.race) {
                    ctx.drawImage(getAsset(sw.bgLogo), 0, 0, 128, 128, 270 * s, 723 * s, 256 * s, 256 * s);
                } else {
                    ctx.drawImage(getAsset(sw.bgLogo), 0, 0, 128, 128, 270 * s, 735 * s, 256 * s, 256 * s);
                }
            } else if (card.type === 'SPELL') {
                ctx.globalAlpha = 0.7;
                ctx.drawImage(getAsset(sw.bgLogo), 0, 0, 128, 128, 264 * s, 726 * s, 256 * s, 256 * s);
            } else if (card.type === 'WEAPON') {
                ctx.globalCompositeOperation = 'lighten';
                ctx.globalAlpha = 0.07;
                ctx.drawImage(getAsset(sw.bgLogo), 0, 0, 128, 128, 264 * s, 735 * s, 256 * s, 256 * s);
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
          })();
        }

        drawProgress = 12;

        ctx.restore();

        clearTimeout(drawTimeout);

        log('Rendertime: ' + (Date.now() - renderStart) + 'ms');

        internalCB();
        if (callback) {
            callback(cvs);
        }
    }

    function queryRender(card, resolution, renderTarget, callback) {
        renderQuery.push([card, resolution, callback, renderTarget]);
        if (!rendering) {
            renderTick();
        }
    }

    function renderTick() {
        if (!ready) {
            return;
        }
        render();
        window.requestAnimationFrame(renderTick);
    }

    /**
     * Renders the HS-API object, you pass to this function.
     * @param conf
     * @param [resolution=512] The desired width of the rendered card.
     * @return Canvas
     */
    function render() {
        if (rendering > maxRendering) {
            return;
        }

        var card, resolution, callback, target;

        if (!renderQuery.length) {
            return;
        }

        var renderInfo = renderQuery.shift();

        rendering++;

        card = renderInfo[0];
        resolution = renderInfo[1];
        callback = renderInfo[2];
        target = renderInfo[3];

        log('Preparing assets for: ' + card.title);

        var cvs = getBuffer(),
            ctx = cvs.getContext('2d'),
            s = (resolution || 512) / 764,
            loadList = [];

        cvs.width = resolution || 512;
        cvs.height = Math.round(cvs.width * 1.4397905759);

        card.sunwell = card.sunwell || {};

        card.sunwell.cardBack = card.type.substr(0, 1).toLowerCase() + card.playerClass.substr(0, 1) + card.playerClass.substr(1).toLowerCase();

        loadList.push(card.sunwell.cardBack);

        loadList.push('gem');

        if (card.type === 'MINION') {
            loadList.push('attack', 'health', 'title');

            if (card.rarity === 'LEGENDARY') {
                loadList.push('dragon');
            }

            if (card.rarity !== 'FREE' && !(card.rarity === 'COMMON' && card.set === 'CORE')) {
                card.sunwell.rarity = 'rarity-' + card.rarity.toLowerCase();
                loadList.push(card.sunwell.rarity);
            }
        }

        if (card.type === 'SPELL') {
            loadList.push('attack', 'health', 'title-spell');

            if (card.rarity !== 'FREE' && !(card.rarity === 'COMMON' && card.set === 'CORE')) {
                card.sunwell.rarity = 'spell-rarity-' + card.rarity.toLowerCase();
                loadList.push(card.sunwell.rarity);
            }
        }

        if (card.type === 'WEAPON') {
            loadList.push('swords', 'shield', 'title-weapon');

            if (card.rarity !== 'FREE' && !(card.rarity === 'COMMON' && card.set === 'CORE')) {
                card.sunwell.rarity = 'weapon-rarity-' + card.rarity.toLowerCase();
                loadList.push(card.sunwell.rarity);
            }
        }

        if (['BRM', 'GVG', 'KARA', 'LOE', 'NAXX', 'TGT', 'OG', 'GANGS'].indexOf(card.set) === -1) {
            card.sunwell.bgLogo = 'set-classic';
        } else {
            card.sunwell.bgLogo = 'set-' + card.set.toLowerCase();
        }

        loadList.push(card.sunwell.bgLogo);

        if (card.race) {
            loadList.push('race');
        }

        if (['GRIMY_GOONS', 'JADE_LOTUS', 'KABAL'].indexOf(card.multiClassGroup) !== -1) {
          card.sunwell.multiBanner = 'multi-' + card.multiClassGroup.toLowerCase();
          loadList.push(card.sunwell.multiBanner);
        }

        if (typeof card.texture === 'string' && card.set !== 'CHEAT') {
            if (s <= 0.5) {
                loadList.push('h:' + card.texture);
            } else {
                loadList.push('t:' + card.texture);
            }
        }

        log('Assets prepared, now loading');

        fetchAssets(loadList)
            .then(function () {
                log('Assets loaded for: ' + card.title);
                draw(cvs, ctx, card, s, callback, function () {
                    rendering--;
                    log('Card rendered: ' + card.title);
                    var event;
                    if (document.createEvent) {
                      event = document.createEvent("HTMLEvents");
                      event.initEvent("dataavailable", true, true);
                    } else {
                      event = document.createEventObject();
                      event.eventType = "dataavailable";
                    }
                    event.eventName = "dataavailable";
                    if (document.createEvent) {
                      target.dispatchEvent(event);
                    } else {
                      target.fireEvent("on" + event.eventType, event);
                    }
                    freeBuffer(cvs);
                });
            });
    }

    /**
     * This will flush sunwell's render caches.
     */
    sunwell.clearCache = function () {
        renderCache = {};
    };

    /**
     * Creates a new card object that can also be manipulated at a later point.
     * Provide an image object as render target as output for the visual card data.
     * @param settings
     * @param width
     * @param renderTarget
     */
    sunwell.createCard = function (settings, width, renderTarget) {
        if (!settings) {
            throw new Error('No card object given');
        }

        if (!renderTarget) {
            renderTarget = new Image();
        }

        //Make compatible to tech cards
        if (validRarity.indexOf(settings.rarity) === -1) {
            settings.rarity = 'FREE';
        }

        //Make compatible to hearthstoneJSON format.
        if (settings.title === undefined) {
            settings.title = settings.name;
        }
        if (settings.gameId === undefined) {
            settings.gameId = settings.id;
        }

        if (sunwell.settings.idAsTexture) {
            settings.texture = settings.gameId;
        }

        settings.costStyle = settings.costStyle || '0';
        settings.healthStyle = settings.healthStyle || '0';
        settings.attackStyle = settings.attackStyle || '0';
        settings.durabilityStyle = settings.durabilityStyle || '0';

        settings.costHealth = settings.costHealth || false;

        settings.width = width;

        var cacheKey = checksum(settings);

        if (renderCache[cacheKey] && !sunwell.settings.debug) {
            renderTarget.src = renderCache[cacheKey];
            return;
        }

        log('Queried render: ' + settings.title);

        queryRender(settings, width, renderTarget, function (result) {
            renderTarget.src = renderCache[cacheKey] = result.toDataURL();
        });

        return {
            target: renderTarget,
            redraw: function () {
                cacheKey = checksum(settings);
                delete renderCache[cacheKey];
                queryRender(settings, width, renderTarget, function (result) {
                    renderTarget.src = renderCache[cacheKey] = result.toDataURL();
                });
            },
            update: function (properties) {
                for (var key in properties) {
                    settings[key] = properties[key];
                }

                cacheKey = checksum(settings);

                if (renderCache[cacheKey]) {
                    renderTarget.src = renderCache[cacheKey];
                    return;
                }

                queryRender(settings, width, renderTarget, function (result) {

                  renderTarget.src = renderCache[cacheKey] = result.toDataURL();

                });
            }
        };
    };
})();
