import * as P from '@react-pdf/primitives';
import { isNil, matchPercent } from '@react-pdf/fns';
import absPath from 'abs-svg-path';
import parsePath from 'parse-svg-path';
import normalizePath from 'normalize-svg-path';
import colorString from 'color-string';

const renderPath = (ctx, node) => {
  var _node$props;
  const d = (_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.d;
  if (d) ctx.path(node.props.d);
};

const KAPPA$3 = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
const renderRect = (ctx, node) => {
  var _node$props, _node$props2, _node$props3, _node$props4, _node$props5, _node$props6;
  const x = ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.x) || 0;
  const y = ((_node$props2 = node.props) === null || _node$props2 === void 0 ? void 0 : _node$props2.y) || 0;
  const rx = ((_node$props3 = node.props) === null || _node$props3 === void 0 ? void 0 : _node$props3.rx) || 0;
  const ry = ((_node$props4 = node.props) === null || _node$props4 === void 0 ? void 0 : _node$props4.ry) || 0;
  const width = ((_node$props5 = node.props) === null || _node$props5 === void 0 ? void 0 : _node$props5.width) || 0;
  const height = ((_node$props6 = node.props) === null || _node$props6 === void 0 ? void 0 : _node$props6.height) || 0;
  if (!width || !height) return;
  if (rx && ry) {
    const krx = rx * KAPPA$3;
    const kry = ry * KAPPA$3;
    ctx.moveTo(x + rx, y);
    ctx.lineTo(x - rx + width, y);
    ctx.bezierCurveTo(x - rx + width + krx, y, x + width, y + ry - kry, x + width, y + ry);
    ctx.lineTo(x + width, y + height - ry);
    ctx.bezierCurveTo(x + width, y + height - ry + kry, x - rx + width + krx, y + height, x - rx + width, y + height);
    ctx.lineTo(x + rx, y + height);
    ctx.bezierCurveTo(x + rx - krx, y + height, x, y + height - ry + kry, x, y + height - ry);
    ctx.lineTo(x, y + ry);
    ctx.bezierCurveTo(x, y + ry - kry, x + rx - krx, y, x + rx, y);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
  }
  ctx.closePath();
};

const renderLine$1 = (ctx, node) => {
  const {
    x1,
    x2,
    y1,
    y2
  } = node.props || {};
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
};

const renderGroup = () => {
  // noop
};

const KAPPA$2 = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
const drawEllipse = function (ctx, cx, cy, rx, ry) {
  if (cx === void 0) {
    cx = 0;
  }
  if (cy === void 0) {
    cy = 0;
  }
  const x = cx - rx;
  const y = cy - ry;
  const ox = rx * KAPPA$2;
  const oy = ry * KAPPA$2;
  const xe = x + rx * 2;
  const ye = y + ry * 2;
  const xm = x + rx;
  const ym = y + ry;
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.closePath();
};
const renderEllipse = (ctx, node) => {
  const {
    cx,
    cy,
    rx,
    ry
  } = node.props || {};
  drawEllipse(ctx, cx, cy, rx, ry);
};

const renderCircle = (ctx, node) => {
  var _node$props, _node$props2, _node$props3;
  const cx = (_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.cx;
  const cy = (_node$props2 = node.props) === null || _node$props2 === void 0 ? void 0 : _node$props2.cy;
  const r = (_node$props3 = node.props) === null || _node$props3 === void 0 ? void 0 : _node$props3.r;
  drawEllipse(ctx, cx, cy, r, r);
};

const renderGlyphs = function (ctx, glyphs, positions, x, y, options) {
  if (options === void 0) {
    options = {};
  }
  const scale = 1000 / ctx._fontSize;
  const unitsPerEm = ctx._font.font.unitsPerEm || 1000;
  const advanceWidthScale = 1000 / unitsPerEm;

  // Glyph encoding and positioning
  const encodedGlyphs = ctx._font.encodeGlyphs(glyphs);
  const encodedPositions = positions.map((pos, i) => ({
    xAdvance: pos.xAdvance * scale,
    yAdvance: pos.yAdvance * scale,
    xOffset: pos.xOffset,
    yOffset: pos.yOffset,
    advanceWidth: glyphs[i].advanceWidth * advanceWidthScale
  }));
  return ctx._glyphs(encodedGlyphs, encodedPositions, x, y, options);
};

const renderRun$1 = (ctx, run) => {
  const runAdvanceWidth = run.xAdvance;
  const {
    font,
    fontSize,
    color,
    opacity
  } = run.attributes;
  ctx.fillColor(color);
  ctx.fillOpacity(opacity);
  if (font.sbix || font.COLR && font.CPAL) {
    ctx.save();
    ctx.translate(0, -run.ascent);
    for (let i = 0; i < run.glyphs.length; i += 1) {
      const position = run.positions[i];
      const glyph = run.glyphs[i];
      ctx.save();
      ctx.translate(position.xOffset, position.yOffset);
      glyph.render(ctx, fontSize);
      ctx.restore();
      ctx.translate(position.xAdvance, position.yAdvance);
    }
    ctx.restore();
  } else {
    ctx.font(typeof font.name === 'string' ? font.name : font, fontSize);
    try {
      renderGlyphs(ctx, run.glyphs, run.positions, 0, 0);
    } catch (error) {
      console.log(error);
    }
  }
  ctx.translate(runAdvanceWidth, 0);
};
const renderSpan = (ctx, line, textAnchor, dominantBaseline) => {
  var _line$box, _line$box2, _line$runs$, _line$runs$2, _line$runs$2$attribut;
  ctx.save();
  const x = ((_line$box = line.box) === null || _line$box === void 0 ? void 0 : _line$box.x) || 0;
  const y = ((_line$box2 = line.box) === null || _line$box2 === void 0 ? void 0 : _line$box2.y) || 0;
  const font = (_line$runs$ = line.runs[0]) === null || _line$runs$ === void 0 ? void 0 : _line$runs$.attributes.font;
  const scale = ((_line$runs$2 = line.runs[0]) === null || _line$runs$2 === void 0 ? void 0 : (_line$runs$2$attribut = _line$runs$2.attributes) === null || _line$runs$2$attribut === void 0 ? void 0 : _line$runs$2$attribut.scale) || 1;
  const width = line.xAdvance;
  const ascent = font.ascent * scale;
  const xHeight = font.xHeight * scale;
  const descent = font.descent * scale;
  const capHeight = font.capHeight * scale;
  let xTranslate = x;
  let yTranslate = y;
  switch (textAnchor) {
    case 'middle':
      xTranslate = x - width / 2;
      break;
    case 'end':
      xTranslate = x - width;
      break;
    default:
      xTranslate = x;
      break;
  }
  switch (dominantBaseline) {
    case 'middle':
    case 'central':
      yTranslate = y + capHeight / 2;
      break;
    case 'hanging':
      yTranslate = y + capHeight;
      break;
    case 'mathematical':
      yTranslate = y + xHeight;
      break;
    case 'text-after-edge':
      yTranslate = y + descent;
      break;
    case 'text-before-edge':
      yTranslate = y + ascent;
      break;
    default:
      yTranslate = y;
      break;
  }
  ctx.translate(xTranslate, yTranslate);
  line.runs.forEach(run => renderRun$1(ctx, run));
  ctx.restore();
};
const renderSvgText = (ctx, node) => {
  node.children.forEach(span => renderSpan(ctx, span.lines[0], span.props.textAnchor, span.props.dominantBaseline));
};

/**
 * Create pairs from array
 *
 * @template T
 * @param {T[]} values array
 * @returns {T[][]} pairs
 */
const pairs = values => {
  const result = [];
  for (let i = 0; i < values.length; i += 2) {
    result.push([values[i], values[i + 1]]);
  }
  return result;
};

/**
 * Parse svg-like points into number arrays
 *
 * @param {string} points string ex. "20,30 50,60"
 * @returns {number[][]} points array ex. [[20, 30], [50, 60]]
 */
const parsePoints = points => {
  let values = (points || '').trim().replace(/,/g, ' ').replace(/(\d)-(\d)/g, '$1 -$2').split(/\s+/);
  if (values.length % 2 !== 0) {
    values = values.slice(0, -1);
  }
  const mappedValues = values.map(parseFloat);
  return pairs(mappedValues);
};

const drawPolyline = (ctx, points) => {
  if (points.length > 0) {
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
  }
};
const renderPolyline = (ctx, node) => {
  const points = parsePoints(node.props.points || '');
  drawPolyline(ctx, points);
};

const renderPolygon = (ctx, node) => {
  renderPolyline(ctx, node);
  ctx.closePath();
};

const renderImage$1 = (ctx, node) => {
  if (!node.image.data) return;
  const {
    x,
    y
  } = node.props;
  const {
    width,
    height,
    opacity
  } = node.style;
  const paddingTop = node.box.paddingLeft || 0;
  const paddingLeft = node.box.paddingLeft || 0;
  if (width === 0 || height === 0) {
    console.warn(`Image with src '${node.props.href}' skipped due to invalid dimensions`);
    return;
  }
  ctx.save();
  ctx.fillOpacity(opacity || 1).image(node.image.data, x + paddingLeft, y + paddingTop, {
    width,
    height
  });
  ctx.restore();
};

// This constant is used to approximate a symmetrical arc using a cubic
// Bezier curve.
const KAPPA$1 = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
const clipNode = (ctx, node) => {
  if (!node.style) return;
  const {
    top,
    left,
    width,
    height
  } = node.box;
  const {
    borderTopLeftRadius = 0,
    borderTopRightRadius = 0,
    borderBottomRightRadius = 0,
    borderBottomLeftRadius = 0
  } = node.style;

  // Border top
  const rtr = Math.min(borderTopRightRadius, 0.5 * width, 0.5 * height);
  const ctr = rtr * (1.0 - KAPPA$1);
  ctx.moveTo(left + rtr, top);
  ctx.lineTo(left + width - rtr, top);
  ctx.bezierCurveTo(left + width - ctr, top, left + width, top + ctr, left + width, top + rtr);

  // Border right
  const rbr = Math.min(borderBottomRightRadius, 0.5 * width, 0.5 * height);
  const cbr = rbr * (1.0 - KAPPA$1);
  ctx.lineTo(left + width, top + height - rbr);
  ctx.bezierCurveTo(left + width, top + height - cbr, left + width - cbr, top + height, left + width - rbr, top + height);

  // Border bottom
  const rbl = Math.min(borderBottomLeftRadius, 0.5 * width, 0.5 * height);
  const cbl = rbl * (1.0 - KAPPA$1);
  ctx.lineTo(left + rbl, top + height);
  ctx.bezierCurveTo(left + cbl, top + height, left, top + height - cbl, left, top + height - rbl);

  // Border left
  const rtl = Math.min(borderTopLeftRadius, 0.5 * width, 0.5 * height);
  const ctl = rtl * (1.0 - KAPPA$1);
  ctx.lineTo(left, top + rtl);
  ctx.bezierCurveTo(left, top + ctl, left + ctl, top, left + rtl, top);
  ctx.closePath();
  ctx.clip();
};

const applySingleTransformation = (ctx, transform, origin) => {
  const {
    operation,
    value
  } = transform;
  switch (operation) {
    case 'scale':
      {
        const [scaleX, scaleY] = value;
        ctx.scale(scaleX, scaleY, {
          origin
        });
        break;
      }
    case 'rotate':
      {
        const [angle] = value;
        ctx.rotate(angle, {
          origin
        });
        break;
      }
    case 'translate':
      {
        const [x, y = 0] = value;
        ctx.translate(x, y, {
          origin
        });
        break;
      }
    case 'skew':
      {
        const [xAngle, yAngle] = value;
        ctx.skew(xAngle, yAngle, {
          origin
        });
        break;
      }
    case 'matrix':
      {
        ctx.transform(...value);
        break;
      }
    default:
      {
        console.error(`Transform operation: '${operation}' doesn't supported`);
      }
  }
};
const applyTransformations = (ctx, node) => {
  var _node$style, _node$props;
  if (!node.origin) return;
  const origin = [node.origin.left, node.origin.top];
  const operations = ((_node$style = node.style) === null || _node$style === void 0 ? void 0 : _node$style.transform) || ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.transform) || [];
  operations.forEach(operation => {
    applySingleTransformation(ctx, operation, origin);
  });
};

