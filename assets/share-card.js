/* Suggestion cards are rendered locally; no content is sent to another service. */
(() => {
  'use strict';
  const INK = '#153E35', PAPER = '#F7F5EE', MUTED = '#66766C', GOLD = '#A58B58';
  const sans = '"PingFang SC", "Microsoft YaHei", sans-serif';
  const serif = '"Songti SC", "Noto Serif CJK SC", serif';

  function lines(ctx, text, width) {
    const result = [];
    for (const paragraph of String(text).split('\n')) {
      let line = '';
      for (const char of paragraph) {
        if (line && ctx.measureText(line + char).width > width) {
          result.push(line); line = '';
        }
        line += char;
      }
      result.push(line);
    }
    return result;
  }

  async function create(e, options) {
    if (!window.qrcodegen) throw new Error('二维码组件未加载，请刷新后重试');
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('浏览器暂不支持生成图片');
    const width = 1080, pad = 80, contentWidth = width - pad * 2;
    ctx.font = `600 54px ${serif}`;
    const title = lines(ctx, options.title, contentWidth);
    ctx.font = `32px ${sans}`;
    const summary = lines(ctx, options.summary, contentWidth);
    ctx.font = `25px ${sans}`;
    const audience = options.audience ? lines(ctx, `适用：${options.audience}`, contentWidth) : [];
    const contentBottom = 218 + title.length * 80 + 88 + summary.length * 53 + 70;
    const footerTop = contentBottom + 145 + audience.length * 40 + (e.dis ? 48 : 0) + 54;
    canvas.width = width; canvas.height = Math.max(1500, footerTop + 370);
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, width, canvas.height);
    function text(value, x, y, font, color = INK) {
      ctx.font = font; ctx.fillStyle = color; ctx.fillText(value, x, y);
    }
    function rule(y) {
      ctx.fillStyle = '#CFD2C6'; ctx.fillRect(pad, y, contentWidth, 1.5);
    }
    text('L I V I N G  /  N O T E S', pad, 77, '23px sans-serif');
    text('高性价比人生指南', 735, 77, `25px ${sans}`);
    rule(112);
    text(`第 ${e.c} 节 · 第 ${e.n} 条`, pad, 171, `25px ${sans}`, GOLD);
    let y = 245;
    for (const line of title) { text(line, pad, y, `600 54px ${serif}`); y += 80; }
    y += 25;
    ctx.fillStyle = GOLD; ctx.fillRect(pad, y, 54, 4);
    y += 65;
    for (const line of summary) { text(line, pad, y, `32px ${sans}`); y += 53; }
    y = contentBottom;
    rule(y); y += 56;
    for (const [i, label] of options.costs.entries()) {
      text(['金钱成本', '时间成本', '毅力成本'][i], pad + i * 310, y, `22px ${sans}`, MUTED);
      text(label, pad + i * 310, y + 45, `29px ${sans}`);
    }
    y += 106;
    for (const line of audience) { text(line, pad, y, `25px ${sans}`, MUTED); y += 40; }
    if (e.dis) { text('有争议 · 请先查看原文中的适用范围与备注', pad, y + 4, `25px ${sans}`, '#805719'); y += 48; }
    text(`原文标注：${e.gr} 级证据`, pad, y + 4, `24px ${sans}`, MUTED);

    const foot = canvas.height - 370;
    ctx.fillStyle = INK; ctx.fillRect(0, foot, width, 370);
    text('一条建议，一点改变。', pad, foot + 80, `38px ${serif}`, PAPER);
    text('长按识别 · 查看这一条', pad, foot + 138, `26px ${sans}`, '#E0E6DC');
    text('适用范围、争议与原始出处请扫码查看', pad, foot + 192, `22px ${sans}`, '#BDCDC2');
    text('内容可能过时，请结合实际情况判断', pad, foot + 230, `22px ${sans}`, '#BDCDC2');
    text('内容：eternity4719/HowToLiveBetter · CC BY 4.0', pad, foot + 294, '19px sans-serif', '#BDCDC2');
    text(`摘录与重排 · 数据版本 ${options.version}`, pad, foot + 328, `19px ${sans}`, '#BDCDC2');

    const qr = qrcodegen.QrCode.encodeText(options.url, qrcodegen.QrCode.Ecc.HIGH);
    const scale = Math.floor(288 / (qr.size + 8)), size = (qr.size + 8) * scale;
    const qx = width - pad - size, qy = foot + 42;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(qx, qy, size, size);
    ctx.fillStyle = '#153E35';
    for (let row = 0; row < qr.size; row++) {
      for (let col = 0; col < qr.size; col++) {
        if (qr.getModule(col, row)) ctx.fillRect(qx + (col + 4) * scale, qy + (row + 4) * scale, scale, scale);
      }
    }
    const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('图片生成失败，请重试')), 'image/png'));
    return { blob, dataUrl: canvas.toDataURL('image/png'), name: `人生指南-${e.id}.png` };
  }
  window.HLBShare = { create };
})();
