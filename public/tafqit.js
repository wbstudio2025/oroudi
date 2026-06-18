/* تفقيط — converting an amount into formal Arabic words for official documents.
   Kept in its own file (no DOM access) so the same code runs in the browser and
   in the Node test suite. */

const TAFQIT_ONES = [
  "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
  "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر",
  "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"
];

const TAFQIT_TENS = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];

const TAFQIT_HUNDREDS = [
  "", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة",
  "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"
];

// Scales beyond thousands follow the Arabic dual/plural rules: 1 → singular,
// 2 → dual, 3-10 → counted plural, 11+ → singular again (تمييز مفرد).
const TAFQIT_SCALES = [
  { single: "ألف", dual: "ألفان", plural: "آلاف" },
  { single: "مليون", dual: "مليونان", plural: "ملايين" },
  { single: "مليار", dual: "ملياران", plural: "مليارات" }
];

function tafqitThreeDigits(number) {
  const hundreds = Math.floor(number / 100);
  const rest = number % 100;
  const parts = [];

  if (hundreds) {
    parts.push(TAFQIT_HUNDREDS[hundreds]);
  }

  if (rest) {
    if (rest < 20) {
      parts.push(TAFQIT_ONES[rest]);
    } else {
      const unit = rest % 10;
      const ten = Math.floor(rest / 10);
      parts.push(unit ? `${TAFQIT_ONES[unit]} و${TAFQIT_TENS[ten]}` : TAFQIT_TENS[ten]);
    }
  }

  return parts.join(" و");
}

function tafqitScaleGroup(count, scale) {
  if (count === 1) {
    return scale.single;
  }

  if (count === 2) {
    return scale.dual;
  }

  if (count >= 3 && count <= 10) {
    return `${tafqitThreeDigits(count)} ${scale.plural}`;
  }

  return `${tafqitThreeDigits(count)} ${scale.single}`;
}

// Integer → Arabic words, e.g. 75500 → "خمسة وسبعون ألف وخمسمائة".
function tafqitInteger(value) {
  let number = Math.floor(Math.abs(Number(value) || 0));

  if (!number) {
    return "";
  }

  if (number >= 1e12) {
    return ""; // beyond supported scales; caller falls back to manual entry
  }

  const groups = [];
  let scaleIndex = -1;

  while (number > 0) {
    const group = number % 1000;

    if (group) {
      groups.unshift(scaleIndex === -1 ? tafqitThreeDigits(group) : tafqitScaleGroup(group, TAFQIT_SCALES[scaleIndex]));
    }

    number = Math.floor(number / 1000);
    scaleIndex += 1;
  }

  return groups.join(" و");
}

// Amount → the formal sentence used on quotations, e.g.
// 75500 → "خمسة وسبعون ألف وخمسمائة ريال سعودي فقط لا غير".
// Fils/halalas come from the decimal part (rounded to 2 digits).
function tafqitRiyals(amount) {
  const value = Math.abs(Number(amount) || 0);

  if (!value) {
    return "";
  }

  const riyals = Math.floor(value);
  const halalas = Math.round((value - riyals) * 100);
  const parts = [];

  if (riyals) {
    const words = tafqitInteger(riyals);

    if (!words) {
      return "";
    }

    parts.push(`${words} ريال سعودي`);
  }

  if (halalas) {
    parts.push(`${tafqitInteger(halalas)} هللة`);
  }

  return `${parts.join(" و")} فقط لا غير`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { tafqitRiyals, tafqitInteger };
}