// From https://github.com/dy/svg-path-bounds/blob/master/index.js
const getPathBoundingBox = node => {
  var _node$props;
  const path = normalizePath(absPath(parsePath(((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.d) || '')));
  if (!path.length) return [0, 0, 0, 0];
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (let i = 0, l = path.length; i < l; i += 1) {
    const points = path[i].slice(1);
    for (let j = 0; j < points.length; j += 2) {
      if (points[j + 0] < bounds[0]) bounds[0] = points[j + 0];
      if (points[j + 1] < bounds[1]) bounds[1] = points[j + 1];
      if (points[j + 0] > bounds[2]) bounds[2] = points[j + 0];
      if (points[j + 1] > bounds[3]) bounds[3] = points[j + 1];
    }
  }
  return bounds;
};
const getCircleBoundingBox = node => {
  var _node$props2, _node$props3, _node$props4;
  const r = ((_node$props2 = node.props) === null || _node$props2 === void 0 ? void 0 : _node$props2.r) || 0;
  const cx = ((_node$props3 = node.props) === null || _node$props3 === void 0 ? void 0 : _node$props3.cx) || 0;
  const cy = ((_node$props4 = node.props) === null || _node$props4 === void 0 ? void 0 : _node$props4.cy) || 0;
  return [cx - r, cy - r, cx + r, cy + r];
};
const getEllipseBoundingBox = node => {
  var _node$props5, _node$props6, _node$props7, _node$props8;
  const cx = ((_node$props5 = node.props) === null || _node$props5 === void 0 ? void 0 : _node$props5.cx) || 0;
  const cy = ((_node$props6 = node.props) === null || _node$props6 === void 0 ? void 0 : _node$props6.cy) || 0;
  const rx = ((_node$props7 = node.props) === null || _node$props7 === void 0 ? void 0 : _node$props7.rx) || 0;
  const ry = ((_node$props8 = node.props) === null || _node$props8 === void 0 ? void 0 : _node$props8.ry) || 0;
  return [cx - rx, cy - ry, cx + rx, cy + ry];
};
const getLineBoundingBox = node => {
  var _node$props9, _node$props10, _node$props11, _node$props12;
  const x1 = ((_node$props9 = node.props) === null || _node$props9 === void 0 ? void 0 : _node$props9.x1) || 0;
  const y1 = ((_node$props10 = node.props) === null || _node$props10 === void 0 ? void 0 : _node$props10.y1) || 0;
  const x2 = ((_node$props11 = node.props) === null || _node$props11 === void 0 ? void 0 : _node$props11.x2) || 0;
  const y2 = ((_node$props12 = node.props) === null || _node$props12 === void 0 ? void 0 : _node$props12.y2) || 0;
  return [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)];
};
const getRectBoundingBox = node => {
  var _node$props13, _node$props14, _node$props15, _node$props16;
  const x = ((_node$props13 = node.props) === null || _node$props13 === void 0 ? void 0 : _node$props13.x) || 0;
  const y = ((_node$props14 = node.props) === null || _node$props14 === void 0 ? void 0 : _node$props14.y) || 0;
  const width = ((_node$props15 = node.props) === null || _node$props15 === void 0 ? void 0 : _node$props15.width) || 0;
  const height = ((_node$props16 = node.props) === null || _node$props16 === void 0 ? void 0 : _node$props16.height) || 0;
  return [x, y, x + width, y + height];
};
const max = values => Math.max(-Infinity, ...values);
const min = values => Math.min(Infinity, ...values);
const getPolylineBoundingBox = node => {
  var _node$props17;
  const points = parsePoints(((_node$props17 = node.props) === null || _node$props17 === void 0 ? void 0 : _node$props17.points) || []);
  const xValues = points.map(p => p[0]);
  const yValues = points.map(p => p[1]);
  return [min(xValues), min(yValues), max(xValues), max(yValues)];
};
const boundingBoxFns = {
  [P.Rect]: getRectBoundingBox,
  [P.Line]: getLineBoundingBox,
  [P.Path]: getPathBoundingBox,
  [P.Circle]: getCircleBoundingBox,
  [P.Ellipse]: getEllipseBoundingBox,
  [P.Polygon]: getPolylineBoundingBox,
  [P.Polyline]: getPolylineBoundingBox
};
const getBoundingBox = node => {
  const boundingBoxFn = boundingBoxFns[node.type];
  return boundingBoxFn ? boundingBoxFn(node) : [0, 0, 0, 0];
};

const setStrokeWidth = (ctx, node) => {
  var _node$props;
  const lineWidth = ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.strokeWidth) || 0;
  if (lineWidth) ctx.lineWidth(lineWidth);
};
const setStrokeColor = (ctx, node) => {
  var _node$props2;
  const strokeColor = ((_node$props2 = node.props) === null || _node$props2 === void 0 ? void 0 : _node$props2.stroke) || null;
  if (strokeColor) ctx.strokeColor(strokeColor);
};
const setOpacity = (ctx, node) => {
  var _node$props3;
  const opacity = ((_node$props3 = node.props) === null || _node$props3 === void 0 ? void 0 : _node$props3.opacity) || null;
  if (!isNil(opacity)) ctx.opacity(opacity);
};
const setFillOpacity = (ctx, node) => {
  var _node$props4;
  const fillOpacity = ((_node$props4 = node.props) === null || _node$props4 === void 0 ? void 0 : _node$props4.fillOpacity) || null;
  if (!isNil(fillOpacity)) ctx.fillOpacity(fillOpacity);
};
const setStrokeOpacity = (ctx, node) => {
  var _node$props5;
  const strokeOpacity = ((_node$props5 = node.props) === null || _node$props5 === void 0 ? void 0 : _node$props5.strokeOpacity) || null;
  if (!isNil(strokeOpacity)) ctx.strokeOpacity(strokeOpacity);
};
const setLineJoin = (ctx, node) => {
  var _node$props6;
  const lineJoin = ((_node$props6 = node.props) === null || _node$props6 === void 0 ? void 0 : _node$props6.strokeLinejoin) || null;
  if (lineJoin) ctx.lineJoin(lineJoin);
};
const setLineCap = (ctx, node) => {
  var _node$props7;
  const lineCap = ((_node$props7 = node.props) === null || _node$props7 === void 0 ? void 0 : _node$props7.strokeLinecap) || null;
  if (lineCap) ctx.lineCap(lineCap);
};
const setLineDash = (ctx, node) => {
  var _node$props8;
  const value = ((_node$props8 = node.props) === null || _node$props8 === void 0 ? void 0 : _node$props8.strokeDasharray) || null;
  if (value) ctx.dash(value.split(',').map(Number));
};
const hasLinearGradientFill = node => {
  var _node$props9, _node$props9$fill;
  return ((_node$props9 = node.props) === null || _node$props9 === void 0 ? void 0 : (_node$props9$fill = _node$props9.fill) === null || _node$props9$fill === void 0 ? void 0 : _node$props9$fill.type) === P.LinearGradient;
};
const hasRadialGradientFill = node => {
  var _node$props10, _node$props10$fill;
  return ((_node$props10 = node.props) === null || _node$props10 === void 0 ? void 0 : (_node$props10$fill = _node$props10.fill) === null || _node$props10$fill === void 0 ? void 0 : _node$props10$fill.type) === P.RadialGradient;
};

// Math simplified from https://github.com/devongovett/svgkit/blob/master/src/elements/SVGGradient.js#L104
const setLinearGradientFill = (ctx, node) => {
  var _node$props11;
  const bbox = getBoundingBox(node);
  const gradient = ((_node$props11 = node.props) === null || _node$props11 === void 0 ? void 0 : _node$props11.fill) || null;
  const x1 = gradient.props.x1 || 0;
  const y1 = gradient.props.y1 || 0;
  const x2 = gradient.props.x2 || 1;
  const y2 = gradient.props.y2 || 0;
  const m0 = bbox[2] - bbox[0];
  const m3 = bbox[3] - bbox[1];
  const m4 = bbox[0];
  const m5 = bbox[1];
  const gx1 = m0 * x1 + m4;
  const gy1 = m3 * y1 + m5;
  const gx2 = m0 * x2 + m4;
  const gy2 = m3 * y2 + m5;
  const grad = ctx.linearGradient(gx1, gy1, gx2, gy2);
  gradient.children.forEach(stop => {
    grad.stop(stop.props.offset, stop.props.stopColor, stop.props.stopOpacity);
  });
  ctx.fill(grad);
};

// Math simplified from https://github.com/devongovett/svgkit/blob/master/src/elements/SVGGradient.js#L155
const setRadialGradientFill = (ctx, node) => {
  var _node$props12;
  const bbox = getBoundingBox(node);
  const gradient = ((_node$props12 = node.props) === null || _node$props12 === void 0 ? void 0 : _node$props12.fill) || null;
  const cx = gradient.props.cx || 0.5;
  const cy = gradient.props.cy || 0.5;
  const fx = gradient.props.fx || cx;
  const fy = gradient.props.fy || cy;
  const r = gradient.props.r || 0.5;
  const m0 = bbox[2] - bbox[0];
  const m3 = bbox[3] - bbox[1];
  const m4 = bbox[0];
  const m5 = bbox[1];
  const gr = r * m0;
  const gcx = m0 * cx + m4;
  const gcy = m3 * cy + m5;
  const gfx = m0 * fx + m4;
  const gfy = m3 * fy + m5;
  const grad = ctx.radialGradient(gfx, gfy, 0, gcx, gcy, gr);
  gradient.children.forEach(stop => {
    grad.stop(stop.props.offset, stop.props.stopColor, stop.props.stopOpacity);
  });
  ctx.fill(grad);
};
const setFillColor = (ctx, node) => {
  var _node$props13;
  const fillColor = ((_node$props13 = node.props) === null || _node$props13 === void 0 ? void 0 : _node$props13.fill) || null;
  if (fillColor) ctx.fillColor(fillColor);
};
const setFill = (ctx, node) => {
  if (hasLinearGradientFill(node)) return setLinearGradientFill(ctx, node);
  if (hasRadialGradientFill(node)) return setRadialGradientFill(ctx, node);
  return setFillColor(ctx, node);
};
const draw = (ctx, node) => {
  const props = node.props || {};
  if (props.fill && props.stroke) {
    ctx.fillAndStroke(props.fillRule);
  } else if (props.fill) {
    ctx.fill(props.fillRule);
  } else if (props.stroke) {
    ctx.stroke();
  } else {
    ctx.save();
    ctx.opacity(0);
    ctx.fill(null);
    ctx.restore();
  }
};
const noop = () => {};
const renderFns$1 = {
  [P.Tspan]: noop,
  [P.TextInstance]: noop,
  [P.Path]: renderPath,
  [P.Rect]: renderRect,
  [P.Line]: renderLine$1,
  [P.G]: renderGroup,
  [P.Text]: renderSvgText,
  [P.Circle]: renderCircle,
  [P.Image]: renderImage$1,
  [P.Ellipse]: renderEllipse,
  [P.Polygon]: renderPolygon,
  [P.Polyline]: renderPolyline
};
const renderNode$1 = (ctx, node) => {
  const renderFn = renderFns$1[node.type];
  if (renderFn) {
    renderFn(ctx, node);
  } else {
    console.warn(`SVG node of type ${node.type} is not currently supported`);
  }
};
const drawNode = (ctx, node) => {
  setLineCap(ctx, node);
  setLineDash(ctx, node);
  setLineJoin(ctx, node);
  setStrokeWidth(ctx, node);
  setStrokeColor(ctx, node);
  setFill(ctx, node);
  setStrokeOpacity(ctx, node);
  setFillOpacity(ctx, node);
  setOpacity(ctx, node);
  applyTransformations(ctx, node);
  renderNode$1(ctx, node);
  draw(ctx, node);
};
const clipPath = (ctx, node) => {
  var _node$props14;
  const value = (_node$props14 = node.props) === null || _node$props14 === void 0 ? void 0 : _node$props14.clipPath;
  if (value) {
    const children = value.children || [];
    children.forEach(child => renderNode$1(ctx, child));
    ctx.clip();
  }
};
const drawChildren = (ctx, node) => {
  const children = node.children || [];
  children.forEach(child => {
    ctx.save();
    clipPath(ctx, child);
    drawNode(ctx, child);
    drawChildren(ctx, child);
    ctx.restore();
  });
};
const resolveAspectRatio = (ctx, node) => {
  const {
    width,
    height
  } = node.box;
  const {
    viewBox,
    preserveAspectRatio = {}
  } = node.props;
  const {
    meetOrSlice = 'meet',
    align = 'xMidYMid'
  } = preserveAspectRatio;
  if (viewBox == null || width == null || height == null) return;
  const x = (viewBox === null || viewBox === void 0 ? void 0 : viewBox.minX) || 0;
  const y = (viewBox === null || viewBox === void 0 ? void 0 : viewBox.minY) || 0;
  const logicalWidth = (viewBox === null || viewBox === void 0 ? void 0 : viewBox.maxX) || width;
  const logicalHeight = (viewBox === null || viewBox === void 0 ? void 0 : viewBox.maxY) || height;
  const logicalRatio = logicalWidth / logicalHeight;
  const physicalRatio = width / height;
  const scaleX = width / logicalWidth;
  const scaleY = height / logicalHeight;
  if (align === 'none') {
    ctx.scale(scaleX, scaleY);
    ctx.translate(-x, -y);
    return;
  }
  if (logicalRatio < physicalRatio && meetOrSlice === 'meet' || logicalRatio >= physicalRatio && meetOrSlice === 'slice') {
    ctx.scale(scaleY, scaleY);
    switch (align) {
      case 'xMinYMin':
      case 'xMinYMid':
      case 'xMinYMax':
        ctx.translate(-x, -y);
        break;
      case 'xMidYMin':
      case 'xMidYMid':
      case 'xMidYMax':
        ctx.translate(-x - (logicalWidth - width * logicalHeight / height) / 2, -y);
        break;
      default:
        ctx.translate(-x - (logicalWidth - width * logicalHeight / height), -y);
    }
  } else {
    ctx.scale(scaleX, scaleX);
    switch (align) {
      case 'xMinYMin':
      case 'xMidYMin':
      case 'xMaxYMin':
        ctx.translate(-x, -y);
        break;
      case 'xMinYMid':
      case 'xMidYMid':
      case 'xMaxYMid':
        ctx.translate(-x, -y - (logicalHeight - height * logicalWidth / width) / 2);
        break;
      default:
        ctx.translate(-x, -y - (logicalHeight - height * logicalWidth / width));
    }
  }
};
const moveToOrigin = (ctx, node) => {
  const {
    top,
    left
  } = node.box;
  const paddingLeft = node.box.paddingLeft || 0;
  const paddingTop = node.box.paddingTop || 0;
  ctx.translate(left + paddingLeft, top + paddingTop);
};
const renderSvg = (ctx, node) => {
  ctx.save();
  clipNode(ctx, node);
  moveToOrigin(ctx, node);
  resolveAspectRatio(ctx, node);
  drawChildren(ctx, node);
  ctx.restore();
};

const black = {
  value: [0, 0, 0],
  opacity: 1
};
const parseColor = hex => {
  const parsed = colorString.get(hex);
  if (!parsed) return black;
  const value = colorString.to.hex(parsed.value.slice(0, 3));
  const opacity = parsed.value[3];
  return {
    value,
    opacity
  };
};

/* eslint-disable no-param-reassign */
const DEST_REGEXP = /^#.+/;
const isSrcId$1 = src => src.match(DEST_REGEXP);
const renderAttachment = (ctx, attachment) => {
  const {
    xOffset = 0,
    yOffset = 0,
    width,
    height,
    image
  } = attachment;
  ctx.translate(-width + xOffset, -height + yOffset);
  ctx.image(image, 0, 0, {
    fit: [width, height],
    align: 'center',
    valign: 'bottom'
  });
};
const renderAttachments = (ctx, run) => {
  ctx.save();
  const {
    font
  } = run.attributes;
  const space = font.glyphForCodePoint(0x20);
  const objectReplacement = font.glyphForCodePoint(0xfffc);
  let attachmentAdvance = 0;
  for (let i = 0; i < run.glyphs.length; i += 1) {
    const position = run.positions[i];
    const glyph = run.glyphs[i];
    attachmentAdvance += position.xAdvance || 0;
    if (glyph.id === objectReplacement.id && run.attributes.attachment) {
      ctx.translate(attachmentAdvance, position.yOffset || 0);
      renderAttachment(ctx, run.attributes.attachment);
      run.glyphs[i] = space;
      attachmentAdvance = 0;
    }
  }
  ctx.restore();
};
const renderRun = (ctx, run, options) => {
  const {
    font,
    fontSize,
    link
  } = run.attributes;
  const color = parseColor(run.attributes.color);
  const opacity = isNil(run.attributes.opacity) ? color.opacity : run.attributes.opacity;
  const {
    height,
    descent,
    xAdvance
  } = run;
  if (options.outlineRuns) {
    ctx.rect(0, -height, xAdvance, height).stroke();
  }
  ctx.fillColor(color.value);
  ctx.fillOpacity(opacity);
  if (link) {
    if (isSrcId$1(link)) {
      ctx.goTo(0, -height - descent, xAdvance, height, link.slice(1));
    } else {
      ctx.link(0, -height - descent, xAdvance, height, link);
    }
  }
  renderAttachments(ctx, run);
  if (font.sbix || font.COLR && font.CPAL) {
    ctx.save();
    ctx.translate(0, -run.ascent);
    for (let i = 0; i < run.glyphs.length; i += 1) {
      const position = run.positions[i];
      const glyph = run.glyphs[i];
      ctx.save();
      ctx.translate(position.xOffset, position.yOffset);
      glyph.render(ctx, fontSize);
      ctx.restore();
      ctx.translate(position.xAdvance, position.yAdvance);
    }
    ctx.restore();
  } else {
    ctx.font(typeof font.name === 'string' ? font.name : font, fontSize);
    try {
      if (run.attributes.script) {
        ctx.addNamedDestination(run.attributes.script, 'XYZ', ctx._ctm[4], ctx._ctm[5], null);
      }
      renderGlyphs(ctx, run.glyphs, run.positions, 0, 0);
    } catch (error) {
      console.log(error);
    }
  }
  ctx.translate(xAdvance, 0);
};
const renderBackground$1 = (ctx, rect, backgroundColor) => {
  const color = parseColor(backgroundColor);
  ctx.save();
  ctx.fillOpacity(color.opacity);
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.fill(color.value);
  ctx.restore();
};
const renderDecorationLine = (ctx, line) => {
  ctx.save();
  ctx.lineWidth(line.rect.height);
  ctx.strokeOpacity(line.opacity);
  if (/dashed/.test(line.style)) {
    ctx.dash(3 * line.rect.height);
  } else if (/dotted/.test(line.style)) {
    ctx.dash(line.rect.height);
  }
  if (/wavy/.test(line.style)) {
    const dist = Math.max(2, line.rect.height);
    let step = 1.1 * dist;
    const stepCount = Math.floor(line.rect.width / (2 * step));

    // Adjust step to fill entire width
    const remainingWidth = line.rect.width - stepCount * 2 * step;
    const adjustment = remainingWidth / stepCount / 2;
    step += adjustment;
    const cp1y = line.rect.y + dist;
    const cp2y = line.rect.y - dist;
    let {
      x
    } = line.rect;
    ctx.moveTo(line.rect.x, line.rect.y);
    for (let i = 0; i < stepCount; i += 1) {
      ctx.bezierCurveTo(x + step, cp1y, x + step, cp2y, x + 2 * step, line.rect.y);
      x += 2 * step;
    }
  } else {
    ctx.moveTo(line.rect.x, line.rect.y);
    ctx.lineTo(line.rect.x + line.rect.width, line.rect.y);
    if (/double/.test(line.style)) {
      ctx.moveTo(line.rect.x, line.rect.y + line.rect.height * 2);
      ctx.lineTo(line.rect.x + line.rect.width, line.rect.y + line.rect.height * 2);
    }
  }
  ctx.stroke(line.color);
  ctx.restore();
};
const renderLine = (ctx, line, options) => {
  const lineAscent = line.ascent;
  if (options.outlineLines) {
    ctx.rect(line.box.x, line.box.y, line.box.width, line.box.height).stroke();
  }
  ctx.save();
  ctx.translate(line.box.x, line.box.y + lineAscent);
  for (let i = 0; i < line.runs.length; i += 1) {
    const run = line.runs[i];
    const isLastRun = i === line.runs.length - 1;
    if (run.attributes.backgroundColor) {
      const overflowRight = isLastRun ? line.overflowRight : 0;
      const backgroundRect = {
        x: 0,
        y: -lineAscent,
        height: line.box.height,
        width: run.xAdvance - overflowRight
      };
      renderBackground$1(ctx, backgroundRect, run.attributes.backgroundColor);
    }
    renderRun(ctx, run, options);
  }
  ctx.restore();
  ctx.save();
  ctx.translate(line.box.x, line.box.y);
  for (let i = 0; i < line.decorationLines.length; i += 1) {
    const decorationLine = line.decorationLines[i];
    renderDecorationLine(ctx, decorationLine);
  }
  ctx.restore();
};
const renderBlock = (ctx, block, options) => {
  block.forEach(line => {
    renderLine(ctx, line, options);
  });
};
const renderText = (ctx, node) => {
  var _node$box, _node$box2;
  const {
    top,
    left
  } = node.box;
  const blocks = [node.lines];
  const paddingTop = ((_node$box = node.box) === null || _node$box === void 0 ? void 0 : _node$box.paddingTop) || 0;
  const paddingLeft = ((_node$box2 = node.box) === null || _node$box2 === void 0 ? void 0 : _node$box2.paddingLeft) || 0;
  const initialY = node.lines[0] ? node.lines[0].box.y : 0;
  const offsetX = node.alignOffset || 0;
  ctx.save();
  ctx.translate(left + paddingLeft - offsetX, top + paddingTop - initialY);
  blocks.forEach(block => {
    renderBlock(ctx, block, {});
  });
  ctx.restore();
};

const renderPage = (ctx, node) => {
  var _node$props;
  const {
    width,
    height
  } = node.box;
  const dpi = ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.dpi) || 72;
  const userUnit = dpi / 72;
  ctx.addPage({
    size: [width, height],
    margin: 0,
    userUnit
  });
};

const renderNote = (ctx, node) => {
  var _node$children, _node$style, _node$style2;
  const {
    top,
    left
  } = node.box;
  const value = (node === null || node === void 0 ? void 0 : (_node$children = node.children) === null || _node$children === void 0 ? void 0 : _node$children[0].value) || '';
  const color = ((_node$style = node.style) === null || _node$style === void 0 ? void 0 : _node$style.backgroundColor) || null;
  const borderWidth = ((_node$style2 = node.style) === null || _node$style2 === void 0 ? void 0 : _node$style2.borderWidth) || null;
  ctx.note(left, top, 0, 0, value, {
    color,
    borderWidth
  });
};

const isNumeric = n => {
  return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
};
const applyContainObjectFit = (cw, ch, iw, ih, px, py) => {
  const cr = cw / ch;
  const ir = iw / ih;
  const pxp = matchPercent(px);
  const pyp = matchPercent(py);
  const pxv = pxp ? pxp.percent : 0.5;
  const pyv = pyp ? pyp.percent : 0.5;
  if (cr > ir) {
    const height = ch;
    const width = height * ir;
    const yOffset = isNumeric(py) ? py : 0;
    const xOffset = isNumeric(px) ? px : (cw - width) * pxv;
    return {
      width,
      height,
      xOffset,
      yOffset
    };
  }
  const width = cw;
  const height = width / ir;
  const xOffset = isNumeric(px) ? px : 0;
  const yOffset = isNumeric(py) ? py : (ch - height) * pyv;
  return {
    width,
    height,
    yOffset,
    xOffset
  };
};
const applyNoneObjectFit = (cw, ch, iw, ih, px, py) => {
  const width = iw;
  const height = ih;
  const pxp = matchPercent(px);
  const pyp = matchPercent(py);
  const pxv = pxp ? pxp.percent : 0.5;
  const pyv = pyp ? pyp.percent : 0.5;
  const xOffset = isNumeric(px) ? px : (cw - width) * pxv;
  const yOffset = isNumeric(py) ? py : (ch - height) * pyv;
  return {
    width,
    height,
    xOffset,
    yOffset
  };
};
const applyCoverObjectFit = (cw, ch, iw, ih, px, py) => {
  const ir = iw / ih;
  const cr = cw / ch;
  const pxp = matchPercent(px);
  const pyp = matchPercent(py);
  const pxv = pxp ? pxp.percent : 0.5;
  const pyv = pyp ? pyp.percent : 0.5;
  if (cr > ir) {
    const width = cw;
    const height = width / ir;
    const xOffset = isNumeric(px) ? px : 0;
    const yOffset = isNumeric(py) ? py : (ch - height) * pyv;
    return {
      width,
      height,
      yOffset,
      xOffset
    };
  }
  const height = ch;
  const width = height * ir;
  const xOffset = isNumeric(px) ? px : (cw - width) * pxv;
  const yOffset = isNumeric(py) ? py : 0;
  return {
    width,
    height,
    xOffset,
    yOffset
  };
};
const applyScaleDownObjectFit = (cw, ch, iw, ih, px, py) => {
  const containDimension = applyContainObjectFit(cw, ch, iw, ih, px, py);
  const noneDimension = applyNoneObjectFit(cw, ch, iw, ih, px, py);
  return containDimension.width < noneDimension.width ? containDimension : noneDimension;
};
const applyFillObjectFit = (cw, ch, px, py) => {
  return {
    width: cw,
    height: ch,
    xOffset: matchPercent(px) ? 0 : px || 0,
    yOffset: matchPercent(py) ? 0 : py || 0
  };
};
const resolveObjectFit = function (type, cw, ch, iw, ih, px, py) {
  if (type === void 0) {
    type = 'fill';
  }
  switch (type) {
    case 'contain':
      return applyContainObjectFit(cw, ch, iw, ih, px, py);
    case 'cover':
      return applyCoverObjectFit(cw, ch, iw, ih, px, py);
    case 'none':
      return applyNoneObjectFit(cw, ch, iw, ih, px, py);
    case 'scale-down':
      return applyScaleDownObjectFit(cw, ch, iw, ih, px, py);
    default:
      return applyFillObjectFit(cw, ch, px, py);
  }
};

const drawImage = function (ctx, node, options) {
  var _node$style, _node$style2, _node$style3, _node$style4;
  if (options === void 0) {
    options = {};
  }
  const {
    left,
    top
  } = node.box;
  const opacity = (_node$style = node.style) === null || _node$style === void 0 ? void 0 : _node$style.opacity;
  const objectFit = (_node$style2 = node.style) === null || _node$style2 === void 0 ? void 0 : _node$style2.objectFit;
  const objectPositionX = (_node$style3 = node.style) === null || _node$style3 === void 0 ? void 0 : _node$style3.objectPositionX;
  const objectPositionY = (_node$style4 = node.style) === null || _node$style4 === void 0 ? void 0 : _node$style4.objectPositionY;
  const paddingTop = node.box.paddingTop || 0;
  const paddingRight = node.box.paddingRight || 0;
  const paddingBottom = node.box.paddingBottom || 0;
  const paddingLeft = node.box.paddingLeft || 0;
  const imageCache = options.imageCache || new Map();
  const {
    width,
    height,
    xOffset,
    yOffset
  } = resolveObjectFit(objectFit, node.box.width - paddingLeft - paddingRight, node.box.height - paddingTop - paddingBottom, node.image.width, node.image.height, objectPositionX, objectPositionY);
  if (node.image.data) {
    if (width !== 0 && height !== 0) {
      const cacheKey = node.image.key;
      const image = imageCache.get(cacheKey) || ctx.embedImage(node.image.data);
      if (cacheKey) imageCache.set(cacheKey, image);
      const imageOpacity = isNil(opacity) ? 1 : opacity;
      ctx.fillOpacity(imageOpacity).image(image, left + paddingLeft + xOffset, top + paddingTop + yOffset, {
        width,
        height
      });
    } else {
      console.warn(`Image with src '${JSON.stringify(node.props.src)}' skipped due to invalid dimensions`);
    }
  }
};
const renderImage = (ctx, node, options) => {
  ctx.save();
  clipNode(ctx, node);
  drawImage(ctx, node, options);
  ctx.restore();
};

const CONTENT_COLOR = '#a1c6e7';
const PADDING_COLOR = '#c4deb9';
const MARGIN_COLOR = '#f8cca1';

// TODO: Draw debug boxes using clipping to enhance quality

const debugContent = (ctx, node) => {
  const {
    left,
    top,
    width,
    height,
    paddingLeft = 0,
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
    borderLeftWidth = 0,
    borderTopWidth = 0,
    borderRightWidth = 0,
    borderBottomWidth = 0
  } = node.box;
  ctx.fillColor(CONTENT_COLOR).opacity(0.5).rect(left + paddingLeft + borderLeftWidth, top + paddingTop + borderTopWidth, width - paddingLeft - paddingRight - borderRightWidth - borderLeftWidth, height - paddingTop - paddingBottom - borderTopWidth - borderBottomWidth).fill();
};
const debugPadding = (ctx, node) => {
  const {
    left,
    top,
    width,
    height,
    paddingLeft = 0,
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
    borderLeftWidth = 0,
    borderTopWidth = 0,
    borderRightWidth = 0,
    borderBottomWidth = 0
  } = node.box;
  ctx.fillColor(PADDING_COLOR).opacity(0.5);

  // Padding top
  ctx.rect(left + paddingLeft + borderLeftWidth, top + borderTopWidth, width - paddingRight - paddingLeft - borderLeftWidth - borderRightWidth, paddingTop).fill();

  // Padding left
  ctx.rect(left + borderLeftWidth, top + borderTopWidth, paddingLeft, height - borderTopWidth - borderBottomWidth).fill();

  // Padding right
  ctx.rect(left + width - paddingRight - borderRightWidth, top + borderTopWidth, paddingRight, height - borderTopWidth - borderBottomWidth).fill();

  // Padding bottom
  ctx.rect(left + paddingLeft + borderLeftWidth, top + height - paddingBottom - borderBottomWidth, width - paddingRight - paddingLeft - borderLeftWidth - borderRightWidth, paddingBottom).fill();
};
const getMargin = box => {
  const marginLeft = box.marginLeft === 'auto' ? 0 : box.marginLeft;
  const marginTop = box.marginTop === 'auto' ? 0 : box.marginTop;
  const marginRight = box.marginRight === 'auto' ? 0 : box.marginRight;
  const marginBottom = box.marginBottom === 'auto' ? 0 : box.marginBottom;
  return {
    marginLeft,
    marginTop,
    marginRight,
    marginBottom
  };
};
const debugMargin = (ctx, node) => {
  const {
    left,
    top,
    width,
    height
  } = node.box;
  const {
    marginLeft = 0,
    marginTop = 0,
    marginRight = 0,
    marginBottom = 0
  } = getMargin(node.box);
  ctx.fillColor(MARGIN_COLOR).opacity(0.5);

  // Margin top
  ctx.rect(left, top - marginTop, width, marginTop).fill();

  // Margin left
  ctx.rect(left - marginLeft, top - marginTop, marginLeft, height + marginTop + marginBottom).fill();

  // Margin right
  ctx.rect(left + width, top - marginTop, marginRight, height + marginTop + marginBottom).fill();

  // Margin bottom
  ctx.rect(left, top + height, width, marginBottom).fill();
};
const debugText = (ctx, node) => {
  const {
    left,
    top,
    width,
    height
  } = node.box;
  const {
    marginLeft = 0,
    marginTop = 0,
    marginRight = 0,
    marginBottom = 0
  } = getMargin(node.box);
  const roundedWidth = Math.round(width + marginLeft + marginRight);
  const roundedHeight = Math.round(height + marginTop + marginBottom);
  ctx.fontSize(6).opacity(1).fillColor('black').text(`${roundedWidth} x ${roundedHeight}`, left - marginLeft, Math.max(top - marginTop - 4, 1));
};
const debugOrigin = (ctx, node) => {
  if (node.origin) {
    ctx.circle(node.origin.left, node.origin.top, 3).fill('red').circle(node.origin.left, node.origin.top, 5).stroke('red');
  }
};
const renderDebug = (ctx, node) => {
  var _node$props;
  if (!((_node$props = node.props) !== null && _node$props !== void 0 && _node$props.debug)) return;
  ctx.save();
  debugContent(ctx, node);
  debugPadding(ctx, node);
  debugMargin(ctx, node);
  debugText(ctx, node);
  debugOrigin(ctx, node);
  ctx.restore();
};

const availableMethods = ['dash', 'clip', 'save', 'path', 'fill', 'font', 'text', 'rect', 'scale', 'moveTo', 'lineTo', 'stroke', 'rotate', 'circle', 'lineCap', 'opacity', 'ellipse', 'polygon', 'restore', 'lineJoin', 'fontSize', 'fillColor', 'lineWidth', 'translate', 'miterLimit', 'strokeColor', 'fillOpacity', 'roundedRect', 'fillAndStroke', 'strokeOpacity', 'bezierCurveTo', 'quadraticCurveTo', 'linearGradient', 'radialGradient'];
const painter = ctx => {
  const p = availableMethods.reduce((acc, prop) => ({
    ...acc,
    [prop]: function () {
      ctx[prop](...arguments);
      return p;
    }
  }), {});
  return p;
};
const renderCanvas = (ctx, node) => {
  const {
    top,
    left,
    width,
    height
  } = node.box;
  const paddingTop = node.box.paddingTop || 0;
  const paddingLeft = node.box.paddingLeft || 0;
  const paddingRight = node.box.paddingRight || 0;
  const paddingBottom = node.box.paddingBottom || 0;
  const availableWidth = width - paddingLeft - paddingRight;
  const availableHeight = height - paddingTop - paddingBottom;
  if (!availableWidth || !availableHeight) {
    console.warn('Canvas element has null width or height. Please provide valid values via the `style` prop in order to correctly render it.');
  }
  ctx.save().translate(left + paddingLeft, top + paddingTop);
  if (node.props.paint) {
    node.props.paint(painter(ctx), availableWidth, availableHeight);
  }
  ctx.restore();
};

// Ref: https://www.w3.org/TR/css-backgrounds-3/#borders

// This constant is used to approximate a symmetrical arc using a cubic Bezier curve.
const KAPPA = 4.0 * ((Math.sqrt(2) - 1.0) / 3.0);
const clipBorderTop = (ctx, layout, style, rtr, rtl) => {
  const {
    top,
    left,
    width,
    height
  } = layout;
  const {
    borderTopWidth,
    borderRightWidth,
    borderLeftWidth
  } = style;

  // Clip outer top border edge
  ctx.moveTo(left + rtl, top);
  ctx.lineTo(left + width - rtr, top);

  // Ellipse coefficients outer top right cap
  const c0 = rtr * (1.0 - KAPPA);

  // Clip outer top right cap
  ctx.bezierCurveTo(left + width - c0, top, left + width, top + c0, left + width, top + rtr);

  // Move down in case the margin exceedes the radius
  const topRightYCoord = top + Math.max(borderTopWidth, rtr);
  ctx.lineTo(left + width, topRightYCoord);

  // Clip inner top right cap
  ctx.lineTo(left + width - borderRightWidth, topRightYCoord);

  // Ellipse coefficients inner top right cap
  const innerTopRightRadiusX = Math.max(rtr - borderRightWidth, 0);
  const innerTopRightRadiusY = Math.max(rtr - borderTopWidth, 0);
  const c1 = innerTopRightRadiusX * (1.0 - KAPPA);
  const c2 = innerTopRightRadiusY * (1.0 - KAPPA);

  // Clip inner top right cap
  ctx.bezierCurveTo(left + width - borderRightWidth, top + borderTopWidth + c2, left + width - borderRightWidth - c1, top + borderTopWidth, left + width - borderRightWidth - innerTopRightRadiusX, top + borderTopWidth);

  // Clip inner top border edge
  ctx.lineTo(left + Math.max(rtl, borderLeftWidth), top + borderTopWidth);

  // Ellipse coefficients inner top left cap
  const innerTopLeftRadiusX = Math.max(rtl - borderLeftWidth, 0);
  const innerTopLeftRadiusY = Math.max(rtl - borderTopWidth, 0);
  const c3 = innerTopLeftRadiusX * (1.0 - KAPPA);
  const c4 = innerTopLeftRadiusY * (1.0 - KAPPA);
  const topLeftYCoord = top + Math.max(borderTopWidth, rtl);

  // Clip inner top left cap
  ctx.bezierCurveTo(left + borderLeftWidth + c3, top + borderTopWidth, left + borderLeftWidth, top + borderTopWidth + c4, left + borderLeftWidth, topLeftYCoord);
  ctx.lineTo(left, topLeftYCoord);

  // Move down in case the margin exceedes the radius
  ctx.lineTo(left, top + rtl);

  // Ellipse coefficients outer top left cap
  const c5 = rtl * (1.0 - KAPPA);

  // Clip outer top left cap
  ctx.bezierCurveTo(left, top + c5, left + c5, top, left + rtl, top);
  ctx.closePath();
  ctx.clip();

  // Clip border top cap joins
  if (borderRightWidth) {
    const trSlope = -borderTopWidth / borderRightWidth;
    ctx.moveTo(left + width / 2, trSlope * (-width / 2) + top);
    ctx.lineTo(left + width, top);
    ctx.lineTo(left, top);
    ctx.lineTo(left, top + height);
    ctx.closePath();
    ctx.clip();
  }
  if (borderLeftWidth) {
    const trSlope = -borderTopWidth / borderLeftWidth;
    ctx.moveTo(left + width / 2, trSlope * (-width / 2) + top);
    ctx.lineTo(left, top);
    ctx.lineTo(left + width, top);
    ctx.lineTo(left + width, top + height);
    ctx.closePath();
    ctx.clip();
  }
};
const fillBorderTop = (ctx, layout, style, rtr, rtl) => {
  const {
    top,
    left,
    width
  } = layout;
  const {
    borderTopColor,
    borderTopWidth,
    borderTopStyle,
    borderRightWidth,
    borderLeftWidth
  } = style;
  const c0 = rtl * (1.0 - KAPPA);
  const c1 = rtr * (1.0 - KAPPA);
  ctx.moveTo(left, top + Math.max(rtl, borderTopWidth));
  ctx.bezierCurveTo(left, top + c0, left + c0, top, left + rtl, top);
  ctx.lineTo(left + width - rtr, top);
  ctx.bezierCurveTo(left + width - c1, top, left + width, top + c1, left + width, top + rtr);
  ctx.strokeColor(borderTopColor);
  ctx.lineWidth(Math.max(borderRightWidth, borderTopWidth, borderLeftWidth) * 2);
  if (borderTopStyle === 'dashed') {
    ctx.dash(borderTopWidth * 2, {
      space: borderTopWidth * 1.2
    });
  } else if (borderTopStyle === 'dotted') {
    ctx.dash(borderTopWidth, {
      space: borderTopWidth * 1.2
    });
  }
  ctx.stroke();
  ctx.undash();
};
const clipBorderRight = (ctx, layout, style, rtr, rbr) => {
  const {
    top,
    left,
    width,
    height
  } = layout;
  const {
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth
  } = style;

  // Clip outer right border edge
  ctx.moveTo(left + width, top + rtr);
  ctx.lineTo(left + width, top + height - rbr);

  // Ellipse coefficients outer bottom right cap
  const c0 = rbr * (1.0 - KAPPA);

  // Clip outer top right cap
  ctx.bezierCurveTo(left + width, top + height - c0, left + width - c0, top + height, left + width - rbr, top + height);

  // Move left in case the margin exceedes the radius
  const topBottomXCoord = left + width - Math.max(borderRightWidth, rbr);
  ctx.lineTo(topBottomXCoord, top + height);

  // Clip inner bottom right cap
  ctx.lineTo(topBottomXCoord, top + height - borderBottomWidth);

  // Ellipse coefficients inner bottom right cap
  const innerBottomRightRadiusX = Math.max(rbr - borderRightWidth, 0);
  const innerBottomRightRadiusY = Math.max(rbr - borderBottomWidth, 0);
  const c1 = innerBottomRightRadiusX * (1.0 - KAPPA);
  const c2 = innerBottomRightRadiusY * (1.0 - KAPPA);

  // Clip inner top right cap
  ctx.bezierCurveTo(left + width - borderRightWidth - c1, top + height - borderBottomWidth, left + width - borderRightWidth, top + height - borderBottomWidth - c2, left + width - borderRightWidth, top + height - Math.max(rbr, borderBottomWidth));

  // Clip inner right border edge
  ctx.lineTo(left + width - borderRightWidth, top + Math.max(rtr, borderTopWidth));

  // Ellipse coefficients inner top right cap
  const innerTopRightRadiusX = Math.max(rtr - borderRightWidth, 0);
  const innerTopRightRadiusY = Math.max(rtr - borderTopWidth, 0);
  const c3 = innerTopRightRadiusX * (1.0 - KAPPA);
  const c4 = innerTopRightRadiusY * (1.0 - KAPPA);
  const topRightXCoord = left + width - Math.max(rtr, borderRightWidth);

  // Clip inner top left cap
  ctx.bezierCurveTo(left + width - borderRightWidth, top + borderTopWidth + c4, left + width - borderRightWidth - c3, top + borderTopWidth, topRightXCoord, top + borderTopWidth);
  ctx.lineTo(topRightXCoord, top);

  // Move right in case the margin exceedes the radius
  ctx.lineTo(left + width - rtr, top);

  // Ellipse coefficients outer top right cap
  const c5 = rtr * (1.0 - KAPPA);

  // Clip outer top right cap
  ctx.bezierCurveTo(left + width - c5, top, left + width, top + c5, left + width, top + rtr);
  ctx.closePath();
  ctx.clip();

  // Clip border right cap joins
  if (borderTopWidth) {
    const trSlope = -borderTopWidth / borderRightWidth;
    ctx.moveTo(left + width / 2, trSlope * (-width / 2) + top);
    ctx.lineTo(left + width, top);
    ctx.lineTo(left + width, top + height);
    ctx.lineTo(left, top + height);
    ctx.closePath();
    ctx.clip();
  }
  if (borderBottomWidth) {
    const brSlope = borderBottomWidth / borderRightWidth;
    ctx.moveTo(left + width / 2, brSlope * (-width / 2) + top + height);
    ctx.lineTo(left + width, top + height);
    ctx.lineTo(left + width, top);
    ctx.lineTo(left, top);
    ctx.closePath();
    ctx.clip();
  }
};
const fillBorderRight = (ctx, layout, style, rtr, rbr) => {
  const {
    top,
    left,
    width,
    height
  } = layout;
  const {
    borderRightColor,
    borderRightStyle,
    borderRightWidth,
    borderTopWidth,
    borderBottomWidth
  } = style;
  const c0 = rbr * (1.0 - KAPPA);
  const c1 = rtr * (1.0 - KAPPA);
  ctx.moveTo(left + width - rtr, top);
  ctx.bezierCurveTo(left + width - c1, top, left + width, top + c1, left + width, top + rtr);
  ctx.lineTo(left + width, top + height - rbr);
  ctx.bezierCurveTo(left + width, top + height - c0, left + width - c0, top + height, left + width - rbr, top + height);
  ctx.strokeColor(borderRightColor);
  ctx.lineWidth(Math.max(borderRightWidth, borderTopWidth, borderBottomWidth) * 2);
  if (borderRightStyle === 'dashed') {
    ctx.dash(borderRightWidth * 2, {
      space: borderRightWidth * 1.2
    });
  } else if (borderRightStyle === 'dotted') {
    ctx.dash(borderRightWidth, {
      space: borderRightWidth * 1.2
    });
  }
  ctx.stroke();
  ctx.undash();
};
const clipBorderBottom = (ctx, layout, style, rbl, rbr) => {
  const {
    top,
    left,
    width,
    height
  } = layout;
  const {
    borderBottomWidth,
    borderRightWidth,
    borderLeftWidth
  } = style;

  // Clip outer top border edge
  ctx.moveTo(left + width - rbr, top + height);
  ctx.lineTo(left + rbl, top + height);

  // Ellipse coefficients outer top right cap
  const c0 = rbl * (1.0 - KAPPA);

  // Clip outer top right cap
  ctx.bezierCurveTo(left + c0, top + height, left, top + height - c0, left, top + height - rbl);

  // Move up in case the margin exceedes the radius
  const bottomLeftYCoord = top + height - Math.max(borderBottomWidth, rbl);
  ctx.lineTo(left, bottomLeftYCoord);

  // Clip inner bottom left cap
  ctx.lineTo(left + borderLeftWidth, bottomLeftYCoord);

  // Ellipse coefficients inner top right cap
  const innerBottomLeftRadiusX = Math.max(rbl - borderLeftWidth, 0);
  const innerBottomLeftRadiusY = Math.max(rbl - borderBottomWidth, 0);
  const c1 = innerBottomLeftRadiusX * (1.0 - KAPPA);
  const c2 = innerBottomLeftRadiusY * (1.0 - KAPPA);

  // Clip inner bottom left cap
  ctx.bezierCurveTo(left + borderLeftWidth, top + height - borderBottomWidth - c2, left + borderLeftWidth + c1, top + height - borderBottomWidth, left + borderLeftWidth + innerBottomLeftRadiusX, top + height - borderBottomWidth);

  // Clip inner bottom border edge
  ctx.lineTo(left + width - Math.max(rbr, borderRightWidth), top + height - borderBottomWidth);

  // Ellipse coefficients inner top left cap
  const innerBottomRightRadiusX = Math.max(rbr - borderRightWidth, 0);
  const innerBottomRightRadiusY = Math.max(rbr - borderBottomWidth, 0);
  const c3 = innerBottomRightRadiusX * (1.0 - KAPPA);
  const c4 = innerBottomRightRadiusY * (1.0 - KAPPA);
  const bottomRightYCoord = top + height - Math.max(borderBottomWidth, rbr);

  // Clip inner top left cap
  ctx.bezierCurveTo(left + width - borderRightWidth - c3, top + height - borderBottomWidth, left + width - borderRightWidth, top + height - borderBottomWidth - c4, left + width - borderRightWidth, bottomRightYCoord);
  ctx.lineTo(left + width, bottomRightYCoord);

  // Move down in case the margin exceedes the radius
  ctx.lineTo(left + width, top + height - rbr);

  // Ellipse coefficients outer top left cap
  const c5 = rbr * (1.0 - KAPPA);

  // Clip outer top left cap
  ctx.bezierCurveTo(left + width, top + height - c5, left + width - c5, top + height, left + width - rbr, top + height);
  ctx.closePath();
  ctx.clip();

  // Clip border bottom cap joins
  if (borderRightWidth) {
    const brSlope = borderBottomWidth / borderRightWidth;
    ctx.moveTo(left + width / 2, brSlope * (-width / 2) + top + height);
    ctx.lineTo(left + width, top + height);
    ctx.lineTo(left, top + height);
    ctx.lineTo(left, top);
    ctx.closePath();
    ctx.clip();
  }
  if (borderLeftWidth) {
    const trSlope = -borderBottomWidth / borderLeftWidth;
    ctx.moveTo(left + width / 2, trSlope * (width / 2) + top + height);
    ctx.lineTo(left, top + height);
    ctx.lineTo(left + width, top + height);
    ctx.lineTo(left + width, top);
    ctx.closePath();
    ctx.clip();
  }
};
const fillBorderBottom = (ctx, layout, style, rbl, rbr) => {
  const {
    top,
    left,
    width,
    height
  } = layout;
  const {
    borderBottomColor,
    borderBottomStyle,
    borderBottomWidth,
    borderRightWidth,
    borderLeftWidth
  } = style;
  const c0 = rbl * (1.0 - KAPPA);
  const c1 = rbr * (1.0 - KAPPA);
  ctx.moveTo(left + width, top + height - rbr);
  ctx.bezierCurveTo(left + width, top + height - c1, left + width - c1, top + height, left + width - rbr, top + height);
  ctx.lineTo(left + rbl, top + height);
  ctx.bezierCurveTo(left + c0, top + height, left, top + height - c0, left, top + height - rbl);
  ctx.strokeColor(borderBottomColor);
  ctx.lineWidth(Math.max(borderBottomWidth, borderRightWidth, borderLeftWidth) * 2);
  if (borderBottomStyle === 'dashed') {
    ctx.dash(borderBottomWidth * 2, {
      space: borderBottomWidth * 1.2
    });
  } else if (borderBottomStyle === 'dotted') {
    ctx.dash(borderBottomWidth, {
      space: borderBottomWidth * 1.2
    });
  }
  ctx.stroke();
  ctx.undash();
};
const clipBorderLeft = (ctx, layout, style, rbl, rtl) => {
  const {
    top,
    left,
    width,
    height
  } = layout;
  const {
    borderTopWidth,
    borderLeftWidth,
    borderBottomWidth
  } = style;

  // Clip outer left border edge
  ctx.moveTo(left, top + height - rbl);
  ctx.lineTo(left, top + rtl);

  // Ellipse coefficients outer top left cap
  const c0 = rtl * (1.0 - KAPPA);

  // Clip outer top left cap
  ctx.bezierCurveTo(left, top + c0, left + c0, top, left + rtl, top);

  // Move right in case the margin exceedes the radius
  const topLeftCoordX = left + Math.max(borderLeftWidth, rtl);
  ctx.lineTo(topLeftCoordX, top);

  // Clip inner top left cap
  ctx.lineTo(topLeftCoordX, top + borderTopWidth);

  // Ellipse coefficients inner top left cap
  const innerTopLeftRadiusX = Math.max(rtl - borderLeftWidth, 0);
  const innerTopLeftRadiusY = Math.max(rtl - borderTopWidth, 0);
  const c1 = innerTopLeftRadiusX * (1.0 - KAPPA);
  const c2 = innerTopLeftRadiusY * (1.0 - KAPPA);

  // Clip inner top right cap
  ctx.bezierCurveTo(left + borderLeftWidth + c1, top + borderTopWidth, left + borderLeftWidth, top + borderTopWidth + c2, left + borderLeftWidth, top + Math.max(rtl, borderTopWidth));

  // Clip inner left border edge
  ctx.lineTo(left + borderLeftWidth, top + height - Math.max(rbl, borderBottomWidth));

  // Ellipse coefficients inner bottom left cap
  const innerBottomLeftRadiusX = Math.max(rbl - borderLeftWidth, 0);
  const innerBottomLeftRadiusY = Math.max(rbl - borderBottomWidth, 0);
  const c3 = innerBottomLeftRadiusX * (1.0 - KAPPA);
  const c4 = innerBottomLeftRadiusY * (1.0 - KAPPA);
  const bottomLeftXCoord = left + Math.max(rbl, borderLeftWidth);

  // Clip inner top left cap
  ctx.bezierCurveTo(left + borderLeftWidth, top + height - borderBottomWidth - c4, left + borderLeftWidth + c3, top + height - borderBottomWidth, bottomLeftXCoord, top + height - borderBottomWidth);
  ctx.lineTo(bottomLeftXCoord, top + height);

  // Move left in case the margin exceedes the radius
  ctx.lineTo(left + rbl, top + height);

  // Ellipse coefficients outer top right cap
  const c5 = rbl * (1.0 - KAPPA);

  // Clip outer top right cap
  ctx.bezierCurveTo(left + c5, top + height, left, top + height - c5, left, top + height - rbl);
  ctx.closePath();
  ctx.clip();

  // Clip border right cap joins
  if (borderBottomWidth) {
    const trSlope = -borderBottomWidth / borderLeftWidth;
    ctx.moveTo(left + width / 2, trSlope * (width / 2) + top + height);
    ctx.lineTo(left, top + height);
    ctx.lineTo(left, top);
    ctx.lineTo(left + width, top);
    ctx.closePath();
    ctx.clip();
  }
  if (borderBottomWidth) {
    const trSlope = -borderTopWidth / borderLeftWidth;
    ctx.moveTo(left + width / 2, trSlope * (-width / 2) + top);
    ctx.lineTo(left, top);
    ctx.lineTo(left, top + height);
    ctx.lineTo(left + width, top + height);
    ctx.closePath();
    ctx.clip();
  }
};
const fillBorderLeft = (ctx, layout, style, rbl, rtl) => {
  const {
    top,
    left,
    height
  } = layout;
  const {
    borderLeftColor,
    borderLeftStyle,
    borderLeftWidth,
    borderTopWidth,
    borderBottomWidth
  } = style;
  const c0 = rbl * (1.0 - KAPPA);
  const c1 = rtl * (1.0 - KAPPA);
  ctx.moveTo(left + rbl, top + height);
  ctx.bezierCurveTo(left + c0, top + height, left, top + height - c0, left, top + height - rbl);
  ctx.lineTo(left, top + rtl);
  ctx.bezierCurveTo(left, top + c1, left + c1, top, left + rtl, top);
  ctx.strokeColor(borderLeftColor);
  ctx.lineWidth(Math.max(borderLeftWidth, borderTopWidth, borderBottomWidth) * 2);
  if (borderLeftStyle === 'dashed') {
    ctx.dash(borderLeftWidth * 2, {
      space: borderLeftWidth * 1.2
    });
  } else if (borderLeftStyle === 'dotted') {
    ctx.dash(borderLeftWidth, {
      space: borderLeftWidth * 1.2
    });
  }
  ctx.stroke();
  ctx.undash();
};
const shouldRenderBorders = node => node.box && (node.box.borderTopWidth || node.box.borderRightWidth || node.box.borderBottomWidth || node.box.borderLeftWidth);
const renderBorders = (ctx, node) => {
  if (!shouldRenderBorders(node)) return;
  const {
    width,
    height,
    borderTopWidth,
    borderLeftWidth,
    borderRightWidth,
    borderBottomWidth
  } = node.box;
  const {
    opacity,
    borderTopLeftRadius = 0,
    borderTopRightRadius = 0,
    borderBottomLeftRadius = 0,
    borderBottomRightRadius = 0,
    borderTopColor = 'black',
    borderTopStyle = 'solid',
    borderLeftColor = 'black',
    borderLeftStyle = 'solid',
    borderRightColor = 'black',
    borderRightStyle = 'solid',
    borderBottomColor = 'black',
    borderBottomStyle = 'solid'
  } = node.style;
  const style = {
    borderTopColor,
    borderTopWidth,
    borderTopStyle,
    borderLeftColor,
    borderLeftWidth,
    borderLeftStyle,
    borderRightColor,
    borderRightWidth,
    borderRightStyle,
    borderBottomColor,
    borderBottomWidth,
    borderBottomStyle,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius
  };
  const rtr = Math.min(borderTopRightRadius, 0.5 * width, 0.5 * height);
  const rtl = Math.min(borderTopLeftRadius, 0.5 * width, 0.5 * height);
  const rbr = Math.min(borderBottomRightRadius, 0.5 * width, 0.5 * height);
  const rbl = Math.min(borderBottomLeftRadius, 0.5 * width, 0.5 * height);
  ctx.save();
  ctx.strokeOpacity(opacity);
  if (borderTopWidth) {
    ctx.save();
    clipBorderTop(ctx, node.box, style, rtr, rtl);
    fillBorderTop(ctx, node.box, style, rtr, rtl);
    ctx.restore();
  }
  if (borderRightWidth) {
    ctx.save();
    clipBorderRight(ctx, node.box, style, rtr, rbr);
    fillBorderRight(ctx, node.box, style, rtr, rbr);
    ctx.restore();
  }
  if (borderBottomWidth) {
    ctx.save();
    clipBorderBottom(ctx, node.box, style, rbl, rbr);
    fillBorderBottom(ctx, node.box, style, rbl, rbr);
    ctx.restore();
  }
  if (borderLeftWidth) {
    ctx.save();
    clipBorderLeft(ctx, node.box, style, rbl, rtl);
    fillBorderLeft(ctx, node.box, style, rbl, rtl);
    ctx.restore();
  }
  ctx.restore();
};

const drawBackground = (ctx, node) => {
  var _node$style;
  const {
    top,
    left,
    width,
    height
  } = node.box;
  const color = parseColor(node.style.backgroundColor);
  const nodeOpacity = isNil((_node$style = node.style) === null || _node$style === void 0 ? void 0 : _node$style.opacity) ? 1 : node.style.opacity;
  const opacity = Math.min(color.opacity, nodeOpacity);
  ctx.fillOpacity(opacity).fillColor(color.value).rect(left, top, width, height).fill();
};
const renderBackground = (ctx, node) => {
  var _node$style2;
  const hasBackground = !!node.box && !!((_node$style2 = node.style) !== null && _node$style2 !== void 0 && _node$style2.backgroundColor);
  if (hasBackground) {
    ctx.save();
    clipNode(ctx, node);
    drawBackground(ctx, node);
    ctx.restore();
  }
};

const isSrcId = value => /^#.+/.test(value);
const setLink = (ctx, node) => {
  const props = node.props || {};
  const {
    top,
    left,
    width,
    height
  } = node.box;
  const src = props.src || props.href;
  if (src) {
    const isId = isSrcId(src);
    const method = isId ? 'goTo' : 'link';
    const value = isId ? src.slice(1) : src;
    ctx[method](left, top, width, height, value);
  }
};

const setDestination = (ctx, node) => {
  var _node$props;
  if ((_node$props = node.props) !== null && _node$props !== void 0 && _node$props.id) {
    ctx.addNamedDestination(node.props.id, 'XYZ', ctx._ctm[4] + node.box.left, ctx._ctm[5] - node.box.top, null);
  }
};

const isRecursiveNode = node => node.type !== P.Text && node.type !== P.Svg;
const renderChildren = (ctx, node, options) => {
  ctx.save();
  if (node.box) {
    ctx.translate(node.box.left, node.box.top);
  }
  const children = node.children || [];
  const renderChild = child => renderNode(ctx, child, options);
  children.forEach(renderChild);
  ctx.restore();
};
const renderFns = {
  [P.Text]: renderText,
  [P.Note]: renderNote,
  [P.Image]: renderImage,
  [P.Canvas]: renderCanvas,
  [P.Svg]: renderSvg,
  [P.Link]: setLink
};
const renderNode = (ctx, node, options) => {
  var _node$style;
  const overflowHidden = ((_node$style = node.style) === null || _node$style === void 0 ? void 0 : _node$style.overflow) === 'hidden';
  const shouldRenderChildren = isRecursiveNode(node);
  if (node.type === P.Page) renderPage(ctx, node);
  ctx.save();
  if (overflowHidden) clipNode(ctx, node);
  applyTransformations(ctx, node);
  renderBackground(ctx, node);
  renderBorders(ctx, node);
  const renderFn = renderFns[node.type];
  if (renderFn) renderFn(ctx, node, options);
  if (shouldRenderChildren) renderChildren(ctx, node, options);
  setDestination(ctx, node);
  renderDebug(ctx, node);
  ctx.restore();
};

/* eslint-disable no-param-reassign */

const setPDFMetadata = target => (key, value) => {
  if (value) target.info[key] = value;
};

/**
 * Set document instance metadata
 *
 * @param {Object} ctx document instance
 * @param {Object} doc document root
 */
const addMetadata = (ctx, doc) => {
  const setProp = setPDFMetadata(ctx);
  const props = doc.props || {};
  const title = props.title || null;
  const author = props.author || null;
  const subject = props.subject || null;
  const keywords = props.keywords || null;
  const creator = props.creator ?? 'react-pdf';
  const producer = props.producer ?? 'react-pdf';
  const creationDate = props.creationDate || new Date();
  const modificationDate = props.modificationDate || null;
  setProp('Title', title);
  setProp('Author', author);
  setProp('Subject', subject);
  setProp('Keywords', keywords);
  setProp('Creator', creator);
  setProp('Producer', producer);
  setProp('CreationDate', creationDate);
  setProp('ModificationDate', modificationDate);
};

/* eslint-disable no-param-reassign */

const addNodeBookmark = (ctx, node, pageNumber, registry) => {
  var _node$props;
  const bookmark = (_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.bookmark;
  if (bookmark) {
    const {
      title,
      parent,
      expanded,
      zoom,
      fit
    } = bookmark;
    const outline = registry[parent] || ctx.outline;
    const top = bookmark.top || node.box.top;
    const left = bookmark.left || node.box.left;
    const instance = outline.addItem(title, {
      pageNumber,
      expanded,
      top,
      left,
      zoom,
      fit
    });
    registry[bookmark.ref] = instance;
  }
  if (!node.children) return;
  node.children.forEach(child => addNodeBookmark(ctx, child, pageNumber, registry));
};
const addBookmarks = (ctx, root) => {
  const registry = {};
  const pages = root.children || [];
  pages.forEach((page, i) => {
    addNodeBookmark(ctx, page, i, registry);
  });
};

const render = (ctx, doc) => {
  const pages = doc.children || [];
  const options = {
    imageCache: new Map()
  };
  addMetadata(ctx, doc);
  pages.forEach(page => renderNode(ctx, page, options));
  addBookmarks(ctx, doc);
  ctx.end();
  return ctx;
};

export { render as default };
